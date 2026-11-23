import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CONVERSATION_LIST,
  LEVEL_BADGE_CLASSES,
  LevelFilter,
  VOCAB_LIST,
} from "../data/chineseData";
import { speakChinese } from "../utils/speech";

type PracticeMode = "word" | "conv";
type WordSource = "studied" | "all";
type RecordState = "idle" | "recording" | "checking";

interface SpeechCheckResult {
  isCorrect: boolean;
  score: number;
  recognizedText: string;
  recognizedPinyin: string;
  feedback: string;
  tip: string;
}

interface SpeakingPanelProps {
  isActive: boolean;
  studiedIds: Set<number>;
}

interface PracticeItem {
  id: number;
  level: "초급" | "중급" | "고급";
  category: string;
  zh: string;
  pinyin: string;
  ko: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const commaIdx = result.indexOf(",");
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error("녹음 파일을 읽지 못했습니다."));
    reader.readAsDataURL(blob);
  });
}

function getPreferredMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

export function SpeakingPanel({ isActive, studiedIds }: SpeakingPanelProps) {
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("word");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("전체");
  const [wordSource, setWordSource] = useState<WordSource>("studied");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [hidePinyin, setHidePinyin] = useState<boolean>(false);

  const [speakingBtn, setSpeakingBtn] = useState<"normal" | "slow" | "self" | null>(null);
  const [ttsNotice, setTtsNotice] = useState<string>("");

  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<SpeechCheckResult | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const selfAudioRef = useRef<HTMLAudioElement | null>(null);

  const items: PracticeItem[] = useMemo(() => {
    if (practiceMode === "word") {
      const byLevel =
        levelFilter === "전체"
          ? VOCAB_LIST
          : VOCAB_LIST.filter((w) => w.level === levelFilter);
      const filtered =
        wordSource === "studied"
          ? byLevel.filter((w) => studiedIds.has(w.id))
          : byLevel;
      const finalPool = filtered.length > 0 ? filtered : byLevel;
      return finalPool.map((w) => ({
        id: w.id,
        level: w.level,
        category: w.category,
        zh: w.hanzi,
        pinyin: w.pinyin,
        ko: w.meaning,
      }));
    }

    const convPool =
      levelFilter === "전체"
        ? CONVERSATION_LIST
        : CONVERSATION_LIST.filter((c) => c.level === levelFilter);
    return convPool.map((c) => ({
      id: c.id,
      level: c.level,
      category: c.category,
      zh: c.zh,
      pinyin: c.pinyin,
      ko: c.ko,
    }));
  }, [practiceMode, levelFilter, wordSource, studiedIds]);

  const safeIndex =
    currentIndex >= 0 && currentIndex < items.length ? currentIndex : 0;
  const currentItem = items[safeIndex] || items[0];

  const clearRecordedAudio = useCallback(() => {
    if (selfAudioRef.current) {
      try {
        selfAudioRef.current.pause();
      } catch {
        // ignore
      }
      selfAudioRef.current = null;
    }
    setRecordedAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const stopRecordingResources = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isActive && recordState === "recording") {
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        // ignore
      }
      stopRecordingResources();
      setRecordState("idle");
    }
  }, [isActive, recordState, stopRecordingResources]);

  useEffect(() => {
    return () => {
      stopRecordingResources();
      clearRecordedAudio();
    };
  }, [stopRecordingResources, clearRecordedAudio]);

  const resetAttemptState = useCallback(() => {
    setCheckResult(null);
    setMicError(null);
    setTtsNotice("");
    clearRecordedAudio();
  }, [clearRecordedAudio]);

  const moveItem = (delta: number) => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev + delta + items.length) % items.length);
    resetAttemptState();
  };

  const pickRandomItem = () => {
    if (items.length <= 1) return;
    let nextIdx = safeIndex;
    while (nextIdx === safeIndex) {
      nextIdx = Math.floor(Math.random() * items.length);
    }
    setCurrentIndex(nextIdx);
    resetAttemptState();
  };

  const handleSpeakReference = (mode: "normal" | "slow") => {
    if (!currentItem) return;
    const rate = mode === "slow" ? 0.7 : 1.0;
    speakChinese(currentItem.zh, rate, {
      onStart: () => {
        setSpeakingBtn(mode);
        setTtsNotice(
          rate < 1
            ? "0.7배속으로 천천히 발음하는 중..."
            : "중국어(zh-CN) 발음 재생 중..."
        );
      },
      onEnd: () => {
        setSpeakingBtn(null);
        setTtsNotice("");
      },
      onError: (msg) => {
        setSpeakingBtn(null);
        setTtsNotice(msg);
      },
    });
  };

  const handlePlaySelfRecording = () => {
    if (!recordedAudioUrl) return;
    if (selfAudioRef.current) {
      try {
        selfAudioRef.current.pause();
        selfAudioRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
    const audio = new Audio(recordedAudioUrl);
    selfAudioRef.current = audio;
    setSpeakingBtn("self");
    audio.onended = () => setSpeakingBtn(null);
    audio.onerror = () => setSpeakingBtn(null);
    audio.play().catch(() => setSpeakingBtn(null));
  };

  const evaluateAudioBlob = async (blob: Blob, mimeType: string) => {
    if (!currentItem) return;
    setRecordState("checking");
    setMicError(null);

    try {
      const audioBase64 = await blobToBase64(blob);
      const response = await fetch("/api/speech-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          targetZh: currentItem.zh,
          targetPinyin: currentItem.pinyin,
          targetKo: currentItem.ko,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" && data.error
            ? data.error
            : "발음 채점 중 오류가 발생했습니다."
        );
      }

      setCheckResult(data as SpeechCheckResult);
    } catch (err) {
      setMicError(
        err instanceof Error
          ? err.message
          : "발음 분석에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setRecordState("idle");
    }
  };

  const handleToggleRecording = async () => {
    if (recordState === "checking") return;

    if (recordState === "recording") {
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        stopRecordingResources();
        setRecordState("idle");
      }
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setMicError("이 브라우저에서는 마이크 녹음을 지원하지 않습니다.");
      return;
    }

    resetAttemptState();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = getPreferredMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stopRecordingResources();
        const actualMime = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: actualMime });

        if (blob.size < 400) {
          setMicError("녹음된 시간이 너무 짧습니다. 조금 더 길게 말해 주세요.");
          setRecordState("idle");
          return;
        }

        const localUrl = URL.createObjectURL(blob);
        setRecordedAudioUrl(localUrl);
        void evaluateAudioBlob(blob, actualMime);
      };

      recorder.start();
      setRecordState("recording");
      setRecordSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 14) {
            try {
              recorder.stop();
            } catch {
              // ignore
            }
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      stopRecordingResources();
      setRecordState("idle");
      const message =
        err instanceof Error && err.name === "NotAllowedError"
          ? "마이크 권한이 차단되었습니다. 브라우저 주소창의 마이크 권한을 허용해 주세요."
          : "마이크에 연결할 수 없습니다. 장치 연결과 권한을 확인해 주세요.";
      setMicError(message);
    }
  };

  if (!currentItem) return null;

  const isUsingStudiedFallback =
    practiceMode === "word" &&
    wordSource === "studied" &&
    (levelFilter === "전체"
      ? VOCAB_LIST
      : VOCAB_LIST.filter((w) => w.level === levelFilter)
    ).filter((w) => studiedIds.has(w.id)).length === 0;

  return (
    <section aria-label="중국어 말하기 연습">
      <div className="max-w-[780px] mx-auto">
        {/* Settings Toolbar */}
        <div className="bg-white border border-[#e2e8f0] rounded-[18px] px-4 py-3.5 mb-4 flex flex-wrap gap-2.5 items-center justify-between">
          <div className="inline-flex bg-[#e2e8f0] p-1 rounded-[10px] gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setPracticeMode("word");
                setCurrentIndex(0);
                resetAttemptState();
              }}
              className={`border-none px-[11px] py-[7px] rounded-[8px] text-[0.82rem] font-bold cursor-pointer transition ${
                practiceMode === "word"
                  ? "bg-white text-[#1e293b] shadow-xs"
                  : "bg-transparent text-[#475569]"
              }`}
            >
              📝 단어 말하기
            </button>
            <button
              type="button"
              onClick={() => {
                setPracticeMode("conv");
                setCurrentIndex(0);
                resetAttemptState();
              }}
              className={`border-none px-[11px] py-[7px] rounded-[8px] text-[0.82rem] font-bold cursor-pointer transition ${
                practiceMode === "conv"
                  ? "bg-white text-[#1e293b] shadow-xs"
                  : "bg-transparent text-[#475569]"
              }`}
            >
              💬 회화 문장 말하기
            </button>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <select
              aria-label="말하기 난이도"
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value as LevelFilter);
                setCurrentIndex(0);
                resetAttemptState();
              }}
              className="px-2.5 py-1.5 border border-[#e2e8f0] rounded-[10px] bg-[#f8fafc] text-[#1e293b] text-[0.84rem] font-semibold cursor-pointer min-h-[36px]"
            >
              <option value="전체">전체 난이도</option>
              <option value="초급">초급</option>
              <option value="중급">중급</option>
              <option value="고급">고급</option>
            </select>

            {practiceMode === "word" && (
              <div className="inline-flex bg-[#e2e8f0] p-1 rounded-[10px] gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setWordSource("studied");
                    setCurrentIndex(0);
                    resetAttemptState();
                  }}
                  className={`border-none px-[11px] py-[7px] rounded-[8px] text-[0.82rem] font-bold cursor-pointer transition ${
                    wordSource === "studied"
                      ? "bg-white text-[#1e293b] shadow-xs"
                      : "bg-transparent text-[#475569]"
                  }`}
                >
                  학습 단어 ({studiedIds.size})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWordSource("all");
                    setCurrentIndex(0);
                    resetAttemptState();
                  }}
                  className={`border-none px-[11px] py-[7px] rounded-[8px] text-[0.82rem] font-bold cursor-pointer transition ${
                    wordSource === "all"
                      ? "bg-white text-[#1e293b] shadow-xs"
                      : "bg-transparent text-[#475569]"
                  }`}
                >
                  전체 단어
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Item Selector & Navigation */}
        <div className="bg-white border border-[#e2e8f0] rounded-[18px] px-3.5 py-3 mb-4 flex flex-wrap items-center justify-between gap-2.5">
          <select
            aria-label="말하기 항목 선택"
            value={safeIndex}
            onChange={(e) => {
              setCurrentIndex(Number(e.target.value));
              resetAttemptState();
            }}
            className="px-3 py-2 border border-[#e2e8f0] rounded-[10px] bg-[#f8fafc] text-[#1e293b] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] flex-1 min-w-[200px] max-w-full"
          >
            {items.map((item, idx) => (
              <option key={`${practiceMode}-${item.id}`} value={idx}>
                {idx + 1}. {item.zh} ({item.ko})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => moveItem(-1)}
              className="border border-[#e2e8f0] bg-white text-[#1e293b] px-3 py-2 rounded-[10px] text-[0.86rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1 transition hover:bg-[#f8fafc]"
            >
              ⬅️ 이전
            </button>
            <button
              type="button"
              onClick={pickRandomItem}
              className="border border-[#e2e8f0] bg-white text-[#1e293b] px-3 py-2 rounded-[10px] text-[0.86rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1 transition hover:bg-[#f8fafc]"
            >
              🎲 랜덤
            </button>
            <button
              type="button"
              onClick={() => moveItem(1)}
              className="border border-[#dc2626] bg-[#dc2626] text-white px-3 py-2 rounded-[10px] text-[0.86rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1 transition hover:bg-[#b91c1c]"
            >
              다음 ➡️
            </button>
          </div>
        </div>

        {/* Main Speaking Practice Card */}
        <article className="card-surface p-6 text-center">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.78rem] font-bold ${
                  LEVEL_BADGE_CLASSES[currentItem.level]
                }`}
              >
                {currentItem.level}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.78rem] font-bold bg-[#f1f5f9] text-[#475569]">
                {currentItem.category}
              </span>
            </div>
            <span className="text-[0.8rem] font-bold text-[#64748b]">
              {safeIndex + 1} / {items.length}
            </span>
          </div>

          {isUsingStudiedFallback && (
            <div className="mb-3 text-[0.8rem] text-[#d97706] bg-[#fffbeb] border border-[#fde68a] rounded-[10px] px-3 py-1.5 font-semibold">
              선택한 난이도에 아직 학습한 단어가 없어 전체 단어 목록으로 연습합니다.
            </div>
          )}

          <div className="py-2">
            <div
              className={`font-hanzi font-bold text-[#0f172a] leading-[1.25] mb-2 ${
                practiceMode === "word"
                  ? "text-[clamp(2.6rem,7vw,4.2rem)]"
                  : "text-[clamp(1.5rem,4vw,2.15rem)]"
              }`}
            >
              {currentItem.zh}
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <span
                className={`text-[1.15rem] font-bold text-[#dc2626] transition-all ${
                  hidePinyin ? "blur-[7px] opacity-35 select-none" : ""
                }`}
              >
                {currentItem.pinyin}
              </span>
              <button
                type="button"
                onClick={() => setHidePinyin((prev) => !prev)}
                className="border-none bg-transparent text-[#2563eb] text-[0.78rem] font-bold cursor-pointer"
              >
                {hidePinyin ? "병음 보기" : "병음 가리기"}
              </button>
            </div>

            <div className="inline-block bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] px-4 py-2 text-[1rem] font-bold text-[#334155] mb-5">
              {currentItem.ko}
            </div>
          </div>

          {/* Reference Audio Buttons */}
          <div className="flex justify-center gap-2.5 flex-wrap mb-2">
            <button
              type="button"
              onClick={() => handleSpeakReference("normal")}
              className={`border border-[#2563eb] bg-[#2563eb] text-white px-3.5 py-2 rounded-[10px] text-[0.86rem] font-semibold cursor-pointer min-h-[38px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#1d4ed8] ${
                speakingBtn === "normal" ? "btn-speaking" : ""
              }`}
            >
              🔊 원어민 발음 듣기
            </button>
            <button
              type="button"
              onClick={() => handleSpeakReference("slow")}
              className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-3.5 py-2 rounded-[10px] text-[0.86rem] font-semibold cursor-pointer min-h-[38px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#dbeafe] ${
                speakingBtn === "slow" ? "btn-speaking" : ""
              }`}
            >
              🐢 0.7배속 천천히
            </button>
          </div>

          <div className="text-[0.8rem] text-[#64748b] min-h-[20px] mb-4">
            {ttsNotice}
          </div>

          {/* Microphone Recording Zone */}
          <div className="border-t border-[#e2e8f0] pt-5 flex flex-col items-center">
            <button
              type="button"
              disabled={recordState === "checking"}
              onClick={handleToggleRecording}
              className={`px-6 py-3.5 rounded-[14px] text-[1rem] font-extrabold cursor-pointer min-h-[54px] inline-flex items-center justify-center gap-2.5 transition shadow-sm border ${
                recordState === "recording"
                  ? "bg-[#dc2626] border-[#b91c1c] text-white animate-pulse"
                  : recordState === "checking"
                  ? "bg-[#f1f5f9] border-[#cbd5e1] text-[#64748b] cursor-wait"
                  : "bg-[#0f172a] border-[#0f172a] text-white hover:bg-[#1e293b]"
              }`}
            >
              {recordState === "recording" ? (
                <>⏹️ 녹음 중 ({recordSeconds}초) · 눌러서 채점하기</>
              ) : recordState === "checking" ? (
                <>⏳ 발음을 분석하고 있습니다...</>
              ) : (
                <>🎤 눌러서 중국어로 말하기</>
              )}
            </button>

            <p className="mt-2.5 text-[0.8rem] text-[#64748b] m-0">
              {recordState === "recording"
                ? "목표 중국어를 또박또박 말한 뒤 버튼을 다시 누르세요 (최대 15초)"
                : "원어민 발음을 먼저 듣고, 마이크 버튼을 눌러 따라 말해 보세요"}
            </p>

            {micError && (
              <div className="mt-4 w-full max-w-[540px] rounded-[12px] px-4 py-3 bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[0.88rem] font-bold text-left">
                ⚠️ {micError}
              </div>
            )}

            {/* Speech Evaluation Result */}
            {checkResult && (
              <div
                className={`mt-5 w-full max-w-[560px] rounded-[16px] p-4 border text-left ${
                  checkResult.isCorrect
                    ? "bg-[#f0fdf4] border-[#bbf7d0]"
                    : "bg-[#fffbeb] border-[#fde68a]"
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                  <span
                    className={`text-[1rem] font-extrabold ${
                      checkResult.isCorrect ? "text-[#15803d]" : "text-[#b45309]"
                    }`}
                  >
                    {checkResult.isCorrect
                      ? "⭕ 좋아요! 정확하게 말했어요"
                      : "🔄 조금 더 연습해 볼까요?"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[0.84rem] font-extrabold ${
                      checkResult.isCorrect
                        ? "bg-[#16a34a] text-white"
                        : "bg-[#d97706] text-white"
                    }`}
                  >
                    정확도 {checkResult.score}점
                  </span>
                </div>

                <div className="bg-white/90 border border-[#e2e8f0] rounded-[12px] px-3.5 py-2.5 mb-3">
                  <div className="text-[0.75rem] font-bold text-[#64748b] mb-0.5">
                    인식된 내 발음
                  </div>
                  {checkResult.recognizedText ? (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-hanzi text-[1.2rem] font-bold text-[#0f172a]">
                        {checkResult.recognizedText}
                      </span>
                      {checkResult.recognizedPinyin && (
                        <span className="text-[0.9rem] font-bold text-[#dc2626]">
                          ({checkResult.recognizedPinyin})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[0.88rem] font-semibold text-[#64748b]">
                      (인식된 중국어 음성이 없습니다)
                    </span>
                  )}
                </div>

                <p className="text-[0.9rem] font-semibold text-[#1e293b] m-0 mb-1.5 leading-relaxed">
                  {checkResult.feedback}
                </p>
                {checkResult.tip && (
                  <p className="text-[0.84rem] font-medium text-[#475569] m-0 mb-3">
                    💡 <strong>발음 팁:</strong> {checkResult.tip}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {recordedAudioUrl && (
                    <button
                      type="button"
                      onClick={handlePlaySelfRecording}
                      className={`border border-[#cbd5e1] bg-white text-[#1e293b] px-3 py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 hover:bg-[#f8fafc] ${
                        speakingBtn === "self" ? "btn-speaking" : ""
                      }`}
                    >
                      🎧 내 목소리 다시 듣기
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSpeakReference("normal")}
                    className="border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-3 py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 hover:bg-[#dbeafe]"
                  >
                    🔊 정답 발음과 비교하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
