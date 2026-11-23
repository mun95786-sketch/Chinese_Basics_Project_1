import { useMemo, useState } from "react";
import {
  CONVERSATION_LIST,
  LEVEL_BADGE_CLASSES,
  LevelFilter,
} from "../data/chineseData";
import { speakChinese } from "../utils/speech";

const LEVELS: LevelFilter[] = ["전체", "초급", "중급", "고급"];

export function ConversationPanel() {
  const [convLevel, setConvLevel] = useState<LevelFilter>("전체");
  const [convCategory, setConvCategory] = useState<string>("전체");
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [ttsNotice, setTtsNotice] = useState<string>("");

  const byLevel = useMemo(() => {
    return convLevel === "전체"
      ? CONVERSATION_LIST
      : CONVERSATION_LIST.filter((c) => c.level === convLevel);
  }, [convLevel]);

  const categories = useMemo(() => {
    return ["전체", ...Array.from(new Set(byLevel.map((c) => c.category)))];
  }, [byLevel]);

  const effectiveCat = categories.includes(convCategory) ? convCategory : "전체";

  const list = useMemo(() => {
    return effectiveCat === "전체"
      ? byLevel
      : byLevel.filter((c) => c.category === effectiveCat);
  }, [byLevel, effectiveCat]);

  const handleSpeak = (id: number, zh: string, rate: number) => {
    const key = `${id}-${rate}`;
    setTtsNotice("");
    speakChinese(zh, rate, {
      onStart: () => setSpeakingKey(key),
      onEnd: () => {
        setSpeakingKey(null);
        setTtsNotice("");
      },
      onError: (msg) => {
        setSpeakingKey(null);
        setTtsNotice(msg);
      },
    });
  };

  return (
    <section aria-label="실생활 회화">
      <div className="flex flex-wrap gap-2.5 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-[7px]">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => {
                setConvLevel(lv);
                setConvCategory("전체");
              }}
              className={`border px-[13px] py-[7px] rounded-full text-[0.83rem] font-bold cursor-pointer transition ${
                lv === convLevel
                  ? "bg-[#dc2626] border-[#dc2626] text-white"
                  : "bg-white border-[#e2e8f0] text-[#475569]"
              }`}
            >
              {lv}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-[7px]">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setConvCategory(cat)}
              className={`border px-[13px] py-[7px] rounded-full text-[0.83rem] font-bold cursor-pointer transition ${
                cat === effectiveCat
                  ? "bg-[#dc2626] border-[#dc2626] text-white"
                  : "bg-white border-[#e2e8f0] text-[#475569]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {ttsNotice && (
        <div className="mb-3 rounded-[12px] px-3.5 py-2.5 bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[0.84rem] font-semibold">
          ⚠️ {ttsNotice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {list.map((item) => (
          <article
            key={item.id}
            className="card-surface p-[18px] flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex gap-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.78rem] font-bold ${
                    LEVEL_BADGE_CLASSES[item.level]
                  }`}
                >
                  {item.level}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.78rem] font-bold bg-[#f1f5f9] text-[#475569]">
                  {item.category}
                </span>
              </div>
              <div className="font-hanzi text-[1.32rem] font-bold text-[#0f172a] mt-2 mb-1">
                {item.zh}
              </div>
              <div className="text-[0.94rem] font-bold text-[#dc2626] mb-2">
                {item.pinyin}
              </div>
              <div className="text-[0.94rem] text-[#334155] font-semibold bg-[#f8fafc] rounded-[10px] px-3 py-[9px] border border-[#e2e8f0]">
                {item.ko}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleSpeak(item.id, item.zh, 1.0)}
                className={`border border-[#2563eb] bg-[#2563eb] text-white px-[11px] py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer min-h-[35px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#1d4ed8] hover:border-[#1d4ed8] hover:-translate-y-px select-none ${
                  speakingKey === `${item.id}-1` ? "btn-speaking" : ""
                }`}
              >
                🔊 발음 듣기
              </button>
              <button
                type="button"
                onClick={() => handleSpeak(item.id, item.zh, 0.7)}
                className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-[11px] py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer min-h-[35px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#dbeafe] hover:-translate-y-px select-none ${
                  speakingKey === `${item.id}-0.7` ? "btn-speaking" : ""
                }`}
              >
                🐢 0.7배속 천천히
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
