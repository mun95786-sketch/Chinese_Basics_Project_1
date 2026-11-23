import { useCallback, useEffect, useState } from "react";
import {
  EXAM_QUESTIONS,
  EXAM_STUDY_GUIDES,
  EXAM_TYPE_META,
  ExamQuestion,
  ExamType,
  HskBandFilter,
} from "../data/examData";
import { speakChinese } from "../utils/speech";
import { ExamVisual } from "./ExamVisual";

interface ExamPanelProps {
  isActive: boolean;
}

interface ExamAttempt {
  question: ExamQuestion;
  selectedIndex: number;
  isCorrect: boolean;
}

interface AiExplanation {
  whyWrong: string;
  whyCorrect: string;
  examples: { zh: string; pinyin: string; ko: string }[];
  extraAnswer: string;
}

const CIRCLED_NUMS = ["①", "②", "③", "④", "⑤"];

function shuffleList<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ExamPanel({ isActive }: ExamPanelProps) {
  const [examType, setExamType] = useState<ExamType>("suneung");
  const [hskBand, setHskBand] = useState<HskBandFilter>("전체");
  const [visualFilter, setVisualFilter] = useState<"all" | "visual">("all");
  const [showStudyGuide, setShowStudyGuide] = useState<boolean>(false);

  const [sessionQuestions, setSessionQuestions] = useState<ExamQuestion[]>([]);
  const [qIndex, setQIndex] = useState<number>(0);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [answered, setAnswered] = useState<boolean>(false);
  const [showPinyinHint, setShowPinyinHint] = useState<boolean>(false);
  const [showAllOptionsReason, setShowAllOptionsReason] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [finished, setFinished] = useState<boolean>(false);
  const [reviewOnlyWrong, setReviewOnlyWrong] = useState<boolean>(true);

  const [speakingTag, setSpeakingTag] = useState<string | null>(null);
  const [ttsNotice, setTtsNotice] = useState<string>("");

  // AI Deep Explanation state
  const [aiExplain, setAiExplain] = useState<AiExplanation | null>(null);
  const [aiExplainLoading, setAiExplainLoading] = useState<boolean>(false);
  const [aiExplainError, setAiExplainError] = useState<string | null>(null);
  const [followUpInput, setFollowUpInput] = useState<string>("");

  // AI Exam Generation state
  const [aiGenLoading, setAiGenLoading] = useState<boolean>(false);
  const [aiGenError, setAiGenError] = useState<string | null>(null);

  const resetQuestionView = useCallback(() => {
    setSelectedIdx(-1);
    setAnswered(false);
    setShowPinyinHint(false);
    setShowAllOptionsReason(false);
    setAiExplain(null);
    setAiExplainError(null);
    setFollowUpInput("");
    setTtsNotice("");
  }, []);

  const startCuratedSession = useCallback(
    (
      type: ExamType,
      band: HskBandFilter,
      vFilter: "all" | "visual",
      shuffle = false
    ) => {
      let pool = EXAM_QUESTIONS.filter((q) => q.examType === type);
      if (type === "hsk" && band !== "전체") {
        pool = pool.filter((q) => q.hskBand === band);
      }
      if (vFilter === "visual") {
        const onlyVisual = pool.filter((q) => Boolean(q.visualId));
        if (onlyVisual.length > 0) {
          pool = onlyVisual;
        }
      } else if (!shuffle) {
        // Put visual questions near the front so learners immediately experience them
        const withVisual = pool.filter((q) => Boolean(q.visualId));
        const withoutVisual = pool.filter((q) => !q.visualId);
        pool = [...withVisual, ...withoutVisual];
      }
      setSessionQuestions(shuffle ? shuffleList(pool) : pool);
      setQIndex(0);
      setAttempts([]);
      setFinished(false);
      setReviewOnlyWrong(true);
      setAiGenError(null);
      resetQuestionView();
    },
    [resetQuestionView]
  );

  useEffect(() => {
    if (isActive && sessionQuestions.length === 0) {
      startCuratedSession(examType, hskBand, visualFilter, false);
    }
  }, [
    examType,
    hskBand,
    isActive,
    sessionQuestions.length,
    startCuratedSession,
    visualFilter,
  ]);

  const handleChangeExamType = (nextType: ExamType) => {
    setExamType(nextType);
    startCuratedSession(nextType, hskBand, visualFilter, false);
  };

  const handleChangeHskBand = (nextBand: HskBandFilter) => {
    setHskBand(nextBand);
    startCuratedSession("hsk", nextBand, visualFilter, false);
  };

  const handleChangeVisualFilter = (nextFilter: "all" | "visual") => {
    setVisualFilter(nextFilter);
    startCuratedSession(examType, hskBand, nextFilter, false);
  };

  const handleSpeak = (text: string, tag: string, rate = 1.0) => {
    setTtsNotice("");
    speakChinese(text, rate, {
      onStart: () => setSpeakingTag(tag),
      onEnd: () => {
        setSpeakingTag(null);
        setTtsNotice("");
      },
      onError: (msg) => {
        setSpeakingTag(null);
        setTtsNotice(msg);
      },
    });
  };

  const currentQuestion = sessionQuestions[qIndex];

  const handleSelectOption = (idx: number) => {
    if (answered || !currentQuestion) return;
    const isCorrect = idx === currentQuestion.correctIndex;
    setSelectedIdx(idx);
    setAnswered(true);
    setShowAllOptionsReason(!isCorrect);
    setAttempts((prev) => [
      ...prev,
      {
        question: currentQuestion,
        selectedIndex: idx,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (qIndex >= sessionQuestions.length - 1) {
      setFinished(true);
      return;
    }
    setQIndex((prev) => prev + 1);
    resetQuestionView();
  };

  const handleRetryWrongOnly = () => {
    const wrongQuestions = attempts
      .filter((a) => !a.isCorrect)
      .map((a) => a.question);
    if (wrongQuestions.length === 0) return;
    setSessionQuestions(wrongQuestions);
    setQIndex(0);
    setAttempts([]);
    setFinished(false);
    resetQuestionView();
  };

  const handleRequestAiExplain = async (customQuestion?: string) => {
    if (!currentQuestion || aiExplainLoading) return;
    setAiExplainLoading(true);
    setAiExplainError(null);

    try {
      const resp = await fetch("/api/exam-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType: currentQuestion.examType,
          subLabel: currentQuestion.subLabel,
          question: currentQuestion.question,
          passage: currentQuestion.passage || "",
          options: currentQuestion.options.map((o) => ({ label: o.label })),
          selectedIndex: selectedIdx,
          correctIndex: currentQuestion.correctIndex,
          userQuestion: customQuestion ?? followUpInput.trim(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "AI 풀이를 불러오지 못했습니다.");
      }
      setAiExplain(data as AiExplanation);
    } catch (err) {
      setAiExplainError(
        err instanceof Error ? err.message : "AI 풀이 중 오류가 발생했습니다."
      );
    } finally {
      setAiExplainLoading(false);
    }
  };

  const handleGenerateAiExam = async () => {
    if (aiGenLoading) return;
    setAiGenLoading(true);
    setAiGenError(null);

    try {
      const resp = await fetch("/api/exam-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType,
          hskBand: examType === "hsk" ? hskBand : undefined,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "AI 모의고사를 생성하지 못했습니다.");
      }
      const generated = Array.isArray(data?.questions)
        ? (data.questions as ExamQuestion[])
        : [];
      if (generated.length === 0) {
        throw new Error("생성된 문제가 비어 있습니다.");
      }
      setSessionQuestions(generated);
      setQIndex(0);
      setAttempts([]);
      setFinished(false);
      setReviewOnlyWrong(true);
      resetQuestionView();
    } catch (err) {
      setAiGenError(
        err instanceof Error
          ? err.message
          : "AI 모의고사 출제 중 오류가 발생했습니다."
      );
    } finally {
      setAiGenLoading(false);
    }
  };

  const meta = EXAM_TYPE_META[examType];
  const totalCount = sessionQuestions.length;
  const isLast = qIndex === totalCount - 1;
  const isSelectedCorrect =
    answered &&
    currentQuestion &&
    selectedIdx === currentQuestion.correctIndex;

  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const wrongAttempts = attempts.filter((a) => !a.isCorrect);
  const scorePct =
    attempts.length > 0
      ? Math.round((correctCount / attempts.length) * 100)
      : 0;

  return (
    <section aria-label="수능·내신·HSK 시험 대비">
      <div className="max-w-[820px] mx-auto">
        {/* Exam Type & Controls */}
        <div className="bg-white border border-[#e2e8f0] rounded-[18px] px-4 py-3.5 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
            <div className="inline-flex bg-[#e2e8f0] p-1 rounded-[10px] gap-1 flex-wrap">
              {(["suneung", "naesin", "hsk"] as ExamType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleChangeExamType(type)}
                  className={`border-none px-3 py-1.5 rounded-[8px] text-[0.84rem] font-bold cursor-pointer transition ${
                    examType === type
                      ? "bg-white text-[#1e293b] shadow-xs"
                      : "bg-transparent text-[#475569]"
                  }`}
                >
                  {EXAM_TYPE_META[type].title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowStudyGuide((prev) => !prev)}
                className={`border px-3 py-1.5 rounded-[10px] text-[0.82rem] font-bold cursor-pointer transition ${
                  showStudyGuide
                    ? "border-[#f59e0b] bg-[#fffbeb] text-[#92400e]"
                    : "border-[#e2e8f0] bg-white text-[#1e293b] hover:bg-[#f8fafc]"
                }`}
              >
                {showStudyGuide ? "📚 핵심 요약 닫기" : "📚 시험 대비 요약"}
              </button>
              <button
                type="button"
                onClick={() =>
                  startCuratedSession(examType, hskBand, visualFilter, true)
                }
                className="border border-[#e2e8f0] bg-white text-[#1e293b] px-3 py-1.5 rounded-[10px] text-[0.82rem] font-bold cursor-pointer hover:bg-[#f8fafc] transition"
              >
                🔀 문제 섞어 풀기
              </button>
              <button
                type="button"
                disabled={aiGenLoading}
                onClick={handleGenerateAiExam}
                className="border border-[#2563eb] bg-[#2563eb] text-white px-3 py-1.5 rounded-[10px] text-[0.82rem] font-bold cursor-pointer hover:bg-[#1d4ed8] disabled:opacity-55 disabled:cursor-not-allowed transition"
              >
                {aiGenLoading ? "⏳ AI 문제 출제 중..." : "✨ AI 새 모의고사 출제"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.82rem]">
            <div className="text-[#475569]">
              <strong className="text-[#dc2626]">{meta.badge}</strong> ·{" "}
              {meta.desc}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex bg-[#f1f5f9] p-0.5 rounded-[8px] gap-1">
                <button
                  type="button"
                  onClick={() => handleChangeVisualFilter("all")}
                  className={`border-none px-2.5 py-1 rounded-[6px] text-[0.76rem] font-bold cursor-pointer transition ${
                    visualFilter === "all"
                      ? "bg-white text-[#0f172a] shadow-xs"
                      : "bg-transparent text-[#64748b]"
                  }`}
                >
                  전체 유형
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeVisualFilter("visual")}
                  className={`border-none px-2.5 py-1 rounded-[6px] text-[0.76rem] font-bold cursor-pointer transition ${
                    visualFilter === "visual"
                      ? "bg-white text-[#dc2626] shadow-xs"
                      : "bg-transparent text-[#64748b]"
                  }`}
                >
                  🖼️ 그림·도표만
                </button>
              </div>

              {examType === "hsk" && (
                <div className="inline-flex bg-[#f1f5f9] p-0.5 rounded-[8px] gap-1">
                  {(["전체", "1~2급", "3~4급", "5~6급"] as HskBandFilter[]).map(
                    (band) => (
                      <button
                        key={band}
                        type="button"
                        onClick={() => handleChangeHskBand(band)}
                        className={`border-none px-2.5 py-1 rounded-[6px] text-[0.76rem] font-bold cursor-pointer transition ${
                          hskBand === band
                            ? "bg-white text-[#0f172a] shadow-xs"
                            : "bg-transparent text-[#64748b]"
                        }`}
                      >
                        {band}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Collapsible Exam Study Guide */}
          {showStudyGuide && (
            <div className="mt-3 pt-3 border-t border-[#e2e8f0] grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {EXAM_STUDY_GUIDES[examType].map((pt, i) => (
                <div
                  key={i}
                  className="bg-[#fffbeb] border border-[#fde68a] rounded-[12px] p-3 text-[0.8rem]"
                >
                  <div className="font-extrabold text-[#92400e] mb-1">
                    {pt.title}
                  </div>
                  <div className="text-[#475569] leading-relaxed mb-1.5">
                    {pt.detail}
                  </div>
                  <div className="font-hanzi text-[0.78rem] font-bold text-[#b45309] bg-white/80 rounded px-2 py-1">
                    {pt.example}
                  </div>
                </div>
              ))}
            </div>
          )}

          {aiGenError && (
            <div className="mt-2.5 text-[0.82rem] font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-[10px] px-3 py-2">
              ⚠️ {aiGenError}
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="card-surface px-5 py-6">
          {finished ? (
            <div>
              <div className="text-center mb-5">
                <div className="inline-block bg-[#f1f5f9] text-[#334155] text-[0.82rem] font-extrabold px-3 py-1 rounded-full mb-2">
                  {meta.title} 채점 결과
                </div>
                <div className="text-[clamp(1.9rem,5vw,2.6rem)] font-extrabold text-[#dc2626] my-1">
                  {attempts.length}문제 중 {correctCount}문제 정답!
                </div>
                <div className="text-[0.94rem] text-[#64748b] font-semibold mb-4">
                  정답률 {scorePct}% · 틀린 문제는 아래 오답 노트에서 이유를 확인하세요.
                </div>

                <div className="flex justify-center gap-2 flex-wrap">
                  {wrongAttempts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRetryWrongOnly}
                      className="border border-[#dc2626] bg-[#dc2626] text-white px-4 py-2 rounded-[10px] text-[0.86rem] font-bold cursor-pointer hover:bg-[#b91c1c] transition"
                    >
                      🔁 틀린 {wrongAttempts.length}문제만 다시 풀기
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      startCuratedSession(examType, hskBand, visualFilter, true)
                    }
                    className="border border-[#e2e8f0] bg-white text-[#1e293b] px-4 py-2 rounded-[10px] text-[0.86rem] font-bold cursor-pointer hover:bg-[#f8fafc] transition"
                  >
                    🔄 전체 다시 풀기
                  </button>
                  <button
                    type="button"
                    disabled={aiGenLoading}
                    onClick={handleGenerateAiExam}
                    className="border border-[#2563eb] bg-[#eff6ff] text-[#2563eb] px-4 py-2 rounded-[10px] text-[0.86rem] font-bold cursor-pointer hover:bg-[#dbeafe] disabled:opacity-55 transition"
                  >
                    {aiGenLoading ? "⏳ 출제 중..." : "✨ AI 새 모의고사 풀기"}
                  </button>
                </div>
              </div>

              {/* 오답 노트 Filter */}
              <div className="flex items-center justify-between gap-2 mb-3 border-t border-[#e2e8f0] pt-4">
                <h3 className="text-[0.98rem] font-extrabold m-0 text-[#0f172a]">
                  📒 오답 노트 & 상세 풀이
                </h3>
                <div className="inline-flex bg-[#f1f5f9] p-0.5 rounded-[8px] gap-1">
                  <button
                    type="button"
                    onClick={() => setReviewOnlyWrong(true)}
                    className={`border-none px-2.5 py-1 rounded-[6px] text-[0.76rem] font-bold cursor-pointer ${
                      reviewOnlyWrong
                        ? "bg-white text-[#dc2626] shadow-xs"
                        : "bg-transparent text-[#64748b]"
                    }`}
                  >
                    틀린 문제 ({wrongAttempts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewOnlyWrong(false)}
                    className={`border-none px-2.5 py-1 rounded-[6px] text-[0.76rem] font-bold cursor-pointer ${
                      !reviewOnlyWrong
                        ? "bg-white text-[#0f172a] shadow-xs"
                        : "bg-transparent text-[#64748b]"
                    }`}
                  >
                    전체 ({attempts.length})
                  </button>
                </div>
              </div>

              {reviewOnlyWrong && wrongAttempts.length === 0 ? (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[14px] p-4 text-center text-[#15803d] font-bold text-[0.92rem]">
                  🎉 틀린 문제가 하나도 없습니다! 완벽해요!
                </div>
              ) : (
                <div className="space-y-3">
                  {(reviewOnlyWrong ? wrongAttempts : attempts).map((att, idx) => {
                    const q = att.question;
                    const chosenOpt = q.options[att.selectedIndex];
                    const correctOpt = q.options[q.correctIndex];
                    return (
                      <div
                        key={`${q.id}-${idx}`}
                        className={`border rounded-[14px] p-4 border-l-4 ${
                          att.isCorrect
                            ? "bg-[#f8fafc] border-[#e2e8f0] border-l-[#16a34a]"
                            : "bg-[#fffafa] border-[#fecaca] border-l-[#dc2626]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                          <span className="text-[0.76rem] font-extrabold px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569]">
                            {q.subLabel}
                          </span>
                          <span
                            className={`text-[0.8rem] font-extrabold ${
                              att.isCorrect ? "text-[#16a34a]" : "text-[#dc2626]"
                            }`}
                          >
                            {att.isCorrect ? "⭕ 정답" : "❌ 오답"}
                          </span>
                        </div>

                        <div className="font-bold text-[#0f172a] text-[0.94rem] mb-1">
                          {q.question}
                        </div>
                        {q.visualId && <ExamVisual visualId={q.visualId} />}
                        {q.passage && (
                          <div className="font-hanzi text-[0.92rem] text-[#334155] bg-white border border-[#e2e8f0] rounded-[10px] px-3 py-2 mb-2 whitespace-pre-line">
                            {q.passage}
                          </div>
                        )}

                        {!att.isCorrect && chosenOpt && (
                          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[10px] px-3 py-2 mb-2 text-[0.84rem]">
                            <div className="font-extrabold text-[#b91c1c]">
                              ❌ 내가 고른 답 ({CIRCLED_NUMS[att.selectedIndex] || att.selectedIndex + 1}):{" "}
                              <span className="font-hanzi">{chosenOpt.label}</span>
                            </div>
                            <div className="text-[#7f1d1d] mt-0.5 leading-relaxed">
                              <strong>왜 틀렸을까?</strong> {chosenOpt.reason}
                            </div>
                          </div>
                        )}

                        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[10px] px-3 py-2 text-[0.84rem]">
                          <div className="font-extrabold text-[#15803d]">
                            ⭕ 정답 ({CIRCLED_NUMS[q.correctIndex] || q.correctIndex + 1}):{" "}
                            <span className="font-hanzi">{correctOpt?.label}</span>
                          </div>
                          <div className="text-[#14532d] mt-0.5 leading-relaxed">
                            {q.explanation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : currentQuestion ? (
            <div>
              {/* Question Meta Pill */}
              <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                <div className="inline-flex items-center gap-1.5 bg-[#f1f5f9] text-[#334155] text-[0.8rem] font-extrabold px-3 py-1 rounded-full">
                  <span>
                    문제 {qIndex + 1} / {totalCount}
                  </span>
                  <span>·</span>
                  <span>{meta.title}</span>
                  <span>·</span>
                  <span className="text-[#dc2626]">{currentQuestion.subLabel}</span>
                  {currentQuestion.isAiGenerated && (
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-[#dbeafe] text-[#1d4ed8] text-[0.7rem]">
                      AI 출제
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {currentQuestion.speakText && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSpeak(currentQuestion.speakText!, "exam-q")
                      }
                      className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-2.5 py-1 rounded-[8px] text-[0.78rem] font-bold cursor-pointer hover:bg-[#dbeafe] ${
                        speakingTag === "exam-q" ? "btn-speaking" : ""
                      }`}
                    >
                      🔊 발음 듣기
                    </button>
                  )}
                  {currentQuestion.passagePinyin &&
                    (!currentQuestion.hidePinyinInitially || answered) && (
                      <button
                        type="button"
                        onClick={() => setShowPinyinHint((prev) => !prev)}
                        className="border border-[#e2e8f0] bg-white text-[#334155] px-2.5 py-1 rounded-[8px] text-[0.78rem] font-bold cursor-pointer hover:bg-[#f8fafc]"
                      >
                        {showPinyinHint ? "병음 숨기기" : "💡 병음 보기"}
                      </button>
                    )}
                </div>
              </div>

              {/* Prompt */}
              <h3 className="text-[1.08rem] font-extrabold text-[#0f172a] mb-3 leading-snug">
                {currentQuestion.question}
              </h3>

              {/* CSAT / HSK / 내신 Visual Figure */}
              {currentQuestion.visualId && (
                <ExamVisual visualId={currentQuestion.visualId} />
              )}

              {/* Passage Box */}
              {currentQuestion.passage && (
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] px-4 py-3.5 mb-4">
                  <div className="font-hanzi text-[1.15rem] font-bold text-[#0f172a] leading-relaxed whitespace-pre-line">
                    {currentQuestion.passage}
                  </div>
                  {(answered || showPinyinHint) && currentQuestion.passagePinyin && (
                    <div className="text-[0.86rem] font-semibold text-[#dc2626] mt-2 whitespace-pre-line">
                      {currentQuestion.passagePinyin}
                    </div>
                  )}
                  {answered && currentQuestion.passageKo && (
                    <div className="text-[0.86rem] text-[#475569] mt-1.5 pt-1.5 border-t border-[#e2e8f0] whitespace-pre-line">
                      해석: {currentQuestion.passageKo}
                    </div>
                  )}
                </div>
              )}

              {ttsNotice && (
                <div className="mb-3 text-[0.82rem] font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-[10px] px-3 py-2">
                  ⚠️ {ttsNotice}
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 mb-4">
                {currentQuestion.options.map((opt, idx) => {
                  const isCorrectOpt =
                    answered && idx === currentQuestion.correctIndex;
                  const isWrongChosen =
                    answered &&
                    idx === selectedIdx &&
                    idx !== currentQuestion.correctIndex;
                  const showOptPinyin =
                    opt.pinyin &&
                    (answered ||
                      (!currentQuestion.hidePinyinInitially && showPinyinHint));

                  let optClass =
                    "border-[#e2e8f0] bg-white text-[#1e293b] hover:border-[#94a3b8] hover:bg-[#f8fafc]";
                  let badgeClass = "bg-[#f1f5f9] text-[#475569]";

                  if (isCorrectOpt) {
                    optClass = "border-[#16a34a] bg-[#f0fdf4] text-[#14532d]";
                    badgeClass = "bg-[#16a34a] text-white";
                  } else if (isWrongChosen) {
                    optClass = "border-[#dc2626] bg-[#fef2f2] text-[#7f1d1d]";
                    badgeClass = "bg-[#dc2626] text-white";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      onClick={() => handleSelectOption(idx)}
                      className={`border-2 rounded-[14px] px-4 py-3 text-[0.98rem] font-bold flex items-start gap-3 text-left transition cursor-pointer disabled:cursor-default ${optClass}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-[8px] grid place-items-center text-[0.86rem] font-extrabold shrink-0 mt-0.5 ${badgeClass}`}
                      >
                        {CIRCLED_NUMS[idx] || idx + 1}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="font-hanzi block leading-snug">
                          {opt.label}
                        </span>
                        {showOptPinyin && (
                          <span className="block text-[0.8rem] font-semibold text-[#64748b] mt-0.5">
                            {opt.pinyin}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Wrong-Answer & Correct Explanation Panel */}
              {answered && (
                <div className="space-y-3 mt-4">
                  {/* 1. If Wrong: Explicit "Why your choice is wrong" box */}
                  {!isSelectedCorrect && selectedIdx >= 0 && (
                    <div className="bg-[#fef2f2] border-2 border-[#fecaca] rounded-[14px] p-4">
                      <div className="text-[0.95rem] font-extrabold text-[#b91c1c] mb-1.5">
                        ❌ 오답입니다! 내가 고른 {CIRCLED_NUMS[selectedIdx] || `${selectedIdx + 1}번`}이 왜 틀렸을까요?
                      </div>
                      <p className="text-[0.9rem] text-[#7f1d1d] leading-relaxed m-0">
                        {currentQuestion.options[selectedIdx]?.reason ||
                          "선택한 표현은 문맥이나 어법에 맞지 않습니다."}
                      </p>
                    </div>
                  )}

                  {/* 2. Core Answer Explanation */}
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[14px] p-4">
                    <div className="text-[0.95rem] font-extrabold text-[#15803d] mb-1.5">
                      ⭕ 정답은 {CIRCLED_NUMS[currentQuestion.correctIndex] || `${currentQuestion.correctIndex + 1}번`}입니다! · 핵심 풀이
                    </div>
                    <p className="text-[0.9rem] text-[#14532d] leading-relaxed m-0">
                      {currentQuestion.explanation}
                    </p>
                  </div>

                  {/* 3. All Options Breakdown */}
                  <div className="border border-[#e2e8f0] rounded-[14px] bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowAllOptionsReason((prev) => !prev)}
                      className="w-full px-4 py-2.5 bg-[#f8fafc] border-none text-left text-[0.84rem] font-extrabold text-[#334155] flex items-center justify-between cursor-pointer hover:bg-[#f1f5f9]"
                    >
                      <span>🔎 전체 선택지별 정·오답 근거 보기</span>
                      <span>{showAllOptionsReason ? "▲ 접기" : "▼ 펼치기"}</span>
                    </button>
                    {showAllOptionsReason && (
                      <div className="p-3.5 space-y-2 border-t border-[#e2e8f0]">
                        {currentQuestion.options.map((opt, idx) => {
                          const isAns = idx === currentQuestion.correctIndex;
                          const isMine = idx === selectedIdx;
                          return (
                            <div
                              key={idx}
                              className={`text-[0.84rem] rounded-[10px] px-3 py-2 border ${
                                isAns
                                  ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#14532d]"
                                  : isMine
                                  ? "bg-[#fef2f2] border-[#fecaca] text-[#7f1d1d]"
                                  : "bg-[#f8fafc] border-[#e2e8f0] text-[#475569]"
                              }`}
                            >
                              <div className="font-bold">
                                {CIRCLED_NUMS[idx] || idx + 1}{" "}
                                <span className="font-hanzi">{opt.label}</span>
                                {isAns && " (정답)"}
                                {!isAns && isMine && " (내 선택)"}
                              </div>
                              <div className="mt-0.5 leading-relaxed">
                                {opt.reason}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 4. AI 1:1 Tutor Follow-up Explanation */}
                  <div className="border border-[#bfdbfe] bg-[#eff6ff] rounded-[14px] p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span className="text-[0.88rem] font-extrabold text-[#1e40af]">
                        🤖 AI 1:1 맞춤 오답 풀이 (더 자세히 이해하기)
                      </span>
                      <button
                        type="button"
                        disabled={aiExplainLoading}
                        onClick={() => handleRequestAiExplain()}
                        className="border border-[#2563eb] bg-[#2563eb] text-white px-3 py-1.5 rounded-[9px] text-[0.8rem] font-bold cursor-pointer hover:bg-[#1d4ed8] disabled:opacity-55"
                      >
                        {aiExplainLoading
                          ? "⏳ AI가 풀이 작성 중..."
                          : aiExplain
                          ? "🔄 AI 풀이 다시 받기"
                          : "🤖 AI 상세 오답 풀이 받기"}
                      </button>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="text"
                        value={followUpInput}
                        onChange={(e) => setFollowUpInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void handleRequestAiExplain();
                          }
                        }}
                        placeholder="헷갈리는 점이 있으면 물어보세요 (예: 비슷한 예문 더 알려주세요)"
                        className="flex-1 min-w-[200px] px-3 py-1.5 border border-[#bfdbfe] rounded-[9px] bg-white text-[0.84rem] text-[#0f172a] focus:outline-none focus:border-[#2563eb]"
                      />
                      <button
                        type="button"
                        disabled={aiExplainLoading || !followUpInput.trim()}
                        onClick={() => handleRequestAiExplain()}
                        className="border border-[#bfdbfe] bg-white text-[#1d4ed8] px-3 py-1.5 rounded-[9px] text-[0.8rem] font-bold cursor-pointer hover:bg-[#dbeafe] disabled:opacity-45"
                      >
                        질문하기
                      </button>
                    </div>

                    {aiExplainError && (
                      <div className="mt-2.5 text-[0.82rem] font-semibold text-[#b91c1c] bg-white border border-[#fecaca] rounded-[9px] px-3 py-2">
                        ⚠️ {aiExplainError}
                      </div>
                    )}

                    {aiExplain && (
                      <div className="mt-3 bg-white border border-[#dbeafe] rounded-[12px] p-3.5 space-y-2.5 text-[0.86rem]">
                        <div>
                          <div className="font-extrabold text-[#b91c1c] mb-0.5">
                            📌 오답 원인 집중 분석
                          </div>
                          <p className="m-0 text-[#334155] leading-relaxed">
                            {aiExplain.whyWrong}
                          </p>
                        </div>

                        <div>
                          <div className="font-extrabold text-[#15803d] mb-0.5">
                            ✅ 정답 핵심 포인트
                          </div>
                          <p className="m-0 text-[#334155] leading-relaxed">
                            {aiExplain.whyCorrect}
                          </p>
                        </div>

                        {aiExplain.examples.length > 0 && (
                          <div>
                            <div className="font-extrabold text-[#1d4ed8] mb-1">
                              💬 함께 익히는 예문
                            </div>
                            <div className="space-y-1.5">
                              {aiExplain.examples.map((ex, i) => {
                                const exTag = `ai-ex-${i}`;
                                return (
                                  <div
                                    key={i}
                                    className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[9px] px-3 py-2 flex items-center justify-between gap-2"
                                  >
                                    <div>
                                      <div className="font-hanzi font-bold text-[#0f172a]">
                                        {ex.zh}
                                      </div>
                                      <div className="text-[0.78rem] font-semibold text-[#dc2626]">
                                        {ex.pinyin}
                                      </div>
                                      <div className="text-[0.8rem] text-[#475569]">
                                        {ex.ko}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleSpeak(ex.zh, exTag)}
                                      className={`shrink-0 border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-2.5 py-1 rounded-[8px] text-[0.76rem] font-bold cursor-pointer ${
                                        speakingTag === exTag ? "btn-speaking" : ""
                                      }`}
                                    >
                                      🔊
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {aiExplain.extraAnswer && (
                          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[9px] px-3 py-2 text-[#78350f]">
                            <strong>💡 실전 팁/답변:</strong> {aiExplain.extraAnswer}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Next Button */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="border border-[#dc2626] bg-[#dc2626] text-white px-5 py-2.5 rounded-[10px] text-[0.9rem] font-bold cursor-pointer hover:bg-[#b91c1c] transition"
                    >
                      {isLast ? "📊 시험 결과 및 오답 노트 보기" : "다음 문제 ➡️"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
