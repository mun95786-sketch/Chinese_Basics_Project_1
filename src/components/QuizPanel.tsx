import { useCallback, useEffect, useState } from "react";
import {
  CONVERSATION_LIST,
  Level,
  LevelFilter,
  VOCAB_LIST,
} from "../data/chineseData";
import { speakChinese } from "../utils/speech";

const QUIZ_MAX_QUESTIONS = 5;

type QuizType = "word" | "conv";
type QuizSource = "studied" | "all";

interface QuizOption {
  label: string;
  sub: string;
  isCorrect: boolean;
  explainNote: string;
}

interface QuizQuestion {
  kind: QuizType;
  level: Level;
  category?: string;
  promptKo?: string;
  promptZh: string;
  promptPinyin: string;
  answerText: string;
  speakText: string;
  options: QuizOption[];
}

interface QuizResultItem {
  prompt: string;
  answer: string;
  isCorrect: boolean;
}

interface QuizPanelProps {
  isActive: boolean;
  studiedIds: Set<number>;
  onGoLearn: () => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizPanel({
  isActive,
  studiedIds,
  onGoLearn,
}: QuizPanelProps) {
  const [quizType, setQuizType] = useState<QuizType>("word");
  const [quizLevel, setQuizLevel] = useState<LevelFilter>("전체");
  const [choiceCount, setChoiceCount] = useState<3 | 5>(5);
  const [quizSource, setQuizSource] = useState<QuizSource>("studied");

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState<number>(0);
  const [answered, setAnswered] = useState<boolean>(false);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [showPinyinHint, setShowPinyinHint] = useState<boolean>(false);
  const [results, setResults] = useState<QuizResultItem[]>([]);
  const [finished, setFinished] = useState<boolean>(false);
  const [speakingBtn, setSpeakingBtn] = useState<"normal" | "slow" | null>(null);
  const [ttsNotice, setTtsNotice] = useState<string>("");

  const buildQuizSession = useCallback(
    (
      type: QuizType,
      level: LevelFilter,
      choices: 3 | 5,
      source: QuizSource
    ) => {
      setQIndex(0);
      setAnswered(false);
      setSelectedIdx(-1);
      setShowPinyinHint(false);
      setResults([]);
      setFinished(false);
      setEmptyMessage(null);

      if (type === "word") {
        const levelPool =
          level === "전체"
            ? VOCAB_LIST
            : VOCAB_LIST.filter((w) => w.level === level);
        const questionPool =
          source === "studied"
            ? levelPool.filter((w) => studiedIds.has(w.id))
            : levelPool;

        if (questionPool.length === 0) {
          setQuestions([]);
          setEmptyMessage(
            `선택한 난이도(${level})에서 아직 학습한 단어가 없습니다.`
          );
          return;
        }

        const picked = shuffleArray(questionPool).slice(
          0,
          Math.min(QUIZ_MAX_QUESTIONS, questionPool.length)
        );
        const generated: QuizQuestion[] = picked.map((word) => {
          const distractorCandidates = levelPool.filter(
            (w) => w.id !== word.id && w.meaning !== word.meaning
          );
          const distractors = shuffleArray(distractorCandidates).slice(
            0,
            choices - 1
          );
          const options = shuffleArray([
            {
              label: word.meaning,
              sub: "",
              isCorrect: true,
              explainNote: `${word.hanzi}(${word.pinyin})의 뜻은 ‘${word.meaning}’입니다.`,
            },
            ...distractors.map((d) => ({
              label: d.meaning,
              sub: "",
              isCorrect: false,
              explainNote: `선택하신 ‘${d.meaning}’은(는) 중국어로 「${d.hanzi} (${d.pinyin})」입니다. 문제의 「${word.hanzi} (${word.pinyin})」은(는) ‘${word.meaning}’이라는 뜻입니다.`,
            })),
          ]);
          return {
            kind: "word",
            level: word.level,
            promptZh: word.hanzi,
            promptPinyin: word.pinyin,
            answerText: word.meaning,
            speakText: word.hanzi,
            options,
          };
        });
        setQuestions(generated);
      } else {
        const levelPool =
          level === "전체"
            ? CONVERSATION_LIST
            : CONVERSATION_LIST.filter((c) => c.level === level);
        const picked = shuffleArray(levelPool).slice(
          0,
          Math.min(QUIZ_MAX_QUESTIONS, levelPool.length)
        );
        const generated: QuizQuestion[] = picked.map((conv) => {
          const distractorCandidates = levelPool.filter(
            (c) => c.id !== conv.id && c.zh !== conv.zh
          );
          const distractors = shuffleArray(distractorCandidates).slice(
            0,
            choices - 1
          );
          const options = shuffleArray([
            {
              label: conv.zh,
              sub: conv.pinyin,
              isCorrect: true,
              explainNote: `「${conv.zh}」(${conv.pinyin})가 ‘${conv.ko}’에 해당하는 정확한 회화 문장입니다.`,
            },
            ...distractors.map((d) => ({
              label: d.zh,
              sub: d.pinyin,
              isCorrect: false,
              explainNote: `선택하신 문장 「${d.zh}」(${d.pinyin})은(는) “${d.ko}”라는 뜻입니다.`,
            })),
          ]);
          return {
            kind: "conv",
            level: conv.level,
            category: conv.category,
            promptKo: conv.ko,
            promptZh: conv.zh,
            promptPinyin: conv.pinyin,
            answerText: conv.zh,
            speakText: conv.zh,
            options,
          };
        });
        setQuestions(generated);
      }
    },
    [studiedIds]
  );

  // Re-initialize quiz whenever tab becomes active
  useEffect(() => {
    if (isActive) {
      buildQuizSession(quizType, quizLevel, choiceCount, quizSource);
    }
  }, [isActive, quizType, quizLevel, choiceCount, quizSource, buildQuizSession]);

  const handleSelectOption = (idx: number) => {
    if (answered) return;
    const item = questions[qIndex];
    if (!item) return;
    const ok = item.options[idx].isCorrect;
    setAnswered(true);
    setSelectedIdx(idx);
    setResults((prev) => [
      ...prev,
      {
        prompt:
          item.kind === "word"
            ? `${item.promptZh} (${item.promptPinyin})`
            : item.promptKo || "",
        answer: item.answerText,
        isCorrect: ok,
      },
    ]);
  };

  const handleNextQuestion = () => {
    const isLast = qIndex === questions.length - 1;
    if (isLast) {
      setFinished(true);
    } else {
      setQIndex((prev) => prev + 1);
      setAnswered(false);
      setSelectedIdx(-1);
      setShowPinyinHint(false);
    }
  };

  const handleSpeak = (text: string, mode: "normal" | "slow") => {
    const rate = mode === "slow" ? 0.7 : 1.0;
    setTtsNotice("");
    speakChinese(text, rate, {
      onStart: () => setSpeakingBtn(mode),
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

  const currentItem = questions[qIndex];
  const totalCount = questions.length;
  const isLast = qIndex === totalCount - 1;
  const showPinyin = answered || showPinyinHint;
  const isSelectedCorrect =
    answered && selectedIdx >= 0 && currentItem?.options[selectedIdx]?.isCorrect;

  const correctCount = results.filter((r) => r.isCorrect).length;
  const pct = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  return (
    <section aria-label="3·5지선다 퀴즈">
      <div className="max-w-[720px] mx-auto">
        {/* Quiz Settings */}
        <div className="bg-white border border-[#e2e8f0] rounded-[18px] px-4 py-3.5 mb-4 flex flex-wrap gap-2.5 items-center justify-between">
          <div className="inline-flex bg-[#e2e8f0] p-1 rounded-[10px] gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setQuizType("word")}
              className={`border-none px-[11px] py-[7px] rounded-[8px] text-[0.82rem] font-bold cursor-pointer transition ${
                quizType === "word"
                  ? "bg-white text-[#1e293b] shadow-xs"
                  : "bg-transparent text-[#475569]"
              }`}
            >
              📝 단어 뜻 맞추기
            </button>
            <button
              type="button"
              onClick={() => setQuizType("conv")}
              className={`border-none px-[11px] py-[7px] rounded-[8px] text-[0.82rem] font-bold cursor-pointer transition ${
                quizType === "conv"
                  ? "bg-white text-[#1e293b] shadow-xs"
                  : "bg-transparent text-[#475569]"
              }`}
            >
              💬 회화 문장 맞추기
            </button>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <select
              aria-label="퀴즈 난이도"
              value={quizLevel}
              onChange={(e) => setQuizLevel(e.target.value as LevelFilter)}
              className="px-2.5 py-1.5 border border-[#e2e8f0] rounded-[10px] bg-[#f8fafc] text-[#1e293b] text-[0.84rem] font-semibold cursor-pointer min-h-[36px]"
            >
              <option value="전체">전체 난이도</option>
              <option value="초급">초급</option>
              <option value="중급">중급</option>
              <option value="고급">고급</option>
            </select>

            <div className="inline-flex bg-[#e2e8f0] p-1 rounded-[10px] gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => setChoiceCount(3)}
                className={`border-none px-[11px] py-[7px] rounded-[8px] text-[0.82rem] font-bold cursor-pointer transition ${
                  choiceCount === 3
                    ? "bg-white text-[#1e293b] shadow-xs"
                    : "bg-transparent text-[#475569]"
                }`}
              >
                3지선다
              </button>
              <button
                type="button"
                onClick={() => setChoiceCount(5)}
                className={`border-none px-[11px] py-[7px] rounded-[8px] text-[0.82rem] font-bold cursor-pointer transition ${
                  choiceCount === 5
                    ? "bg-white text-[#1e293b] shadow-xs"
                    : "bg-transparent text-[#475569]"
                }`}
              >
                5지선다
              </button>
            </div>

            {quizType === "word" && (
              <div className="inline-flex bg-[#e2e8f0] p-1 rounded-[10px] gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQuizSource("studied")}
                  className={`border-none px-[11px] py-[7px] rounded-[8px] text-[0.82rem] font-bold cursor-pointer transition ${
                    quizSource === "studied"
                      ? "bg-white text-[#1e293b] shadow-xs"
                      : "bg-transparent text-[#475569]"
                  }`}
                >
                  학습 단어 ({studiedIds.size})
                </button>
                <button
                  type="button"
                  onClick={() => setQuizSource("all")}
                  className={`border-none px-[11px] py-[7px] rounded-[8px] text-[0.82rem] font-bold cursor-pointer transition ${
                    quizSource === "all"
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

        {/* Quiz Body Card */}
        <div className="card-surface text-center px-5 py-[26px]">
          {emptyMessage ? (
            <div className="py-4">
              <h3 className="text-lg font-extrabold mb-2">
                출제할 문제가 아직 부족해요
              </h3>
              <p className="text-sm text-[#64748b] mb-5 leading-relaxed">
                {emptyMessage}
                <br />
                '단어·쓰기' 탭에서 단어를 학습하거나, '전체 단어' 모드로 풀어보세요.
              </p>
              <div className="flex justify-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={onGoLearn}
                  className="border border-[#dc2626] bg-[#dc2626] text-white px-3.5 py-2 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#b91c1c]"
                >
                  📖 단어 학습하기
                </button>
                <button
                  type="button"
                  onClick={() => setQuizSource("all")}
                  className="border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-3.5 py-2 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#dbeafe]"
                >
                  🎲 전체 단어로 풀기
                </button>
              </div>
            </div>
          ) : finished ? (
            <div>
              <div className="inline-block bg-[#f1f5f9] text-[#334155] text-[0.82rem] font-extrabold px-3 py-1 rounded-full mb-2.5">
                퀴즈 완료
              </div>
              <div className="text-[clamp(2rem,6vw,2.8rem)] font-extrabold text-[#dc2626] mt-2 mb-1">
                {results.length}개 중 {correctCount}개 정답!
              </div>
              <div className="text-[0.96rem] text-[#64748b] font-semibold mb-[18px]">
                정답률 {pct}% · 수고하셨습니다. 이번 퀴즈가 종료되었습니다.
              </div>

              <div className="text-left max-w-[540px] mx-auto mb-5 flex flex-col gap-2">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`border border-[#e2e8f0] rounded-[12px] px-3.5 py-2.5 flex items-center justify-between gap-2.5 text-[0.88rem] border-l-4 ${
                      r.isCorrect
                        ? "bg-[#f8fafc] border-l-[#16a34a]"
                        : "bg-[#fff5f5] border-l-[#dc2626]"
                    }`}
                  >
                    <div>
                      <strong>
                        {i + 1}. {r.prompt}
                      </strong>
                      <br />
                      <span className="text-[#64748b]">정답: {r.answer}</span>
                    </div>
                    <span className="font-extrabold shrink-0">
                      {r.isCorrect ? "⭕ 정답" : "❌ 오답"}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={onGoLearn}
                className="border border-[#dc2626] bg-[#dc2626] text-white px-4 py-2.5 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#b91c1c]"
              >
                📖 단어·쓰기 학습으로 돌아가기
              </button>
            </div>
          ) : currentItem ? (
            <div>
              <div className="inline-block bg-[#f1f5f9] text-[#334155] text-[0.82rem] font-extrabold px-3 py-1 rounded-full mb-2.5">
                {currentItem.kind === "word"
                  ? `문제 ${qIndex + 1} / ${totalCount} · ${currentItem.level} · ${choiceCount}지선다`
                  : `문제 ${qIndex + 1} / ${totalCount} · ${currentItem.level} (${currentItem.category}) · ${choiceCount}지선다`}
              </div>

              {currentItem.kind === "word" ? (
                <>
                  <div className="text-[0.86rem] font-bold text-[#64748b] mb-2">
                    다음 중국어 단어의 알맞은 뜻은?
                  </div>
                  <div className="font-hanzi text-[clamp(2.1rem,6vw,3.6rem)] font-bold text-[#0f172a] mb-2 leading-[1.25]">
                    {currentItem.promptZh}
                  </div>
                  <div className="text-[1.1rem] font-bold text-[#dc2626] min-h-[26px] mb-3">
                    {showPinyin ? currentItem.promptPinyin : ""}
                  </div>
                  <div className="flex justify-center gap-2 flex-wrap mb-[18px]">
                    <button
                      type="button"
                      onClick={() => handleSpeak(currentItem.speakText, "normal")}
                      className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-[11px] py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer min-h-[35px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#dbeafe] ${
                        speakingBtn === "normal" ? "btn-speaking" : ""
                      }`}
                    >
                      🔊 발음 듣기
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSpeak(currentItem.speakText, "slow")}
                      className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-[11px] py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer min-h-[35px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#dbeafe] ${
                        speakingBtn === "slow" ? "btn-speaking" : ""
                      }`}
                    >
                      🐢 0.7배속
                    </button>
                    {!answered && (
                      <button
                        type="button"
                        onClick={() => setShowPinyinHint((prev) => !prev)}
                        className="border border-[#e2e8f0] bg-white text-[#1e293b] px-[11px] py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer min-h-[35px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#f8fafc]"
                      >
                        {showPinyinHint ? "병음 숨기기" : "💡 병음 힌트"}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[0.86rem] font-bold text-[#64748b] mb-2">
                    다음 한국어에 알맞은 중국어 회화 문장은?
                  </div>
                  <div className="text-[clamp(1.2rem,3.5vw,1.55rem)] font-extrabold text-[#0f172a] mb-2.5">
                    “{currentItem.promptKo}”
                  </div>
                  <div className="flex justify-center gap-2 flex-wrap mb-[18px]">
                    {!answered ? (
                      <button
                        type="button"
                        onClick={() => setShowPinyinHint((prev) => !prev)}
                        className="border border-[#e2e8f0] bg-white text-[#1e293b] px-[11px] py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer min-h-[35px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#f8fafc]"
                      >
                        {showPinyinHint ? "병음 숨기기" : "💡 선택지 병음 보기"}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleSpeak(currentItem.speakText, "normal")
                          }
                          className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-[11px] py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer min-h-[35px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#dbeafe] ${
                            speakingBtn === "normal" ? "btn-speaking" : ""
                          }`}
                        >
                          🔊 정답 발음 듣기
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleSpeak(currentItem.speakText, "slow")
                          }
                          className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-[11px] py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer min-h-[35px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#dbeafe] ${
                            speakingBtn === "slow" ? "btn-speaking" : ""
                          }`}
                        >
                          🐢 0.7배속
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}

              {ttsNotice && (
                <div className="mb-4 text-[0.84rem] font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-[10px] px-3 py-2 max-w-[520px] mx-auto">
                  ⚠️ {ttsNotice}
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 max-w-[520px] mx-auto mb-[18px]">
                {currentItem.options.map((opt, idx) => {
                  const isCorrectOpt = answered && opt.isCorrect;
                  const isWrongOpt =
                    answered && !opt.isCorrect && idx === selectedIdx;
                  const showSub = opt.sub && (answered || showPinyin);

                  let optionClasses =
                    "border-[#e2e8f0] bg-white text-[#1e293b] hover:border-[#94a3b8] hover:bg-[#f8fafc]";
                  let numClasses = "bg-[#f1f5f9] text-[#475569]";

                  if (isCorrectOpt) {
                    optionClasses =
                      "border-[#16a34a] bg-[#f0fdf4] text-[#14532d]";
                    numClasses = "bg-[#16a34a] text-white";
                  } else if (isWrongOpt) {
                    optionClasses =
                      "border-[#dc2626] bg-[#fef2f2] text-[#7f1d1d]";
                    numClasses = "bg-[#dc2626] text-white";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      onClick={() => handleSelectOption(idx)}
                      className={`border-2 rounded-[14px] px-[15px] py-[13px] text-[1rem] font-bold flex items-center gap-3 text-left transition cursor-pointer disabled:cursor-default ${optionClasses}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-[8px] grid place-items-center text-[0.85rem] font-extrabold shrink-0 ${numClasses}`}
                      >
                        {idx + 1}
                      </span>
                      <span>
                        <span
                          className={
                            currentItem.kind === "conv" ? "font-hanzi" : ""
                          }
                        >
                          {opt.label}
                        </span>
                        {showSub && (
                          <span className="block text-[0.82rem] font-semibold text-[#64748b] mt-0.5">
                            {opt.sub}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Next */}
              {answered && (
                <>
                  <div
                    className={`rounded-[12px] px-4 py-3 max-w-[520px] mx-auto mb-4 text-[0.92rem] border text-left ${
                      isSelectedCorrect
                        ? "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]"
                        : "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]"
                    }`}
                  >
                    <div className="font-bold">
                      {isSelectedCorrect
                        ? `⭕ 정답입니다! (${currentItem.promptZh} : ${currentItem.answerText})`
                        : `❌ 오답입니다! 정답은 「${currentItem.answerText}」 입니다.`}
                    </div>
                    {!isSelectedCorrect &&
                      selectedIdx >= 0 &&
                      currentItem.options[selectedIdx]?.explainNote && (
                        <div className="text-[0.84rem] text-[#7f1d1d] mt-1 font-medium leading-relaxed">
                          💡 풀이: {currentItem.options[selectedIdx].explainNote}
                        </div>
                      )}
                  </div>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="border border-[#dc2626] bg-[#dc2626] text-white px-4 py-2.5 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#b91c1c]"
                  >
                    {isLast ? "📊 결과 확인하고 마치기" : "다음 문제 ➡️"}
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
