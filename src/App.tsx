import { useCallback, useEffect, useState } from "react";
import { ConversationPanel } from "./components/ConversationPanel";
import { CulturePanel } from "./components/CulturePanel";
import { ExamPanel } from "./components/ExamPanel";
import { LearnPanel } from "./components/LearnPanel";
import { NumbersCalculatorPanel } from "./components/NumbersCalculatorPanel";
import { QuizPanel } from "./components/QuizPanel";
import { SpeakingPanel } from "./components/SpeakingPanel";
import { VocabBookPanel } from "./components/VocabBookPanel";
import { VOCAB_LIST } from "./data/chineseData";
import { initSpeechVoices, stopChineseSpeech } from "./utils/speech";

const STORAGE_KEY = "hs_chinese_studied_v3";

type TabId =
  | "learn"
  | "vocab"
  | "numbers"
  | "conv"
  | "culture"
  | "quiz"
  | "exam"
  | "speaking";

function loadStudiedIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) {
        return new Set(arr.filter((n) => typeof n === "number"));
      }
    }
  } catch {
    // ignore storage errors
  }
  return new Set([VOCAB_LIST[0].id]);
}

function saveStudiedIds(ids: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore storage errors
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("learn");
  const [studiedIds, setStudiedIds] = useState<Set<number>>(() =>
    loadStudiedIds()
  );
  const [lastActiveWordId, setLastActiveWordId] = useState<number>(
    VOCAB_LIST[0].id
  );
  const [jumpToWord, setJumpToWord] = useState<{
    id: number;
    seq: number;
  } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  useEffect(() => {
    initSpeechVoices();
    return () => {
      stopChineseSpeech();
    };
  }, []);

  const handleMarkStudied = useCallback((wordId: number) => {
    setLastActiveWordId(wordId);
    setStudiedIds((prev) => {
      if (prev.has(wordId)) return prev;
      const next = new Set(prev);
      next.add(wordId);
      saveStudiedIds(next);
      return next;
    });
  }, []);

  const handleConfirmReset = () => {
    const resetSet = new Set([lastActiveWordId]);
    setStudiedIds(resetSet);
    saveStudiedIds(resetSet);
    setShowResetConfirm(false);
  };

  const progressPct = Math.round(
    (studiedIds.size / VOCAB_LIST.length) * 100
  );

  const handlePracticeWord = useCallback((wordId: number) => {
    stopChineseSpeech();
    setJumpToWord({ id: wordId, seq: Date.now() });
    setActiveTab("learn");
  }, []);

  const tabs: { id: TabId; label: string }[] = [
    { id: "learn", label: "📖 단어·쓰기" },
    { id: "vocab", label: "📒 단어장" },
    { id: "numbers", label: "🔢 숫자·계산기" },
    { id: "conv", label: "💬 실생활 회화" },
    { id: "culture", label: "🏮 중국 문화" },
    { id: "quiz", label: "🎯 3·5지선다 퀴즈" },
    { id: "exam", label: "📝 수능·내신·HSK" },
    { id: "speaking", label: "🎤 중국어 말하기" },
  ];

  return (
    <div className="max-w-[1080px] mx-auto px-4 pt-4 pb-11">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-[46px] h-[46px] rounded-[14px] text-white grid place-items-center text-[1.5rem] font-bold shrink-0 font-hanzi"
            style={{
              background: "linear-gradient(135deg, #ef4444, #b91c1c)",
              boxShadow: "0 6px 14px rgba(220, 38, 38, 0.25)",
            }}
          >
            汉
          </div>
          <div>
            <h1 className="m-0 text-[1.25rem] font-extrabold tracking-[-0.02em]">
              기초·심화 중국어 마스터
            </h1>
            <p className="mt-0.5 mb-0 text-[0.84rem] text-[#64748b]">
              초급·중급·고급 · 단어·숫자·계산기·회화·쓰기·문화·말하기 학습
            </p>
          </div>
        </div>

        <div
          className="bg-white border border-[#e2e8f0] rounded-full px-3.5 py-2 flex items-center gap-2.5 text-[0.85rem] font-bold"
          title="단어 학습 화면에서 확인한 단어가 자동 누적됩니다"
        >
          <span>
            학습 {studiedIds.size} / {VOCAB_LIST.length}
          </span>
          <div className="w-[78px] h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
            <div
              className="h-full transition-[width] duration-300 ease-out"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #ef4444, #f97316)",
              }}
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav
        className="flex flex-wrap gap-1.5 bg-[#e2e8f0] p-[5px] rounded-[14px] mb-[18px]"
        role="tablist"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                stopChineseSpeech();
                setActiveTab(tab.id);
              }}
              className={`flex-1 min-w-[108px] border-none py-2.5 px-2 rounded-[10px] text-[0.84rem] font-bold cursor-pointer flex items-center justify-center gap-1 transition whitespace-nowrap ${
                active
                  ? "bg-white text-[#1e293b] shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
                  : "bg-transparent text-[#475569]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Panels */}
      <main>
        <div className={activeTab === "learn" ? "block" : "hidden"}>
          <LearnPanel
            isActive={activeTab === "learn"}
            studiedIds={studiedIds}
            onMarkStudied={handleMarkStudied}
            jumpToWord={jumpToWord}
          />
        </div>

        <div className={activeTab === "vocab" ? "block" : "hidden"}>
          <VocabBookPanel
            studiedIds={studiedIds}
            onPracticeWord={handlePracticeWord}
          />
        </div>

        <div className={activeTab === "numbers" ? "block" : "hidden"}>
          <NumbersCalculatorPanel isActive={activeTab === "numbers"} />
        </div>

        <div className={activeTab === "conv" ? "block" : "hidden"}>
          <ConversationPanel />
        </div>

        <div className={activeTab === "culture" ? "block" : "hidden"}>
          <CulturePanel />
        </div>

        <div className={activeTab === "quiz" ? "block" : "hidden"}>
          <QuizPanel
            isActive={activeTab === "quiz"}
            studiedIds={studiedIds}
            onGoLearn={() => setActiveTab("learn")}
          />
        </div>

        <div className={activeTab === "exam" ? "block" : "hidden"}>
          <ExamPanel isActive={activeTab === "exam"} />
        </div>

        <div className={activeTab === "speaking" ? "block" : "hidden"}>
          <SpeakingPanel
            isActive={activeTab === "speaking"}
            studiedIds={studiedIds}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-6 text-center text-[0.8rem] text-[#64748b] flex justify-center items-center gap-3 flex-wrap">
        <span>
          단축키(PC): ← / → 단어 이동 · 마이크 권한(말하기 연습) 및 인터넷 연결 필요
        </span>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="border-none bg-transparent text-[#64748b] underline cursor-pointer text-[0.8rem]"
        >
          학습 기록 초기화
        </button>
      </footer>

      {/* Reset Progress Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <div className="bg-white border border-[#e2e8f0] rounded-[18px] p-5 max-w-[360px] w-full shadow-xl">
            <h2
              id="reset-dialog-title"
              className="text-[1.05rem] font-extrabold text-[#1e293b] mb-2"
            >
              학습 기록 초기화
            </h2>
            <p className="text-[0.9rem] text-[#475569] mb-4">
              지금까지 학습한 단어 기록을 초기화할까요?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="border border-[#e2e8f0] bg-white text-[#1e293b] px-3.5 py-2 rounded-[10px] text-[0.86rem] font-semibold cursor-pointer hover:bg-[#f8fafc]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="border border-[#dc2626] bg-[#dc2626] text-white px-3.5 py-2 rounded-[10px] text-[0.86rem] font-semibold cursor-pointer hover:bg-[#b91c1c]"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
