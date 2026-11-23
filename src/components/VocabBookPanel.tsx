import { useEffect, useMemo, useState } from "react";
import { Level, LevelFilter, VOCAB_LIST, VocabItem } from "../data/chineseData";
import { speakChinese } from "../utils/speech";

interface VocabBookPanelProps {
  studiedIds: Set<number>;
  onPracticeWord: (wordId: number) => void;
}

type BookScope = "all" | "bookmarked" | "unmemorized" | "memorized" | "custom";
type BookViewMode = "table" | "flashcard";

const BOOKMARK_KEY = "hs_chinese_bookmarks_v1";
const MEMORIZED_KEY = "hs_chinese_memorized_v1";
const CUSTOM_VOCAB_KEY = "hs_chinese_custom_vocab_v1";

function loadIdSet(key: string): Set<number> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((n) => typeof n === "number"));
      }
    }
  } catch {
    // ignore storage errors
  }
  return new Set();
}

function saveIdSet(key: string, ids: Set<number>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // ignore storage errors
  }
}

function loadCustomVocab(): VocabItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_VOCAB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (w) =>
            w &&
            typeof w.id === "number" &&
            typeof w.hanzi === "string" &&
            typeof w.meaning === "string"
        );
      }
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

function saveCustomVocab(list: VocabItem[]) {
  try {
    localStorage.setItem(CUSTOM_VOCAB_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

function stripToneMarks(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function VocabBookPanel({
  studiedIds,
  onPracticeWord,
}: VocabBookPanelProps) {
  const [customWords, setCustomWords] = useState<VocabItem[]>(() =>
    loadCustomVocab()
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() =>
    loadIdSet(BOOKMARK_KEY)
  );
  const [memorizedIds, setMemorizedIds] = useState<Set<number>>(() =>
    loadIdSet(MEMORIZED_KEY)
  );

  const [scope, setScope] = useState<BookScope>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("전체");
  const [categoryFilter, setCategoryFilter] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<BookViewMode>("table");

  // Memorization blindfolds (가림판)
  const [hideHanzi, setHideHanzi] = useState<boolean>(false);
  const [hidePinyin, setHidePinyin] = useState<boolean>(false);
  const [hideMeaning, setHideMeaning] = useState<boolean>(false);
  const [peekRowCells, setPeekRowCells] = useState<Record<string, boolean>>({});

  // Custom word creation drawer
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newHanzi, setNewHanzi] = useState<string>("");
  const [newPinyin, setNewPinyin] = useState<string>("");
  const [newMeaning, setNewMeaning] = useState<string>("");
  const [newLevel, setNewLevel] = useState<Level>("초급");
  const [formNotice, setFormNotice] = useState<string>("");

  // Flashcard state
  const [cardIdx, setCardIdx] = useState<number>(0);
  const [cardFlipped, setCardFlipped] = useState<boolean>(false);
  const [cardFrontMode, setCardFrontMode] = useState<"hanzi" | "meaning">(
    "hanzi"
  );
  const [shuffledOrder, setShuffledOrder] = useState<number[] | null>(null);

  // Audio & clipboard feedback
  const [speakingWordId, setSpeakingWordId] = useState<number | null>(null);
  const [ttsNotice, setTtsNotice] = useState<string>("");
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  const allWords = useMemo(
    () => [...customWords, ...VOCAB_LIST],
    [customWords]
  );

  const customIdSet = useMemo(
    () => new Set(customWords.map((w) => w.id)),
    [customWords]
  );

  const categories = useMemo(() => {
    const base =
      levelFilter === "전체"
        ? allWords
        : allWords.filter((w) => w.level === levelFilter);
    return ["전체", ...Array.from(new Set(base.map((w) => w.category)))];
  }, [allWords, levelFilter]);

  const effectiveCategory = categories.includes(categoryFilter)
    ? categoryFilter
    : "전체";

  const filteredWords = useMemo(() => {
    const q = searchQuery.trim();
    const qPlain = stripToneMarks(q);

    return allWords.filter((w) => {
      if (scope === "bookmarked" && !bookmarkedIds.has(w.id)) return false;
      if (scope === "memorized" && !memorizedIds.has(w.id)) return false;
      if (scope === "unmemorized" && memorizedIds.has(w.id)) return false;
      if (scope === "custom" && !customIdSet.has(w.id)) return false;
      if (levelFilter !== "전체" && w.level !== levelFilter) return false;
      if (effectiveCategory !== "전체" && w.category !== effectiveCategory)
        return false;

      if (q) {
        const hitHanzi = w.hanzi.includes(q);
        const hitMeaning = w.meaning.toLowerCase().includes(q.toLowerCase());
        const hitPinyin =
          w.pinyin.toLowerCase().includes(q.toLowerCase()) ||
          stripToneMarks(w.pinyin).includes(qPlain);
        if (!hitHanzi && !hitMeaning && !hitPinyin) return false;
      }
      return true;
    });
  }, [
    allWords,
    bookmarkedIds,
    customIdSet,
    effectiveCategory,
    levelFilter,
    memorizedIds,
    scope,
    searchQuery,
  ]);

  const deckWords = useMemo(() => {
    if (!shuffledOrder) return filteredWords;
    const byId = new Map(filteredWords.map((w) => [w.id, w]));
    const ordered: VocabItem[] = [];
    for (const id of shuffledOrder) {
      const found = byId.get(id);
      if (found) ordered.push(found);
    }
    for (const w of filteredWords) {
      if (!ordered.includes(w)) ordered.push(w);
    }
    return ordered;
  }, [filteredWords, shuffledOrder]);

  useEffect(() => {
    setCardIdx(0);
    setCardFlipped(false);
    setShuffledOrder(null);
  }, [scope, levelFilter, effectiveCategory, searchQuery]);

  const safeCardIdx =
    deckWords.length > 0 ? Math.min(cardIdx, deckWords.length - 1) : 0;
  const currentCard = deckWords[safeCardIdx];

  const toggleBookmark = (id: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveIdSet(BOOKMARK_KEY, next);
      return next;
    });
  };

  const toggleMemorized = (id: number) => {
    setMemorizedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveIdSet(MEMORIZED_KEY, next);
      return next;
    });
  };

  const handleSpeak = (word: VocabItem) => {
    setTtsNotice("");
    speakChinese(word.hanzi, 1.0, {
      onStart: () => setSpeakingWordId(word.id),
      onEnd: () => setSpeakingWordId(null),
      onError: (msg) => {
        setSpeakingWordId(null);
        setTtsNotice(msg);
      },
    });
  };

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    const hanzi = newHanzi.trim();
    const pinyin = newPinyin.trim();
    const meaning = newMeaning.trim();
    if (!hanzi || !meaning) {
      setFormNotice("한자(중국어)와 한국어 뜻을 모두 입력해 주세요.");
      return;
    }

    const nextWord: VocabItem = {
      id: Date.now(),
      level: newLevel,
      hanzi,
      pinyin: pinyin || "(병음 미입력)",
      meaning,
      category: "내 단어",
    };

    const updated = [nextWord, ...customWords];
    setCustomWords(updated);
    saveCustomVocab(updated);

    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      next.add(nextWord.id);
      saveIdSet(BOOKMARK_KEY, next);
      return next;
    });

    setNewHanzi("");
    setNewPinyin("");
    setNewMeaning("");
    setFormNotice(`'${hanzi}' 단어를 내 단어장에 추가했습니다.`);
  };

  const handleDeleteCustomWord = (id: number) => {
    const updated = customWords.filter((w) => w.id !== id);
    setCustomWords(updated);
    saveCustomVocab(updated);
  };

  const handleCopyWordbook = async () => {
    if (filteredWords.length === 0) return;
    const lines = filteredWords.map(
      (w, idx) => `${idx + 1}. ${w.hanzi} [${w.pinyin}] — ${w.meaning}`
    );
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedNotice(true);
      window.setTimeout(() => setCopiedNotice(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleShuffleCards = () => {
    const ids = filteredWords.map((w) => w.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setShuffledOrder(ids);
    setCardIdx(0);
    setCardFlipped(false);
  };

  const togglePeekCell = (wordId: number, col: "hanzi" | "pinyin" | "meaning") => {
    const key = `${wordId}-${col}`;
    setPeekRowCells((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const unmemorizedCount = allWords.length - memorizedIds.size;

  return (
    <section aria-label="중국어 단어장">
      {/* Summary & Search Toolbar */}
      <div className="bg-white border border-[#e2e8f0] rounded-[18px] p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-[1.1rem] font-extrabold text-[#0f172a] m-0">
              중국어 단어장
            </h2>
            <p className="text-[0.82rem] text-[#64748b] mt-0.5 mb-0 tabular-nums">
              전체 {allWords.length}단어 · 암기 완료 {memorizedIds.size}개 ·
              즐겨찾기 {bookmarkedIds.size}개 · 쓰기 학습 {studiedIds.size}개
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex bg-[#f1f5f9] p-1 rounded-[10px] gap-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`border-none px-3 py-1.5 rounded-[8px] text-[0.82rem] font-bold cursor-pointer whitespace-nowrap transition ${
                  viewMode === "table"
                    ? "bg-white text-[#0f172a] shadow-xs"
                    : "bg-transparent text-[#64748b]"
                }`}
              >
                단어장 표
              </button>
              <button
                type="button"
                onClick={() => setViewMode("flashcard")}
                className={`border-none px-3 py-1.5 rounded-[8px] text-[0.82rem] font-bold cursor-pointer whitespace-nowrap transition ${
                  viewMode === "flashcard"
                    ? "bg-white text-[#0f172a] shadow-xs"
                    : "bg-transparent text-[#64748b]"
                }`}
              >
                플래시카드 암기
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddForm((prev) => !prev);
                setFormNotice("");
              }}
              className={`border px-3 py-1.5 rounded-[10px] text-[0.82rem] font-bold cursor-pointer whitespace-nowrap transition ${
                showAddForm
                  ? "border-[#dc2626] bg-[#fef2f2] text-[#dc2626]"
                  : "border-[#dc2626] bg-[#dc2626] text-white hover:bg-[#b91c1c]"
              }`}
            >
              {showAddForm ? "추가 닫기" : "+ 단어 추가"}
            </button>
          </div>
        </div>

        {/* Add Custom Word Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleAddCustomWord}
            className="mb-3.5 p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px]"
          >
            <div className="text-[0.84rem] font-bold text-[#0f172a] mb-2">
              나만의 중국어 단어 등록
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
              <input
                type="text"
                value={newHanzi}
                onChange={(e) => setNewHanzi(e.target.value)}
                placeholder="한자 (예: 加油)"
                className="px-3 py-2 bg-white border border-[#cbd5e1] rounded-[9px] text-[0.86rem] font-hanzi focus:outline-none focus:border-[#dc2626]"
              />
              <input
                type="text"
                value={newPinyin}
                onChange={(e) => setNewPinyin(e.target.value)}
                placeholder="병음 (예: jiāyóu)"
                className="px-3 py-2 bg-white border border-[#cbd5e1] rounded-[9px] text-[0.86rem] focus:outline-none focus:border-[#dc2626]"
              />
              <input
                type="text"
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                placeholder="한국어 뜻 (예: 힘내다, 파이팅)"
                className="px-3 py-2 bg-white border border-[#cbd5e1] rounded-[9px] text-[0.86rem] focus:outline-none focus:border-[#dc2626]"
              />
              <div className="flex gap-2">
                <select
                  aria-label="단어 난이도"
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value as Level)}
                  className="px-2.5 py-2 bg-white border border-[#cbd5e1] rounded-[9px] text-[0.84rem] font-semibold"
                >
                  <option value="초급">초급</option>
                  <option value="중급">중급</option>
                  <option value="고급">고급</option>
                </select>
                <button
                  type="submit"
                  className="flex-1 border border-[#dc2626] bg-[#dc2626] text-white px-3 py-2 rounded-[9px] text-[0.84rem] font-bold cursor-pointer hover:bg-[#b91c1c] whitespace-nowrap"
                >
                  저장
                </button>
              </div>
            </div>
            {formNotice && (
              <div className="text-[0.8rem] font-semibold text-[#15803d]">
                {formNotice}
              </div>
            )}
          </form>
        )}

        {/* Filter Row 1: Search + Level + Category */}
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="한자, 병음(성조 없이 입력 가능), 뜻 검색..."
            aria-label="단어장 검색"
            className="flex-1 min-w-[220px] px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] text-[0.86rem] text-[#0f172a] focus:outline-none focus:bg-white focus:border-[#dc2626]"
          />

          <select
            aria-label="난이도 필터"
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value as LevelFilter);
              setCategoryFilter("전체");
            }}
            className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-[10px] text-[0.84rem] font-bold text-[#1e293b]"
          >
            <option value="전체">전체 급수</option>
            <option value="초급">초급</option>
            <option value="중급">중급</option>
            <option value="고급">고급</option>
          </select>

          <select
            aria-label="카테고리 필터"
            value={effectiveCategory}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-[10px] text-[0.84rem] font-bold text-[#1e293b]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "전체" ? "전체 주제" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Row 2: Scope Tabs + Blindfold Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f1f5f9]">
          <div className="inline-flex bg-[#f1f5f9] p-1 rounded-[10px] gap-1 flex-wrap">
            {(
              [
                { id: "all", label: `전체 (${allWords.length})` },
                { id: "bookmarked", label: `즐겨찾기 (${bookmarkedIds.size})` },
                { id: "unmemorized", label: `미암기 (${unmemorizedCount})` },
                { id: "memorized", label: `암기완료 (${memorizedIds.size})` },
                { id: "custom", label: `직접추가 (${customWords.length})` },
              ] as { id: BookScope; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScope(item.id)}
                className={`border-none px-2.5 py-1 rounded-[7px] text-[0.78rem] font-bold cursor-pointer whitespace-nowrap tabular-nums transition ${
                  scope === item.id
                    ? "bg-white text-[#0f172a] shadow-xs"
                    : "bg-transparent text-[#64748b]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {viewMode === "table" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setHideHanzi((p) => !p);
                    setPeekRowCells({});
                  }}
                  className={`border px-2.5 py-1 rounded-[8px] text-[0.78rem] font-bold cursor-pointer whitespace-nowrap transition ${
                    hideHanzi
                      ? "border-[#dc2626] bg-[#fef2f2] text-[#dc2626]"
                      : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]"
                  }`}
                >
                  한자 가리기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHidePinyin((p) => !p);
                    setPeekRowCells({});
                  }}
                  className={`border px-2.5 py-1 rounded-[8px] text-[0.78rem] font-bold cursor-pointer whitespace-nowrap transition ${
                    hidePinyin
                      ? "border-[#dc2626] bg-[#fef2f2] text-[#dc2626]"
                      : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]"
                  }`}
                >
                  병음 가리기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHideMeaning((p) => !p);
                    setPeekRowCells({});
                  }}
                  className={`border px-2.5 py-1 rounded-[8px] text-[0.78rem] font-bold cursor-pointer whitespace-nowrap transition ${
                    hideMeaning
                      ? "border-[#dc2626] bg-[#fef2f2] text-[#dc2626]"
                      : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]"
                  }`}
                >
                  뜻 가리기
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleCopyWordbook}
              disabled={filteredWords.length === 0}
              className="border border-[#e2e8f0] bg-white text-[#334155] px-2.5 py-1 rounded-[8px] text-[0.78rem] font-bold cursor-pointer hover:bg-[#f8fafc] disabled:opacity-45 whitespace-nowrap"
            >
              {copiedNotice ? "복사 완료" : "목록 복사"}
            </button>
          </div>
        </div>

        {ttsNotice && (
          <div className="mt-2.5 text-[0.8rem] font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-[9px] px-3 py-1.5">
            {ttsNotice}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredWords.length === 0 ? (
        <div className="card-surface p-8 text-center">
          <div className="text-[1rem] font-bold text-[#0f172a] mb-1">
            조건에 맞는 단어가 없습니다
          </div>
          <p className="text-[0.86rem] text-[#64748b] mb-3">
            검색어를 지우거나 필터를 ‘전체’로 바꾸어 보세요.
          </p>
          <button
            type="button"
            onClick={() => {
              setScope("all");
              setLevelFilter("전체");
              setCategoryFilter("전체");
              setSearchQuery("");
            }}
            className="border border-[#e2e8f0] bg-white text-[#1e293b] px-4 py-2 rounded-[10px] text-[0.84rem] font-bold cursor-pointer hover:bg-[#f8fafc]"
          >
            필터 초기화
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="card-surface overflow-hidden">
          <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between text-[0.78rem] font-bold text-[#64748b] tabular-nums">
            <span>검색 결과 {filteredWords.length}단어</span>
            <span>가려진 항목은 클릭하면 개별 확인됩니다</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-[0.76rem] font-bold text-[#64748b] bg-[#fcfcfd]">
                  <th className="py-2.5 pl-4 pr-2 w-10 tabular-nums">#</th>
                  <th className="py-2.5 px-2 w-20 text-center">즐겨찾기 · 암기</th>
                  <th className="py-2.5 px-3">한자</th>
                  <th className="py-2.5 px-3">병음</th>
                  <th className="py-2.5 px-3">한국어 뜻</th>
                  <th className="py-2.5 px-3 hidden md:table-cell">구분</th>
                  <th className="py-2.5 pl-2 pr-4 text-right">학습</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-[0.9rem]">
                {filteredWords.map((word, idx) => {
                  const isBookmarked = bookmarkedIds.has(word.id);
                  const isMemorized = memorizedIds.has(word.id);
                  const isCustom = customIdSet.has(word.id);

                  const hanziHidden =
                    hideHanzi && !peekRowCells[`${word.id}-hanzi`];
                  const pinyinHidden =
                    hidePinyin && !peekRowCells[`${word.id}-pinyin`];
                  const meaningHidden =
                    hideMeaning && !peekRowCells[`${word.id}-meaning`];

                  return (
                    <tr
                      key={word.id}
                      className={`transition-colors ${
                        isMemorized ? "bg-[#f8fafc]/70" : "hover:bg-[#fafafa]"
                      }`}
                    >
                      <td className="py-3 pl-4 pr-2 text-[0.78rem] text-[#94a3b8] font-semibold tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(word.id)}
                            aria-label={
                              isBookmarked ? "즐겨찾기 해제" : "즐겨찾기 추가"
                            }
                            className={`w-7 h-7 rounded-[7px] border text-[0.9rem] grid place-items-center cursor-pointer transition ${
                              isBookmarked
                                ? "border-[#f59e0b] bg-[#fffbeb] text-[#d97706]"
                                : "border-[#e2e8f0] bg-white text-[#94a3b8] hover:text-[#475569]"
                            }`}
                          >
                            {isBookmarked ? "★" : "☆"}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleMemorized(word.id)}
                            aria-label={
                              isMemorized ? "암기 완료 해제" : "암기 완료 표시"
                            }
                            className={`px-2 h-7 rounded-[7px] border text-[0.74rem] font-bold cursor-pointer whitespace-nowrap transition ${
                              isMemorized
                                ? "border-[#16a34a] bg-[#f0fdf4] text-[#15803d]"
                                : "border-[#e2e8f0] bg-white text-[#64748b] hover:bg-[#f8fafc]"
                            }`}
                          >
                            {isMemorized ? "완료" : "체크"}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() =>
                            hideHanzi && togglePeekCell(word.id, "hanzi")
                          }
                          className={`border-none bg-transparent p-0 text-left font-hanzi text-[1.22rem] font-extrabold ${
                            hideHanzi ? "cursor-pointer" : "cursor-default"
                          } ${
                            hanziHidden
                              ? "text-[#94a3b8] text-[0.78rem] font-sans font-semibold bg-[#f1f5f9] px-2 py-1 rounded"
                              : isMemorized
                              ? "text-[#475569]"
                              : "text-[#0f172a]"
                          }`}
                        >
                          {hanziHidden ? "눌러서 한자 보기" : word.hanzi}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() =>
                            hidePinyin && togglePeekCell(word.id, "pinyin")
                          }
                          className={`border-none bg-transparent p-0 text-left text-[0.88rem] font-semibold ${
                            hidePinyin ? "cursor-pointer" : "cursor-default"
                          } ${
                            pinyinHidden
                              ? "text-[#94a3b8] text-[0.76rem] bg-[#f1f5f9] px-2 py-1 rounded"
                              : "text-[#dc2626]"
                          }`}
                        >
                          {pinyinHidden ? "눌러서 병음 보기" : word.pinyin}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() =>
                            hideMeaning && togglePeekCell(word.id, "meaning")
                          }
                          className={`border-none bg-transparent p-0 text-left text-[0.9rem] font-medium ${
                            hideMeaning ? "cursor-pointer" : "cursor-default"
                          } ${
                            meaningHidden
                              ? "text-[#94a3b8] text-[0.76rem] bg-[#f1f5f9] px-2 py-1 rounded"
                              : "text-[#1e293b]"
                          }`}
                        >
                          {meaningHidden ? "눌러서 뜻 보기" : word.meaning}
                        </button>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell text-[0.78rem] text-[#64748b] whitespace-nowrap">
                        {word.level} · {word.category}
                      </td>
                      <td className="py-3 pl-2 pr-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSpeak(word)}
                            className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-2.5 py-1 rounded-[8px] text-[0.76rem] font-bold cursor-pointer hover:bg-[#dbeafe] ${
                              speakingWordId === word.id ? "btn-speaking" : ""
                            }`}
                          >
                            🔊
                          </button>
                          {!isCustom ? (
                            <button
                              type="button"
                              onClick={() => onPracticeWord(word.id)}
                              className="border border-[#e2e8f0] bg-white text-[#1e293b] px-2.5 py-1 rounded-[8px] text-[0.76rem] font-bold cursor-pointer hover:bg-[#f8fafc]"
                            >
                              쓰기
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomWord(word.id)}
                              className="border border-[#fecaca] bg-[#fef2f2] text-[#b91c1c] px-2.5 py-1 rounded-[8px] text-[0.76rem] font-bold cursor-pointer hover:bg-[#fee2e2]"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Flashcard Drill View */
        currentCard && (
          <div className="max-w-[600px] mx-auto card-surface p-6">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
              <div className="text-[0.84rem] font-bold text-[#64748b] tabular-nums">
                카드 {safeCardIdx + 1} / {deckWords.length} · {currentCard.level}{" "}
                · {currentCard.category}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCardFrontMode((prev) =>
                      prev === "hanzi" ? "meaning" : "hanzi"
                    );
                    setCardFlipped(false);
                  }}
                  className="border border-[#e2e8f0] bg-white text-[#334155] px-2.5 py-1 rounded-[8px] text-[0.78rem] font-bold cursor-pointer hover:bg-[#f8fafc] whitespace-nowrap"
                >
                  {cardFrontMode === "hanzi" ? "한자 → 뜻" : "뜻 → 한자"}
                </button>
                <button
                  type="button"
                  onClick={handleShuffleCards}
                  className="border border-[#e2e8f0] bg-white text-[#334155] px-2.5 py-1 rounded-[8px] text-[0.78rem] font-bold cursor-pointer hover:bg-[#f8fafc] whitespace-nowrap"
                >
                  카드 섞기
                </button>
              </div>
            </div>

            {/* Interactive Flip Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setCardFlipped((p) => !p)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setCardFlipped((p) => !p);
                }
              }}
              className="border border-[#cbd5e1] bg-[#f8fafc] rounded-[16px] px-6 py-10 text-center cursor-pointer select-none hover:border-[#94a3b8] transition"
            >
              {cardFrontMode === "hanzi" ? (
                <>
                  <div className="font-hanzi text-[3.4rem] font-extrabold text-[#0f172a] leading-tight">
                    {currentCard.hanzi}
                  </div>
                  {cardFlipped ? (
                    <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                      <div className="text-[1.15rem] font-bold text-[#dc2626]">
                        {currentCard.pinyin}
                      </div>
                      <div className="text-[1.2rem] font-extrabold text-[#1e293b] mt-1">
                        {currentCard.meaning}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 text-[0.82rem] font-semibold text-[#64748b]">
                      카드를 클릭하면 병음과 뜻이 나타납니다
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-[1.6rem] font-extrabold text-[#0f172a] leading-snug">
                    {currentCard.meaning}
                  </div>
                  {cardFlipped ? (
                    <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                      <div className="font-hanzi text-[2.8rem] font-extrabold text-[#0f172a]">
                        {currentCard.hanzi}
                      </div>
                      <div className="text-[1.08rem] font-bold text-[#dc2626] mt-1">
                        {currentCard.pinyin}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 text-[0.82rem] font-semibold text-[#64748b]">
                      중국어 한자와 병음을 떠올린 뒤 클릭하세요
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-between gap-2 flex-wrap mt-4">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSpeak(currentCard)}
                  className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-3 py-2 rounded-[10px] text-[0.84rem] font-bold cursor-pointer hover:bg-[#dbeafe] ${
                    speakingWordId === currentCard.id ? "btn-speaking" : ""
                  }`}
                >
                  🔊 발음 듣기
                </button>
                <button
                  type="button"
                  onClick={() => toggleBookmark(currentCard.id)}
                  className={`border px-3 py-2 rounded-[10px] text-[0.84rem] font-bold cursor-pointer ${
                    bookmarkedIds.has(currentCard.id)
                      ? "border-[#f59e0b] bg-[#fffbeb] text-[#d97706]"
                      : "border-[#e2e8f0] bg-white text-[#475569]"
                  }`}
                >
                  {bookmarkedIds.has(currentCard.id) ? "★ 저장됨" : "☆ 즐겨찾기"}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCardFlipped(false);
                    setCardIdx(
                      (prev) => (prev - 1 + deckWords.length) % deckWords.length
                    );
                  }}
                  className="border border-[#e2e8f0] bg-white text-[#1e293b] px-3 py-2 rounded-[10px] text-[0.84rem] font-bold cursor-pointer hover:bg-[#f8fafc]"
                >
                  이전
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!memorizedIds.has(currentCard.id)) {
                      toggleMemorized(currentCard.id);
                    }
                    setCardFlipped(false);
                    setCardIdx((prev) => (prev + 1) % deckWords.length);
                  }}
                  className="border border-[#16a34a] bg-[#16a34a] text-white px-3.5 py-2 rounded-[10px] text-[0.84rem] font-bold cursor-pointer hover:bg-[#15803d] whitespace-nowrap"
                >
                  암기 완료 · 다음
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCardFlipped(false);
                    setCardIdx((prev) => (prev + 1) % deckWords.length);
                  }}
                  className="border border-[#dc2626] bg-[#dc2626] text-white px-3.5 py-2 rounded-[10px] text-[0.84rem] font-bold cursor-pointer hover:bg-[#b91c1c]"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </section>
  );
}
