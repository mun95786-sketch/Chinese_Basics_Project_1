import { useMemo, useState } from "react";
import {
  CULTURE_LIST,
  LEVEL_BADGE_CLASSES,
  LevelFilter,
} from "../data/chineseData";
import { speakChinese } from "../utils/speech";

const LEVELS: LevelFilter[] = ["전체", "초급", "중급", "고급"];

export function CulturePanel() {
  const [cultureLevel, setCultureLevel] = useState<LevelFilter>("전체");
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);
  const [ttsNotice, setTtsNotice] = useState<string>("");

  const list = useMemo(() => {
    return cultureLevel === "전체"
      ? CULTURE_LIST
      : CULTURE_LIST.filter((c) => c.level === cultureLevel);
  }, [cultureLevel]);

  const handleSpeak = (title: string, zh: string, rate: number) => {
    const key = `${title}-${rate}`;
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
    <section aria-label="중국 문화">
      <div className="flex flex-wrap gap-2.5 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-[7px]">
          {LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setCultureLevel(lv)}
              className={`border px-[13px] py-[7px] rounded-full text-[0.83rem] font-bold cursor-pointer transition ${
                lv === cultureLevel
                  ? "bg-[#dc2626] border-[#dc2626] text-white"
                  : "bg-white border-[#e2e8f0] text-[#475569]"
              }`}
            >
              {lv}
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
            key={item.title}
            className="card-surface p-5 flex flex-col gap-3 border-t-4 border-t-[#dc2626]"
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-[42px] h-[42px] rounded-[12px] bg-[#fef2f2] grid place-items-center text-[1.4rem] shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="m-0 text-[1.06rem] font-extrabold">
                    {item.title}
                  </h3>
                  <span className="text-[0.76rem] text-[#64748b] font-bold">
                    {item.tag}
                  </span>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.78rem] font-bold shrink-0 ${
                  LEVEL_BADGE_CLASSES[item.level]
                }`}
              >
                {item.level}
              </span>
            </div>

            <p className="m-0 text-[0.91rem] text-[#334155] leading-[1.65]">
              {item.desc}
            </p>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] px-3.5 py-3 mt-auto">
              <div className="text-[0.74rem] font-extrabold text-[#64748b] mb-1">
                문화 핵심 중국어 문장
              </div>
              <div className="font-hanzi text-[1.13rem] font-bold text-[#0f172a] mb-0.5">
                {item.zh}
              </div>
              <div className="text-[0.88rem] font-bold text-[#dc2626] mb-1">
                {item.pinyin}
              </div>
              <div className="text-[0.88rem] text-[#475569] font-semibold mb-2.5">
                {item.ko}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleSpeak(item.title, item.zh, 1.0)}
                  className={`border border-[#2563eb] bg-[#2563eb] text-white px-[11px] py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer min-h-[35px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#1d4ed8] hover:border-[#1d4ed8] hover:-translate-y-px select-none ${
                    speakingKey === `${item.title}-1` ? "btn-speaking" : ""
                  }`}
                >
                  🔊 발음 듣기
                </button>
                <button
                  type="button"
                  onClick={() => handleSpeak(item.title, item.zh, 0.7)}
                  className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-[11px] py-1.5 rounded-[9px] text-[0.82rem] font-semibold cursor-pointer min-h-[35px] inline-flex items-center justify-center gap-1.5 transition hover:bg-[#dbeafe] hover:-translate-y-px select-none ${
                    speakingKey === `${item.title}-0.7` ? "btn-speaking" : ""
                  }`}
                >
                  🐢 0.7배속 천천히
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
