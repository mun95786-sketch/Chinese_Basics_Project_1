import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되어 있지 않습니다. Settings > Secrets 패널을 확인해 주세요.");
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: "v1beta",
    httpOptions: {
      timeout: 12000,
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function isDailyQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return msg.includes("PerDay") || msg.includes("per day");
}

function isTransientError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (isDailyQuotaError(err)) {
    return false;
  }
  return (
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("timeout")
  );
}

function shouldFallbackModel(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return (
    isTransientError(err) ||
    isDailyQuotaError(err) ||
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("504") ||
    msg.includes("DEADLINE_EXCEEDED")
  );
}

function formatGeminiError(err: unknown, fallbackMessage: string): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  if (raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED")) {
    return {
      status: 429,
      message:
        "현재 무료 Gemini API 할당량을 초과했습니다. 잠시 후 다시 시도하거나 Settings > Secrets 패널에서 결제 연동 API 키를 선택해 주세요.",
    };
  }
  if (raw.includes("403") || raw.includes("PERMISSION_DENIED") || raw.includes("API_KEY_INVALID")) {
    return {
      status: 403,
      message:
        "Gemini API 키 인증에 실패했습니다. Settings > Secrets 패널에서 API 키를 확인해 주세요.",
    };
  }
  if (raw.includes("503") || raw.includes("UNAVAILABLE")) {
    return {
      status: 503,
      message: "AI 서버가 일시적으로 혼잡합니다. 잠시 후 다시 시도해 주세요.",
    };
  }
  if (
    raw.includes("504") ||
    raw.includes("DEADLINE_EXCEEDED") ||
    raw.includes("timeout") ||
    raw.includes("ETIMEDOUT") ||
    raw.includes("aborted")
  ) {
    return {
      status: 504,
      message: "AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
  return {
    status: 500,
    message: raw || fallbackMessage,
  };
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts && isTransientError(err)) {
        const delayMs = 600 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// In-memory LRU-style cache for generated TTS WAV base64 strings
const ttsCache = new Map<string, string>();
const MAX_TTS_CACHE = 300;

function setTtsCache(key: string, value: string) {
  if (ttsCache.size >= MAX_TTS_CACHE) {
    const firstKey = ttsCache.keys().next().value;
    if (firstKey !== undefined) {
      ttsCache.delete(firstKey);
    }
  }
  ttsCache.set(key, value);
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Mandarin Chinese Text-to-Speech via Gemini 3.8 Flash Lite TTS
  app.post("/api/tts", async (req, res) => {
    try {
      const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
      const rate = typeof req.body?.rate === "number" ? req.body.rate : 1.0;

      if (!text) {
        res.status(400).json({ error: "발음할 중국어 텍스트가 비어 있습니다." });
        return;
      }

      const speedBucket = rate < 1 ? "slow" : "normal";
      const cacheKey = `${text}::${speedBucket}`;
      const cached = ttsCache.get(cacheKey);
      if (cached) {
        res.json({ audioBase64: cached, mimeType: "audio/wav" });
        return;
      }

      const ai = getAiClient();
      const stylePrompt =
        speedBucket === "slow"
          ? "Standard Mandarin Chinese (zh-CN) teacher speaking slowly, clearly, and distinctly with accurate tones."
          : "Standard Mandarin Chinese (zh-CN) native speaker with clear, natural standard Beijing pronunciation.";

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: "gemini-3.8-flash-lite-tts",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text,
                  speechMetadata: {
                    style: stylePrompt,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Kore" },
              },
            },
          },
        })
      );

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const audioPart = parts.find((p) => p.inlineData?.data);
      const audioBase64 = audioPart?.inlineData?.data;

      if (!audioBase64) {
        res.status(502).json({ error: "음성 데이터를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요." });
        return;
      }

      setTtsCache(cacheKey, audioBase64);
      res.json({ audioBase64, mimeType: audioPart?.inlineData?.mimeType || "audio/wav" });
    } catch (err) {
      const formatted = formatGeminiError(err, "음성 생성 중 오류가 발생했습니다.");
      console.error("TTS error:", err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Mandarin Chinese Speaking Check (Audio Transcription + Pronunciation Evaluation)
  app.post("/api/speech-check", async (req, res) => {
    try {
      const audioBase64 = typeof req.body?.audioBase64 === "string" ? req.body.audioBase64 : "";
      const rawMimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "audio/webm";
      const targetZh = typeof req.body?.targetZh === "string" ? req.body.targetZh.trim() : "";
      const targetPinyin = typeof req.body?.targetPinyin === "string" ? req.body.targetPinyin.trim() : "";
      const targetKo = typeof req.body?.targetKo === "string" ? req.body.targetKo.trim() : "";

      if (!audioBase64 || !targetZh) {
        res.status(400).json({ error: "녹음된 음성과 목표 중국어 문장이 필요합니다." });
        return;
      }

      // Normalize codec parameters (e.g. "audio/webm;codecs=opus" -> "audio/webm")
      const cleanMimeType = rawMimeType.split(";")[0].trim() || "audio/webm";

      const ai = getAiClient();

      const promptText = `You are a Mandarin Chinese pronunciation coach for a Korean learner.
Target Mandarin phrase: "${targetZh}" (Pinyin: ${targetPinyin}, Korean meaning: ${targetKo})

Listen carefully to the user's recorded audio and evaluate it:
1. Transcribe accurately what the speaker actually said in Simplified Chinese characters (简体字) into "recognizedText", and its Hanyu Pinyin with tone marks into "recognizedPinyin". If there is no audible speech (only silence or noise), set "recognizedText" to "", "recognizedPinyin" to "", "score" to 0, and "isCorrect" to false.
2. Compare what was spoken against the target "${targetZh}" (${targetPinyin}), considering pronunciation, tones (성조), and completeness.
3. Set "score" from 0 to 100 and "isCorrect" to true if score >= 75.
4. Write clear, encouraging feedback in Korean ("feedback", 1-2 sentences) and one short practical pronunciation/tone tip in Korean ("tip", 1 sentence).`;

      const audioContents = [
        {
          role: "user" as const,
          parts: [
            {
              inlineData: {
                mimeType: cleanMimeType,
                data: audioBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ];

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          isCorrect: {
            type: Type.BOOLEAN,
            description: "Whether the spoken Mandarin matches the target phrase sufficiently (score >= 75).",
          },
          score: {
            type: Type.INTEGER,
            description: "Accuracy score from 0 to 100.",
          },
          recognizedText: {
            type: Type.STRING,
            description: "The Simplified Chinese text actually heard in the audio (empty string if no speech).",
          },
          recognizedPinyin: {
            type: Type.STRING,
            description: "Hanyu Pinyin with tone marks for recognizedText (empty string if no speech).",
          },
          feedback: {
            type: Type.STRING,
            description: "Clear, encouraging evaluation feedback in Korean (1-2 sentences).",
          },
          tip: {
            type: Type.STRING,
            description: "Short practical pronunciation or tone tip in Korean (1 sentence).",
          },
        },
        required: [
          "isCorrect",
          "score",
          "recognizedText",
          "recognizedPinyin",
          "feedback",
          "tip",
        ],
      };

      let evalResp;
      try {
        evalResp = await withRetry(
          () =>
            ai.models.generateContent({
              model: "gemini-4-hydrogen",
              contents: audioContents,
              config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseMimeType: "application/json",
                responseSchema,
              },
            }),
          2
        );
      } catch (primaryErr) {
        if (!shouldFallbackModel(primaryErr)) {
          throw primaryErr;
        }
        evalResp = await withRetry(
          () =>
            ai.models.generateContent({
              model: "gemini-3.1-flash-lite",
              contents: audioContents,
              config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
                responseMimeType: "application/json",
                responseSchema,
              },
            }),
          2
        );
      }

      const rawJson = (evalResp.text ?? "{}").trim();
      const parsed = JSON.parse(rawJson);

      res.json({
        isCorrect: Boolean(parsed.isCorrect),
        score: typeof parsed.score === "number" ? Math.max(0, Math.min(100, parsed.score)) : 0,
        recognizedText: typeof parsed.recognizedText === "string" ? parsed.recognizedText : "",
        recognizedPinyin: typeof parsed.recognizedPinyin === "string" ? parsed.recognizedPinyin : "",
        feedback: typeof parsed.feedback === "string" ? parsed.feedback : "발음 평가를 완료했습니다.",
        tip: typeof parsed.tip === "string" ? parsed.tip : "",
      });
    } catch (err) {
      const formatted = formatGeminiError(err, "말하기 채점 중 오류가 발생했습니다.");
      console.error("Speech check error:", err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Exam Wrong-Answer Deep Explanation & Follow-up Tutor
  app.post("/api/exam-explain", async (req, res) => {
    try {
      const examType = typeof req.body?.examType === "string" ? req.body.examType : "suneung";
      const subLabel = typeof req.body?.subLabel === "string" ? req.body.subLabel : "";
      const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
      const passage = typeof req.body?.passage === "string" ? req.body.passage.trim() : "";
      const options = Array.isArray(req.body?.options) ? req.body.options : [];
      const selectedIndex = typeof req.body?.selectedIndex === "number" ? req.body.selectedIndex : -1;
      const correctIndex = typeof req.body?.correctIndex === "number" ? req.body.correctIndex : 0;
      const userQuestion = typeof req.body?.userQuestion === "string" ? req.body.userQuestion.trim() : "";

      if (!question || options.length === 0) {
        res.status(400).json({ error: "풀이할 문제 정보가 부족합니다." });
        return;
      }

      const examLabel =
        examType === "suneung"
          ? "수능 중국어Ⅰ"
          : examType === "naesin"
          ? "고등학교 내신 중국어"
          : "HSK 중국어능력시험";

      const formattedOptions = options
        .map((o: { label?: string }, idx: number) => `${idx + 1}. ${o?.label ?? ""}`)
        .join("\n");

      const selectedLabel = options[selectedIndex]?.label ?? "선택 없음";
      const correctLabel = options[correctIndex]?.label ?? "";

      const prompt = `당신은 한국인 학생을 가르치는 베테랑 ${examLabel} 전문 강사입니다.
아래 문제에서 학생이 틀렸거나 심화 풀이를 요청했습니다. 한국어로 친절하고 명확하게 오답 풀이를 해주세요.

[시험 유형] ${examLabel} (${subLabel})
[문제] ${question}
${passage ? `[지문] ${passage}` : ""}
[선택지]
${formattedOptions}

[학생이 고른 답] ${selectedIndex >= 0 ? `${selectedIndex + 1}번: ${selectedLabel}` : "없음"}
[실제 정답] ${correctIndex + 1}번: ${correctLabel}
${userQuestion ? `[학생의 추가 질문] ${userQuestion}` : ""}

요청사항:
1. whyWrong: 학생이 고른 선택지(${selectedIndex + 1}번)가 왜 오답인지, 어떤 함정·문법·성조·어휘 착각 때문에 틀렸는지 구체적으로 설명 (정답을 맞힌 경우에도 왜 헷갈리기 쉬운지 핵심 비교)
2. whyCorrect: 정답(${correctIndex + 1}번)이 맞는 핵심 이유와 시험 출제 포인트
3. examples: 관련 문법/어휘를 확실히 익힐 수 있는 실용 중국어 예문 2개 (zh 간체자, 성조 포함 pinyin, 한국어 해석 ko)
4. extraAnswer: ${userQuestion ? "학생의 추가 질문에 대한 직접적인 답변" : "시험장에서 실수하지 않는 실전 꿀팁 1~2문장"}`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          whyWrong: { type: Type.STRING },
          whyCorrect: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                zh: { type: Type.STRING },
                pinyin: { type: Type.STRING },
                ko: { type: Type.STRING },
              },
              required: ["zh", "pinyin", "ko"],
            },
          },
          extraAnswer: { type: Type.STRING },
        },
        required: ["whyWrong", "whyCorrect", "examples", "extraAnswer"],
      };

      const ai = getAiClient();
      let aiResp;
      try {
        aiResp = await withRetry(
          () =>
            ai.models.generateContent({
              model: "gemini-4-hydrogen",
              contents: prompt,
              config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseMimeType: "application/json",
                responseSchema,
              },
            }),
          2
        );
      } catch (primaryErr) {
        if (!shouldFallbackModel(primaryErr)) throw primaryErr;
        aiResp = await withRetry(
          () =>
            ai.models.generateContent({
              model: "gemini-3.1-flash-lite",
              contents: prompt,
              config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
                responseMimeType: "application/json",
                responseSchema,
              },
            }),
          2
        );
      }

      const parsed = JSON.parse((aiResp.text ?? "{}").trim());
      res.json({
        whyWrong: typeof parsed.whyWrong === "string" ? parsed.whyWrong : "",
        whyCorrect: typeof parsed.whyCorrect === "string" ? parsed.whyCorrect : "",
        examples: Array.isArray(parsed.examples) ? parsed.examples.slice(0, 3) : [],
        extraAnswer: typeof parsed.extraAnswer === "string" ? parsed.extraAnswer : "",
      });
    } catch (err) {
      const formatted = formatGeminiError(err, "AI 상세 풀이 생성 중 오류가 발생했습니다.");
      console.error("Exam explain error:", err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Generate Fresh Mock Exam Questions (수능 / 내신 / HSK)
  app.post("/api/exam-generate", async (req, res) => {
    try {
      const examType =
        req.body?.examType === "naesin" || req.body?.examType === "hsk"
          ? req.body.examType
          : "suneung";
      const hskBand = typeof req.body?.hskBand === "string" ? req.body.hskBand : "전체";

      const optionCount = examType === "hsk" ? 4 : 5;
      const trackInstruction =
        examType === "suneung"
          ? "대한민국 대학수학능력시험(수능) 제2외국어 중국어Ⅰ 스타일 5지선다 4문제 (성조/변조, 어휘·양사, 회화 추론, 핵심 어법, 문화 중 서로 다른 영역 4개 출제)"
          : examType === "naesin"
          ? "대한민국 고등학교 중국어 내신 중간·기말고사 스타일 5지선다 4문제 (병음 표기 규칙, 성조 변화, 어순·부정문·조동사 어법, 상황 대화 중 서로 다른 영역 4개 출제)"
          : `중국어능력시험 HSK(${hskBand === "전체" ? "1~6급 골고루" : hskBand}) 스타일 4지선다 4문제 (빈칸 어휘·보어·접속사 호응·어법 오류 찾기 등 실제 HSK 유형)`;

      const prompt = `당신은 한국 수험생을 위한 중국어 시험 출제위원입니다.
${trackInstruction}를 새롭게 출제하세요.

반드시 지킬 규칙:
1. 모든 중국어는 반드시 간체자(简体字)로 작성하고, 병음(pinyin)은 정확한 성조 기호(ā á ǎ à 등)를 포함하세요.
2. 각 문제는 반드시 정확히 ${optionCount}개의 선택지(options)를 가지며, 정답은 단 하나(correctIndex: 0 ~ ${optionCount - 1})여야 합니다.
3. 발음·성조·병음 규칙 문제인 경우에만 hidePinyinInitially를 true로 설정하고, 지문이나 선택지에서 정답 병음이 바로 노출되지 않게 하세요.
4. 각 선택지마다 'reason' 필드에 해당 선택지가 왜 정답인지 또는 왜 오답인지 한국어로 구체적인 근거를 반드시 작성하세요.
5. 'explanation'에는 전체 핵심 문법/어휘 정리 및 오답 주의 포인트를 한국어로 작성하세요.
6. 'speakText'에는 학습자가 발음으로 들어볼 수 있는 간체자 중국어 문장(정답이 반영된 완성 문장 또는 핵심 단어)을 넣으세요.`;

      const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subLabel: { type: Type.STRING },
            hskBand: { type: Type.STRING },
            question: { type: Type.STRING },
            passage: { type: Type.STRING },
            passagePinyin: { type: Type.STRING },
            passageKo: { type: Type.STRING },
            hidePinyinInitially: { type: Type.BOOLEAN },
            speakText: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  pinyin: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["label", "reason"],
              },
            },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: ["subLabel", "question", "options", "correctIndex", "explanation"],
        },
      };

      const ai = getAiClient();
      let aiResp;
      try {
        aiResp = await withRetry(
          () =>
            ai.models.generateContent({
              model: "gemini-4-hydrogen",
              contents: prompt,
              config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseMimeType: "application/json",
                responseSchema,
              },
            }),
          2
        );
      } catch (primaryErr) {
        if (!shouldFallbackModel(primaryErr)) throw primaryErr;
        aiResp = await withRetry(
          () =>
            ai.models.generateContent({
              model: "gemini-3.1-flash-lite",
              contents: prompt,
              config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
                responseMimeType: "application/json",
                responseSchema,
              },
            }),
          2
        );
      }

      const parsed = JSON.parse((aiResp.text ?? "[]").trim());
      if (!Array.isArray(parsed) || parsed.length === 0) {
        res.status(502).json({ error: "모의고사를 생성하지 못했습니다. 다시 시도해 주세요." });
        return;
      }

      const now = Date.now();
      const normalized = parsed
        .filter(
          (q) =>
            q &&
            typeof q.question === "string" &&
            Array.isArray(q.options) &&
            q.options.length >= 3 &&
            typeof q.correctIndex === "number" &&
            q.correctIndex >= 0 &&
            q.correctIndex < q.options.length
        )
        .map((q, idx) => ({
          id: `ai-${examType}-${now}-${idx}`,
          examType,
          subLabel: typeof q.subLabel === "string" ? q.subLabel : "AI 출제",
          hskBand:
            examType === "hsk" &&
            (q.hskBand === "1~2급" || q.hskBand === "3~4급" || q.hskBand === "5~6급")
              ? q.hskBand
              : examType === "hsk" && hskBand !== "전체"
              ? hskBand
              : undefined,
          question: q.question,
          passage: typeof q.passage === "string" && q.passage.trim() ? q.passage : undefined,
          passagePinyin:
            typeof q.passagePinyin === "string" && q.passagePinyin.trim()
              ? q.passagePinyin
              : undefined,
          passageKo:
            typeof q.passageKo === "string" && q.passageKo.trim() ? q.passageKo : undefined,
          hidePinyinInitially: Boolean(q.hidePinyinInitially),
          speakText:
            typeof q.speakText === "string" && q.speakText.trim() ? q.speakText : undefined,
          options: q.options.map((opt: { label?: string; pinyin?: string; reason?: string }) => ({
            label: String(opt?.label ?? ""),
            pinyin: typeof opt?.pinyin === "string" && opt.pinyin.trim() ? opt.pinyin : undefined,
            reason: String(opt?.reason ?? ""),
          })),
          correctIndex: q.correctIndex,
          explanation: String(q.explanation ?? ""),
          isAiGenerated: true,
        }));

      if (normalized.length === 0) {
        res.status(502).json({ error: "생성된 문제 형식이 올바르지 않습니다. 다시 시도해 주세요." });
        return;
      }

      res.json({ questions: normalized });
    } catch (err) {
      const formatted = formatGeminiError(err, "AI 모의고사 출제 중 오류가 발생했습니다.");
      console.error("Exam generate error:", err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distDir, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
