import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import {
  LEVEL_BADGE_CLASSES,
  LevelFilter,
  VOCAB_LIST,
  VocabItem,
} from "../data/chineseData";
import { speakChinese } from "../utils/speech";

interface LearnPanelProps {
  isActive: boolean;
  studiedIds: Set<number>;
  onMarkStudied: (id: number) => void;
  jumpToWord?: { id: number; seq: number } | null;
}

type WriterStatusType = "info" | "warn" | "success";

export function LearnPanel({
  isActive,
  studiedIds,
  onMarkStudied,
  jumpToWord,
}: LearnPanelProps) {
  const [currentLevel, setCurrentLevel] = useState<LevelFilter>("전체");
  const [currentCategory, setCurrentCategory] = useState<string>("전체");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [hideMeaning, setHideMeaning] = useState<boolean>(false);
  const [selectedCharIdx, setSelectedCharIdx] = useState<number>(0);

  const [speakingBtn, setSpeakingBtn] = useState<"normal" | "slow" | null>(null);
  const [ttsNotice, setTtsNotice] = useState<string>("");

  const [writerStatus, setWriterStatus] = useState<{
    text: string;
    type: WriterStatusType;
  }>({
    text: "획순에 맞춰 바로 써 보세요!",
    type: "info",
  });

  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const autoAdvanceRef = useRef<boolean>(true);
  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  const [writingMode, setWritingMode] = useState<"guided" | "blind">("guided");
  const writingModeRef = useRef<"guided" | "blind">("guided");
  const [peekHanzi, setPeekHanzi] = useState<boolean>(false);

  const tianziBoxRef = useRef<HTMLDivElement | null>(null);
  const hanziTargetRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const renderTokenRef = useRef<number>(0);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const levelCounts = useMemo(
    () => ({
      전체: VOCAB_LIST.length,
      초급: VOCAB_LIST.filter((w) => w.level === "초급").length,
      중급: VOCAB_LIST.filter((w) => w.level === "중급").length,
      고급: VOCAB_LIST.filter((w) => w.level === "고급").length,
    }),
    []
  );

  const byLevel = useMemo(() => {
    return currentLevel === "전체"
      ? VOCAB_LIST
      : VOCAB_LIST.filter((w) => w.level === currentLevel);
  }, [currentLevel]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(byLevel.map((w) => w.category)));
    return [
      { name: "전체", count: byLevel.length },
      ...unique.map((cat) => ({
        name: cat,
        count: byLevel.filter((w) => w.category === cat).length,
      })),
    ];
  }, [byLevel]);

  const effectiveCategory = useMemo(() => {
    return categories.some((c) => c.name === currentCategory)
      ? currentCategory
      : "전체";
  }, [categories, currentCategory]);

  const filteredWords = useMemo(() => {
    return effectiveCategory === "전체"
      ? byLevel
      : byLevel.filter((w) => w.category === effectiveCategory);
  }, [byLevel, effectiveCategory]);

  const safeIndex =
    currentIndex >= 0 && currentIndex < filteredWords.length ? currentIndex : 0;
  const currentWord: VocabItem = filteredWords[safeIndex] || VOCAB_LIST[0];
  const chars = useMemo(
    () => Array.from(currentWord.hanzi),
    [currentWord.hanzi]
  );
  const safeCharIdx =
    selectedCharIdx >= 0 && selectedCharIdx < chars.length ? selectedCharIdx : 0;
  const targetChar = chars[safeCharIdx] || chars[0];

  // Mark current word as studied when active or changed
  useEffect(() => {
    if (currentWord) {
      onMarkStudied(currentWord.id);
    }
  }, [currentWord, onMarkStudied]);

  // Jump directly to a word selected from the vocabulary notebook
  useEffect(() => {
    if (!jumpToWord) return;
    const idx = VOCAB_LIST.findIndex((w) => w.id === jumpToWord.id);
    if (idx < 0) return;
    clearAutoAdvanceTimer();
    setCurrentLevel("전체");
    setCurrentCategory("전체");
    setCurrentIndex(idx);
    setSelectedCharIdx(0);
    setPeekHanzi(false);
  }, [jumpToWord, clearAutoAdvanceTimer]);

  const moveWord = useCallback(
    (delta: number) => {
      clearAutoAdvanceTimer();
      const len = filteredWords.length;
      if (len === 0) return;
      setCurrentIndex((prev) => (prev + delta + len) % len);
      setSelectedCharIdx(0);
      setPeekHanzi(false);
    },
    [clearAutoAdvanceTimer, filteredWords.length]
  );

  const startStrokeQuiz = useCallback(
    (token: number, charLabel: string) => {
      const writer = writerRef.current;
      if (!writer || token !== renderTokenRef.current) return;
      clearAutoAdvanceTimer();
      const isBlind = writingModeRef.current === "blind";
      setWriterStatus({
        text: isBlind
          ? `🙈 안보고 쓰기: '${safeCharIdx + 1}번째 글자'를 기억해서 써 보세요!`
          : `✍️ '${charLabel}' 획순에 맞춰 직접 써 보세요! (모르면 아래 획순 보기)`,
        type: "info",
      });
      writer.quiz({
        showHintAfterMisses: isBlind ? 3 : 2,
        highlightOnComplete: true,
        onCorrectStroke: (d) => {
          if (token === renderTokenRef.current && d.strokesRemaining > 0) {
            setWriterStatus({
              text: `👍 좋아요! 남은 획수: ${d.strokesRemaining}획`,
              type: "info",
            });
          }
        },
        onMistake: () => {
          if (token === renderTokenRef.current) {
            setWriterStatus({
              text: "💡 획순과 방향이 다릅니다! (모르면 '획순 보기' 클릭)",
              type: "warn",
            });
          }
        },
        onComplete: (d) => {
          if (token !== renderTokenRef.current) return;
          if (writingModeRef.current === "blind") {
            try {
              void writerRef.current?.showCharacter({ duration: 150 });
            } catch {
              // ignore
            }
          }
          const hasNextChar = safeCharIdx < chars.length - 1;
          if (autoAdvanceRef.current) {
            setWriterStatus({
              text: hasNextChar
                ? `🎉 '${charLabel}' 완료! (실수 ${d.totalMistakes}회) · 다음 글자로 이동합니다...`
                : `🎉 '${currentWord.hanzi}' 쓰기 완료! (실수 ${d.totalMistakes}회) · 다음 단어로 이동합니다...`,
              type: "success",
            });
            autoAdvanceTimerRef.current = window.setTimeout(() => {
              if (token !== renderTokenRef.current) return;
              if (hasNextChar) {
                setSelectedCharIdx((prev) => prev + 1);
              } else {
                moveWord(1);
              }
            }, hasNextChar ? 850 : 1050);
          } else {
            setWriterStatus({
              text: `🎉 '${charLabel}' 쓰기 완료! (실수 ${d.totalMistakes}회)`,
              type: "success",
            });
          }
        },
      });
    },
    [
      chars.length,
      clearAutoAdvanceTimer,
      currentWord.hanzi,
      moveWord,
      safeCharIdx,
    ]
  );

  const initHanziWriter = useCallback(() => {
    if (!isActive || !hanziTargetRef.current) return;
    const token = ++renderTokenRef.current;
    clearAutoAdvanceTimer();

    if (writerRef.current) {
      try {
        writerRef.current.cancelQuiz();
      } catch {
        // ignore
      }
      writerRef.current = null;
    }

    hanziTargetRef.current.innerHTML = "";
    const size = tianziBoxRef.current?.clientWidth || 270;
    const isBlind = writingModeRef.current === "blind";
    setWriterStatus({
      text: isBlind
        ? `${safeCharIdx + 1}번째 글자 쓰기 준비 중...`
        : `'${targetChar}' 쓰기 준비 중...`,
      type: "info",
    });

    try {
      writerRef.current = HanziWriter.create(hanziTargetRef.current, targetChar, {
        width: size,
        height: size,
        padding: 14,
        showOutline: !isBlind,
        showCharacter: false,
        strokeAnimationSpeed: 1.15,
        delayBetweenStrokes: 220,
        strokeColor: "#1e293b",
        outlineColor: "#cbd5e1",
        drawingColor: "#dc2626",
        drawingWidth: 18,
        highlightColor: "#2563eb",
        highlightOnComplete: true,
        onLoadCharDataSuccess: () => {
          if (token === renderTokenRef.current) {
            startStrokeQuiz(token, targetChar);
          }
        },
        onLoadCharDataError: () => {
          if (token === renderTokenRef.current) {
            setWriterStatus({
              text: `'${targetChar}' 한자 데이터를 불러오지 못했습니다.`,
              type: "warn",
            });
          }
        },
      });
    } catch {
      setWriterStatus({
        text: "Hanzi Writer를 초기화하지 못했습니다. 인터넷 연결을 확인하세요.",
        type: "warn",
      });
    }
  }, [clearAutoAdvanceTimer, isActive, safeCharIdx, startStrokeQuiz, targetChar]);

  useEffect(() => {
    if (isActive) {
      initHanziWriter();
    } else {
      clearAutoAdvanceTimer();
    }
    return () => {
      clearAutoAdvanceTimer();
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch {
          // ignore
        }
      }
    };
  }, [isActive, initHanziWriter, clearAutoAdvanceTimer]);

  const handleChangeWritingMode = (nextMode: "guided" | "blind") => {
    if (nextMode === writingMode) return;
    clearAutoAdvanceTimer();
    writingModeRef.current = nextMode;
    setWritingMode(nextMode);
    setPeekHanzi(false);

    const writer = writerRef.current;
    if (writer) {
      try {
        if (nextMode === "blind") {
          void writer.hideOutline({ duration: 150 });
          setWriterStatus({
            text: `🙈 안보고 쓰기: '${safeCharIdx + 1}번째 글자'를 기억해서 써 보세요!`,
            type: "info",
          });
        } else {
          void writer.showOutline({ duration: 150 });
          setWriterStatus({
            text: `✍️ '${targetChar}' 획순에 맞춰 직접 써 보세요! (모르면 아래 획순 보기)`,
            type: "info",
          });
        }
      } catch {
        // ignore
      }
    }
  };

  const handlePlayAnimation = () => {
    clearAutoAdvanceTimer();
    const token = renderTokenRef.current;
    const writer = writerRef.current;
    if (!writer) return;
    try {
      writer.cancelQuiz();
    } catch {
      // ignore
    }
    setWriterStatus({
      text:
        writingModeRef.current === "blind"
          ? `🎬 '${safeCharIdx + 1}번째 글자' 획순 애니메이션 재생 중...`
          : `🎬 '${targetChar}' 획순 애니메이션 재생 중...`,
      type: "info",
    });
    writer.animateCharacter({
      onComplete: () => {
        if (token === renderTokenRef.current) {
          startStrokeQuiz(token, targetChar);
        }
      },
    });
  };

  const handleClearWrite = () => {
    clearAutoAdvanceTimer();
    const writer = writerRef.current;
    if (!writer) return;
    try {
      writer.cancelQuiz();
      void writer.hideCharacter({ duration: 0 });
    } catch {
      // ignore
    }
    startStrokeQuiz(renderTokenRef.current, targetChar);
  };

  const pickRandomWord = () => {
    clearAutoAdvanceTimer();
    const len = filteredWords.length;
    if (len <= 1) return;
    let nextIdx = safeIndex;
    while (nextIdx === safeIndex) {
      nextIdx = Math.floor(Math.random() * len);
    }
    setCurrentIndex(nextIdx);
    setSelectedCharIdx(0);
    setPeekHanzi(false);
  };

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const onKeyDown = (evt: KeyboardEvent) => {
      if (!isActive) return;
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
      if (evt.key === "ArrowLeft") moveWord(-1);
      if (evt.key === "ArrowRight") moveWord(1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isActive, moveWord]);

  const handleSpeak = (mode: "normal" | "slow") => {
    const rate = mode === "slow" ? 0.7 : 1.0;
    speakChinese(currentWord.hanzi, rate, {
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

  const statusColorClass =
    writerStatus.type === "success"
      ? "text-[#16a34a]"
      : writerStatus.type === "warn"
      ? "text-[#d97706]"
      : "text-[#2563eb]";

  return (
    <section aria-label="단어 및 획순 쓰기 학습">
      {/* Toolbar */}
      <div className="bg-white border border-[#e2e8f0] rounded-[18px] px-3.5 py-3 mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <select
            aria-label="난이도 선택"
            value={currentLevel}
            onChange={(e) => {
              clearAutoAdvanceTimer();
              setCurrentLevel(e.target.value as LevelFilter);
              setCurrentCategory("전체");
              setCurrentIndex(0);
              setSelectedCharIdx(0);
              setPeekHanzi(false);
            }}
            className="px-3 py-2 border border-[#e2e8f0] rounded-[10px] bg-[#f8fafc] text-[#1e293b] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] max-w-full"
          >
            <option value="전체">전체 난이도 ({levelCounts.전체})</option>
            <option value="초급">초급 ({levelCounts.초급})</option>
            <option value="중급">중급 ({levelCounts.중급})</option>
            <option value="고급">고급 ({levelCounts.고급})</option>
          </select>

          <select
            aria-label="주제 선택"
            value={effectiveCategory}
            onChange={(e) => {
              clearAutoAdvanceTimer();
              setCurrentCategory(e.target.value);
              setCurrentIndex(0);
              setSelectedCharIdx(0);
              setPeekHanzi(false);
            }}
            className="px-3 py-2 border border-[#e2e8f0] rounded-[10px] bg-[#f8fafc] text-[#1e293b] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] max-w-full"
          >
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name} ({cat.count})
              </option>
            ))}
          </select>

          <select
            aria-label="단어 바로가기"
            value={safeIndex}
            onChange={(e) => {
              clearAutoAdvanceTimer();
              setCurrentIndex(Number(e.target.value));
              setSelectedCharIdx(0);
              setPeekHanzi(false);
            }}
            className="px-3 py-2 border border-[#e2e8f0] rounded-[10px] bg-[#f8fafc] text-[#1e293b] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] max-w-full"
          >
            {filteredWords.map((w, idx) => (
              <option key={w.id} value={idx}>
                {writingMode === "blind" && !peekHanzi
                  ? `${idx + 1}. ${w.pinyin} (${w.meaning})`
                  : `${idx + 1}. ${w.hanzi} (${w.meaning})`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => moveWord(-1)}
            className="border border-[#e2e8f0] bg-white text-[#1e293b] px-3.5 py-2 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:-translate-y-px select-none"
          >
            ⬅️ 이전
          </button>
          <button
            type="button"
            onClick={pickRandomWord}
            className="border border-[#e2e8f0] bg-white text-[#1e293b] px-3.5 py-2 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:-translate-y-px select-none"
          >
            🎲 랜덤
          </button>
          <button
            type="button"
            onClick={() => moveWord(1)}
            className="border border-[#dc2626] bg-[#dc2626] text-white px-3.5 py-2 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#b91c1c] hover:border-[#b91c1c] hover:-translate-y-px select-none"
          >
            다음 ➡️
          </button>
        </div>
      </div>

      {/* Study Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-4 items-stretch">
        {/* Left: Word Study Card */}
        <article className="card-surface p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.78rem] font-bold ${
                  LEVEL_BADGE_CLASSES[currentWord.level]
                }`}
              >
                {currentWord.level}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.78rem] font-bold bg-[#f1f5f9] text-[#475569]">
                {currentWord.category}
              </span>
            </div>
            {studiedIds.has(currentWord.id) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.78rem] font-bold bg-[#f0fdf4] text-[#16a34a]">
                ✔ 학습 완료
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center pt-3.5 px-1.5 pb-4">
            <div
              className={`font-hanzi text-[clamp(3rem,8vw,4.9rem)] font-bold leading-[1.15] text-[#0f172a] mb-1.5 transition-all duration-200 ${
                writingMode === "blind" && !peekHanzi
                  ? "blur-[14px] opacity-25 select-none"
                  : ""
              }`}
            >
              {currentWord.hanzi}
            </div>
            {writingMode === "blind" && (
              <button
                type="button"
                onClick={() => setPeekHanzi((prev) => !prev)}
                className="border-none bg-transparent text-[#2563eb] text-[0.78rem] font-bold cursor-pointer mb-1.5"
              >
                {peekHanzi ? "🙈 한자 다시 가리기" : "👁️ 한자 잠깐 보기"}
              </button>
            )}
            <div className="text-[clamp(1.3rem,3vw,1.75rem)] font-bold text-[#dc2626] mb-4">
              {currentWord.pinyin}
            </div>

            <div className="w-full max-w-[360px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] px-4 py-3.5 mb-4">
              <div className="text-[0.76rem] font-bold text-[#64748b] mb-1 flex justify-between items-center">
                <span>한국어 뜻</span>
                <button
                  type="button"
                  onClick={() => setHideMeaning((prev) => !prev)}
                  className="border-none bg-transparent text-[#2563eb] text-[0.78rem] font-bold cursor-pointer"
                >
                  {hideMeaning ? "뜻 보기" : "뜻 가리기"}
                </button>
              </div>
              <div
                className={`text-[1.2rem] font-bold transition-all duration-200 ${
                  hideMeaning ? "blur-[8px] opacity-35 select-none" : ""
                }`}
              >
                {currentWord.meaning}
              </div>
            </div>

            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5 w-full max-w-[380px]">
              <button
                type="button"
                onClick={() => handleSpeak("normal")}
                className={`border border-[#2563eb] bg-[#2563eb] text-white px-3.5 py-2.5 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#1d4ed8] hover:border-[#1d4ed8] hover:-translate-y-px select-none ${
                  speakingBtn === "normal" ? "btn-speaking" : ""
                }`}
              >
                🔊 발음 듣기
              </button>
              <button
                type="button"
                onClick={() => handleSpeak("slow")}
                className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-3.5 py-2.5 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#dbeafe] hover:-translate-y-px select-none ${
                  speakingBtn === "slow" ? "btn-speaking" : ""
                }`}
              >
                🐢 0.7배속 천천히
              </button>
            </div>

            <div className="mt-2.5 text-[0.8rem] text-[#64748b] min-h-[18px] text-center">
              {ttsNotice}
            </div>
          </div>
        </article>

        {/* Right: Hanzi Writer Tianzige Card */}
        <article className="card-surface p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
            <h2 className="text-[1rem] font-extrabold m-0">
              ✍️ 전(田)자 칸 획순 따라 쓰기
            </h2>
            <button
              type="button"
              onClick={() => {
                clearAutoAdvanceTimer();
                setAutoAdvance((prev) => !prev);
              }}
              className={`border px-2.5 py-1 rounded-full text-[0.75rem] font-bold cursor-pointer transition ${
                autoAdvance
                  ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]"
                  : "bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]"
              }`}
            >
              {autoAdvance ? "⏭ 완료 시 자동 넘김 ON" : "⏭ 자동 넘김 OFF"}
            </button>
          </div>

          <div className="flex justify-center mb-3">
            <div
              className="inline-flex bg-[#e2e8f0] p-1 rounded-[10px] gap-1"
              role="group"
              aria-label="쓰기 모드 선택"
            >
              <button
                type="button"
                onClick={() => handleChangeWritingMode("guided")}
                className={`border-none px-3 py-1.5 rounded-[8px] text-[0.8rem] font-bold cursor-pointer transition ${
                  writingMode === "guided"
                    ? "bg-white text-[#1e293b] shadow-xs"
                    : "bg-transparent text-[#475569]"
                }`}
              >
                👁️ 보고 하기
              </button>
              <button
                type="button"
                onClick={() => handleChangeWritingMode("blind")}
                className={`border-none px-3 py-1.5 rounded-[8px] text-[0.8rem] font-bold cursor-pointer transition ${
                  writingMode === "blind"
                    ? "bg-white text-[#1e293b] shadow-xs"
                    : "bg-transparent text-[#475569]"
                }`}
              >
                🙈 안보고 하기
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-2 flex-wrap mb-3">
            {chars.map((ch, idx) => (
              <button
                key={`${currentWord.id}-${idx}-${ch}`}
                type="button"
                onClick={() => {
                  clearAutoAdvanceTimer();
                  setSelectedCharIdx(idx);
                }}
                className={`min-w-[40px] h-[40px] px-2.5 rounded-[10px] border font-bold cursor-pointer transition ${
                  writingMode === "blind" && !peekHanzi
                    ? "text-[0.85rem]"
                    : "font-hanzi text-[1.25rem]"
                } ${
                  idx === safeCharIdx
                    ? "bg-[#fef2f2] border-[#dc2626] text-[#dc2626]"
                    : "bg-[#f8fafc] border-[#e2e8f0] text-[#475569]"
                }`}
              >
                {writingMode === "blind" && !peekHanzi ? `${idx + 1}자` : ch}
              </button>
            ))}
          </div>

          <div
            ref={tianziBoxRef}
            className="w-[270px] h-[270px] min-[420px]:w-[290px] min-[420px]:h-[290px] max-w-full mx-auto mb-2.5 relative bg-white border-2 border-[#fca5a5] rounded-[14px] overflow-hidden touch-none"
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="50"
                y1="0"
                x2="50"
                y2="100"
                stroke="#fca5a5"
                strokeWidth="0.9"
                strokeDasharray="3,2.5"
              />
              <line
                x1="0"
                y1="50"
                x2="100"
                y2="50"
                stroke="#fca5a5"
                strokeWidth="0.9"
                strokeDasharray="3,2.5"
              />
              <line
                x1="0"
                y1="0"
                x2="100"
                y2="100"
                stroke="#fee2e2"
                strokeWidth="0.7"
                strokeDasharray="2.5,2.5"
              />
              <line
                x1="100"
                y1="0"
                x2="0"
                y2="100"
                stroke="#fee2e2"
                strokeWidth="0.7"
                strokeDasharray="2.5,2.5"
              />
            </svg>
            <div
              ref={hanziTargetRef}
              className="relative z-[2] w-full h-full grid place-items-center"
            />
          </div>

          <div
            className={`text-center text-[0.85rem] font-bold min-h-[22px] mb-3 ${statusColorClass}`}
          >
            {writerStatus.text}
          </div>

          <div className="flex justify-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handlePlayAnimation}
              className="border border-[#fde68a] bg-[#fffbeb] text-[#d97706] px-3.5 py-2 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#fef3c7] hover:-translate-y-px select-none"
            >
              🎬 모르겠어요 (획순 보기)
            </button>
            <button
              type="button"
              onClick={handleClearWrite}
              className="border border-[#e2e8f0] bg-white text-[#1e293b] px-3.5 py-2 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer min-h-[40px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:-translate-y-px select-none"
            >
              🗑️ 지우기
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
