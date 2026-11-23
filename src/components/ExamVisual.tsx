export type ExamVisualId =
  | "map_route"
  | "signs_5"
  | "clocks_5"
  | "menu_discount"
  | "weather_week"
  | "family_tree"
  | "scene_library"
  | "train_ticket";

interface ExamVisualProps {
  visualId: ExamVisualId;
}

function CsatClockFace({
  hour,
  minute,
  numLabel,
}: {
  hour: number;
  minute: number;
  numLabel: string;
}) {
  const minuteAngle = minute * 6;
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;

  const mx = 50 + 30 * Math.cos(toRad(minuteAngle));
  const my = 50 + 30 * Math.sin(toRad(minuteAngle));
  const hx = 50 + 19 * Math.cos(toRad(hourAngle));
  const hy = 50 + 19 * Math.sin(toRad(hourAngle));

  return (
    <div className="flex flex-col items-center py-1.5">
      <div className="text-[0.9rem] font-serif font-bold text-[#111827] mb-1">
        {numLabel}
      </div>
      <svg viewBox="0 0 100 100" className="w-[74px] h-[74px]">
        {/* Outer double bezel like printed CSAT clocks */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="#f4f4f5"
          stroke="#111827"
          strokeWidth="1.8"
        />
        <circle
          cx="50"
          cy="50"
          r="40.5"
          fill="#ffffff"
          stroke="#111827"
          strokeWidth="1.2"
        />
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
          const ang = toRad(i * 30);
          const x1 = 50 + 35.5 * Math.cos(ang);
          const y1 = 50 + 35.5 * Math.sin(ang);
          const x2 = 50 + 39.5 * Math.cos(ang);
          const y2 = 50 + 39.5 * Math.sin(ang);
          const tx = 50 + 28.5 * Math.cos(ang);
          const ty = 50 + 28.5 * Math.sin(ang) + 3.2;
          return (
            <g key={n}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#111827"
                strokeWidth={n % 3 === 0 ? "1.8" : "0.9"}
              />
              {n % 3 === 0 && (
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="700"
                  fontFamily="serif"
                  fill="#111827"
                >
                  {n}
                </text>
              )}
            </g>
          );
        })}
        {/* Hour hand (short & thick black) */}
        <line
          x1="50"
          y1="50"
          x2={hx}
          y2={hy}
          stroke="#111827"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* Minute hand (long & crisp) */}
        <line
          x1="50"
          y1="50"
          x2={mx}
          y2={my}
          stroke="#111827"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="2.8" fill="#111827" />
      </svg>
    </div>
  );
}

function WeatherInkIcon({
  kind,
}: {
  kind: "sun" | "cloud" | "rain" | "wind" | "snow";
}) {
  if (kind === "sun") {
    return (
      <svg viewBox="0 0 48 40" className="w-[42px] h-[34px] mx-auto">
        <circle cx="24" cy="20" r="7.5" fill="#e5e7eb" stroke="#111827" strokeWidth="1.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={24 + 10.5 * Math.cos(rad)}
              y1={20 + 10.5 * Math.sin(rad)}
              x2={24 + 14.5 * Math.cos(rad)}
              y2={20 + 14.5 * Math.sin(rad)}
              stroke="#111827"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }
  if (kind === "cloud") {
    return (
      <svg viewBox="0 0 48 40" className="w-[42px] h-[34px] mx-auto">
        <circle cx="31" cy="14" r="5" fill="#ffffff" stroke="#111827" strokeWidth="1.3" />
        <line x1="31" y1="5" x2="31" y2="7.5" stroke="#111827" strokeWidth="1.2" />
        <line x1="39" y1="14" x2="41.5" y2="14" stroke="#111827" strokeWidth="1.2" />
        <line x1="36.5" y1="8.5" x2="38.2" y2="6.8" stroke="#111827" strokeWidth="1.2" />
        <path
          d="M12 29 H34 A5.5 5.5 0 0 0 34 18 A7 7 0 0 0 20.5 16 A6 6 0 0 0 12 29 Z"
          fill="#e5e7eb"
          stroke="#111827"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  if (kind === "rain") {
    return (
      <svg viewBox="0 0 48 40" className="w-[42px] h-[34px] mx-auto">
        <path
          d="M12 22 H35 A5 5 0 0 0 35 12 A6.5 6.5 0 0 0 22 10.5 A5.5 5.5 0 0 0 12 22 Z"
          fill="#d1d5db"
          stroke="#111827"
          strokeWidth="1.5"
        />
        <line x1="16" y1="26" x2="13.5" y2="33" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="23" y1="26" x2="20.5" y2="33" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="30" y1="26" x2="27.5" y2="33" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "wind") {
    return (
      <svg viewBox="0 0 48 40" className="w-[42px] h-[34px] mx-auto">
        <path
          d="M8 15 H29 A4 4 0 1 0 25 11"
          fill="none"
          stroke="#111827"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M6 21 H36 A4 4 0 1 1 32 25"
          fill="none"
          stroke="#111827"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M11 27 H24 A3.2 3.2 0 1 1 21 30.2"
          fill="none"
          stroke="#111827"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 40" className="w-[42px] h-[34px] mx-auto">
      <path
        d="M12 21 H35 A5 5 0 0 0 35 11 A6.5 6.5 0 0 0 22 9.5 A5.5 5.5 0 0 0 12 21 Z"
        fill="#f3f4f6"
        stroke="#111827"
        strokeWidth="1.5"
      />
      {[16, 24, 32].map((cx, i) => {
        const cy = i % 2 === 0 ? 28.5 : 31;
        return (
          <g key={cx}>
            <line x1={cx - 2.5} y1={cy} x2={cx + 2.5} y2={cy} stroke="#111827" strokeWidth="1.2" />
            <line x1={cx} y1={cy - 2.5} x2={cx} y2={cy + 2.5} stroke="#111827" strokeWidth="1.2" />
            <line x1={cx - 1.8} y1={cy - 1.8} x2={cx + 1.8} y2={cy + 1.8} stroke="#111827" strokeWidth="1" />
          </g>
        );
      })}
    </svg>
  );
}

export function ExamVisual({ visualId }: ExamVisualProps) {
  if (visualId === "map_route") {
    return (
      <div className="bg-[#fcfcfb] border-[1.5px] border-[#18181b] rounded-[2px] p-3.5 mb-3.5 text-[#111827]">
        <div className="text-[0.76rem] font-serif font-bold text-[#111827] mb-2 flex items-center justify-between border-b border-[#d4d4d8] pb-1">
          <span>&lt;그 림&gt;</span>
          <span className="text-[0.72rem] text-[#3f3f46]">길 안내 약도</span>
        </div>
        <svg
          viewBox="0 0 440 232"
          className="w-full max-w-[480px] mx-auto block bg-[#ffffff] border border-[#18181b]"
          role="img"
          aria-label="수능 중국어 길 안내 약도 그림"
        >
          <defs>
            <pattern
              id="csat-hatch-map"
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#a1a1aa" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Compass Rose (KICE style N ↑) */}
          <g transform="translate(414, 24)">
            <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#111827" strokeWidth="1" />
            <polygon points="0,-11 -3,-2 0,-4 3,-2" fill="#111827" />
            <polygon points="0,11 -3,2 0,4 3,2" fill="#ffffff" stroke="#111827" strokeWidth="0.9" />
            <text x="0" y="-15.5" textAnchor="middle" fontSize="8" fontWeight="700" fontFamily="serif" fill="#111827">
              N
            </text>
          </g>

          {/* Monochrome Streets */}
          <rect x="0" y="98" width="440" height="34" fill="#e5e7eb" />
          <rect x="148" y="0" width="34" height="232" fill="#e5e7eb" />
          <rect x="308" y="0" width="30" height="232" fill="#e5e7eb" />
          {/* Street boundary lines */}
          <line x1="0" y1="98" x2="148" y2="98" stroke="#111827" strokeWidth="1.2" />
          <line x1="182" y1="98" x2="308" y2="98" stroke="#111827" strokeWidth="1.2" />
          <line x1="338" y1="98" x2="440" y2="98" stroke="#111827" strokeWidth="1.2" />
          <line x1="0" y1="132" x2="148" y2="132" stroke="#111827" strokeWidth="1.2" />
          <line x1="182" y1="132" x2="308" y2="132" stroke="#111827" strokeWidth="1.2" />
          <line x1="338" y1="132" x2="440" y2="132" stroke="#111827" strokeWidth="1.2" />
          <line x1="148" y1="0" x2="148" y2="98" stroke="#111827" strokeWidth="1.2" />
          <line x1="148" y1="132" x2="148" y2="232" stroke="#111827" strokeWidth="1.2" />
          <line x1="182" y1="0" x2="182" y2="98" stroke="#111827" strokeWidth="1.2" />
          <line x1="182" y1="132" x2="182" y2="232" stroke="#111827" strokeWidth="1.2" />
          <line x1="308" y1="0" x2="308" y2="98" stroke="#111827" strokeWidth="1.2" />
          <line x1="308" y1="132" x2="308" y2="232" stroke="#111827" strokeWidth="1.2" />
          <line x1="338" y1="0" x2="338" y2="98" stroke="#111827" strokeWidth="1.2" />
          <line x1="338" y1="132" x2="338" y2="232" stroke="#111827" strokeWidth="1.2" />

          {/* Crosswalk stripes at main intersection */}
          {[102, 108, 114, 120, 126].map((y) => (
            <rect key={`cw-w-${y}`} x="140" y={y} width="7" height="3.2" fill="#ffffff" stroke="#111827" strokeWidth="0.6" />
          ))}
          {[152, 158, 164, 170, 176].map((x) => (
            <rect key={`cw-s-${x}`} x={x} y="133" width="3.2" height="7" fill="#ffffff" stroke="#111827" strokeWidth="0.6" />
          ))}

          {/* Traffic Light (红绿灯) ink icon */}
          <g transform="translate(165, 115)">
            <rect x="-12" y="-5" width="24" height="10" rx="4" fill="#18181b" />
            <circle cx="-6" cy="0" r="2.4" fill="#ffffff" />
            <circle cx="0" cy="0" r="2.4" fill="#a1a1aa" />
            <circle cx="6" cy="0" r="2.4" fill="#d4d4d8" />
          </g>
          <text x="165" y="92" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#111827">
            红绿灯
          </text>

          {/* Start Person + Arrow (我 出发) */}
          <circle cx="38" cy="109" r="3.5" fill="#111827" />
          <path d="M32 120 Q38 113 44 120" fill="#111827" />
          <text x="38" y="146" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="serif" fill="#111827">
            我 (출발)
          </text>
          <line x1="54" y1="115" x2="128" y2="115" stroke="#111827" strokeWidth="2.2" />
          <polygon points="126,110 137,115 126,120" fill="#111827" />

          {/* Building ①: 公园 (North-West) */}
          <rect x="52" y="20" width="76" height="58" fill="#ffffff" stroke="#111827" strokeWidth="1.4" />
          <rect x="52" y="20" width="76" height="14" fill="url(#csat-hatch-map)" stroke="#111827" strokeWidth="1" />
          <circle cx="72" cy="52" r="7" fill="#e5e7eb" stroke="#111827" strokeWidth="1" />
          <line x1="72" y1="59" x2="72" y2="68" stroke="#111827" strokeWidth="1.5" />
          <text x="98" y="54" textAnchor="middle" fontSize="13.5" fontWeight="700" fontFamily="serif" fill="#111827">
            ①
          </text>
          <text x="98" y="69" textAnchor="middle" fontSize="10" fontWeight="700" fill="#111827">
            公园
          </text>

          {/* Building ②: Target opposite Post Office (South-West) */}
          <rect x="52" y="152" width="76" height="60" fill="#f4f4f5" stroke="#111827" strokeWidth="1.8" />
          <rect x="56" y="156" width="68" height="52" fill="#ffffff" stroke="#111827" strokeWidth="0.9" />
          <text x="90" y="185" textAnchor="middle" fontSize="15" fontWeight="700" fontFamily="serif" fill="#111827">
            ②
          </text>
          <text x="90" y="201" textAnchor="middle" fontSize="9.5" fill="#3f3f46">
            ?
          </text>

          {/* Post Office: 邮局 (South-Middle, across from ②) */}
          <rect x="200" y="152" width="88" height="60" fill="#ffffff" stroke="#111827" strokeWidth="1.5" />
          <rect x="200" y="152" width="88" height="14" fill="#e5e7eb" stroke="#111827" strokeWidth="1" />
          <rect x="212" y="176" width="18" height="13" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <polyline points="212,176 221,183 230,176" fill="none" stroke="#111827" strokeWidth="1" />
          <text x="256" y="186" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#111827">
            邮局
          </text>
          <text x="244" y="203" textAnchor="middle" fontSize="9" fontFamily="serif" fill="#3f3f46">
            우체국
          </text>

          {/* Building ③: 银行 (North-Middle) */}
          <rect x="202" y="20" width="84" height="58" fill="#ffffff" stroke="#111827" strokeWidth="1.4" />
          <polygon points="210,36 226,26 242,36" fill="#e5e7eb" stroke="#111827" strokeWidth="1" />
          <rect x="213" y="36" width="26" height="14" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <text x="262" y="47" textAnchor="middle" fontSize="13.5" fontWeight="700" fontFamily="serif" fill="#111827">
            ③
          </text>
          <text x="244" y="69" textAnchor="middle" fontSize="10" fontWeight="700" fill="#111827">
            银行
          </text>

          {/* Building ④: 超市 (South-East) */}
          <rect x="352" y="152" width="74" height="60" fill="#ffffff" stroke="#111827" strokeWidth="1.4" />
          <rect x="352" y="152" width="74" height="13" fill="url(#csat-hatch-map)" stroke="#111827" strokeWidth="1" />
          <text x="389" y="184" textAnchor="middle" fontSize="13.5" fontWeight="700" fontFamily="serif" fill="#111827">
            ④
          </text>
          <text x="389" y="201" textAnchor="middle" fontSize="10" fontWeight="700" fill="#111827">
            超市
          </text>

          {/* Building ⑤: 医院 (North-East) */}
          <rect x="352" y="38" width="74" height="44" fill="#ffffff" stroke="#111827" strokeWidth="1.4" />
          <path d="M366 53 H371 V48 H375 V53 H380 V57 H375 V62 H371 V57 H366 Z" fill="#e5e7eb" stroke="#111827" strokeWidth="0.9" />
          <text x="401" y="59" textAnchor="middle" fontSize="13.5" fontWeight="700" fontFamily="serif" fill="#111827">
            ⑤
          </text>
          <text x="389" y="75" textAnchor="middle" fontSize="10" fontWeight="700" fill="#111827">
            医院
          </text>
        </svg>
      </div>
    );
  }

  if (visualId === "signs_5") {
    return (
      <div className="bg-[#fcfcfb] border-[1.5px] border-[#18181b] rounded-[2px] p-3.5 mb-3.5 text-[#111827]">
        <div className="text-[0.76rem] font-serif font-bold text-[#111827] mb-2 border-b border-[#d4d4d8] pb-1">
          &lt;그 림&gt; 안내 표지판
        </div>
        <div className="grid grid-cols-5 border border-[#18181b] bg-white divide-x divide-[#18181b]">
          {/* ① No Photo */}
          <div className="p-2 text-center">
            <div className="text-[0.86rem] font-serif font-bold mb-1">①</div>
            <svg viewBox="0 0 80 80" className="w-[56px] h-[56px] mx-auto">
              <circle cx="40" cy="40" r="32" fill="#ffffff" stroke="#111827" strokeWidth="3.5" />
              <rect x="21" y="31" width="38" height="22" rx="3" fill="#27272a" />
              <rect x="31" y="25" width="18" height="7" rx="1.5" fill="#27272a" />
              <circle cx="40" cy="42" r="7" fill="#ffffff" stroke="#111827" strokeWidth="1.5" />
              <circle cx="40" cy="42" r="3.5" fill="#71717a" />
              <line x1="17" y1="63" x2="63" y2="17" stroke="#111827" strokeWidth="4" />
              <line x1="18.5" y1="64.5" x2="64.5" y2="18.5" stroke="#ffffff" strokeWidth="1.2" />
            </svg>
          </div>

          {/* ② No Smoking */}
          <div className="p-2 text-center">
            <div className="text-[0.86rem] font-serif font-bold mb-1">②</div>
            <svg viewBox="0 0 80 80" className="w-[56px] h-[56px] mx-auto">
              <circle cx="40" cy="40" r="32" fill="#ffffff" stroke="#111827" strokeWidth="3.5" />
              <rect x="18" y="42" width="35" height="7.5" fill="#ffffff" stroke="#111827" strokeWidth="1.6" />
              <rect x="53" y="42" width="9" height="7.5" fill="#3f3f46" stroke="#111827" strokeWidth="1.2" />
              <path d="M57 37 Q61 32 56 27 Q53 23 58 19" fill="none" stroke="#52525b" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="17" y1="63" x2="63" y2="17" stroke="#111827" strokeWidth="4" />
              <line x1="18.5" y1="64.5" x2="64.5" y2="18.5" stroke="#ffffff" strokeWidth="1.2" />
            </svg>
          </div>

          {/* ③ Quiet (安静) */}
          <div className="p-2 text-center">
            <div className="text-[0.86rem] font-serif font-bold mb-1">③</div>
            <svg viewBox="0 0 80 80" className="w-[56px] h-[56px] mx-auto">
              <circle cx="40" cy="40" r="32" fill="#f4f4f5" stroke="#111827" strokeWidth="2.8" />
              {/* Person head & shushing finger */}
              <circle cx="40" cy="31" r="12" fill="#ffffff" stroke="#111827" strokeWidth="1.8" />
              <path d="M28 29 Q40 16 52 29" fill="#27272a" />
              <circle cx="35.5" cy="30.5" r="1.5" fill="#111827" />
              <circle cx="44.5" cy="30.5" r="1.5" fill="#111827" />
              <rect x="38.2" y="34" width="3.6" height="16" rx="1.8" fill="#ffffff" stroke="#111827" strokeWidth="1.5" />
              <path d="M26 56 Q40 48 54 56" fill="none" stroke="#111827" strokeWidth="1.5" />
              <text x="40" y="66" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#111827">
                安静
              </text>
            </svg>
          </div>

          {/* ④ No Food/Drink */}
          <div className="p-2 text-center">
            <div className="text-[0.86rem] font-serif font-bold mb-1">④</div>
            <svg viewBox="0 0 80 80" className="w-[56px] h-[56px] mx-auto">
              <circle cx="40" cy="40" r="32" fill="#ffffff" stroke="#111827" strokeWidth="3.5" />
              {/* Hamburger & drink cup in ink */}
              <path d="M20 39 Q31 28 42 39 Z" fill="#d4d4d8" stroke="#111827" strokeWidth="1.4" />
              <rect x="19" y="41" width="24" height="3.5" rx="1" fill="#27272a" />
              <rect x="20" y="46.5" width="22" height="5.5" rx="2" fill="#d4d4d8" stroke="#111827" strokeWidth="1.4" />
              <polygon points="46,32 58,32 56,52 48,52" fill="#e5e7eb" stroke="#111827" strokeWidth="1.4" />
              <polyline points="52,32 54,23 59,21" fill="none" stroke="#111827" strokeWidth="1.4" />
              <line x1="17" y1="63" x2="63" y2="17" stroke="#111827" strokeWidth="4" />
              <line x1="18.5" y1="64.5" x2="64.5" y2="18.5" stroke="#ffffff" strokeWidth="1.2" />
            </svg>
          </div>

          {/* ⑤ No Swimming */}
          <div className="p-2 text-center">
            <div className="text-[0.86rem] font-serif font-bold mb-1">⑤</div>
            <svg viewBox="0 0 80 80" className="w-[56px] h-[56px] mx-auto">
              <circle cx="40" cy="40" r="32" fill="#ffffff" stroke="#111827" strokeWidth="3.5" />
              <circle cx="47" cy="30" r="4.5" fill="#18181b" />
              <path d="M22 44 L40 35 L50 42" fill="none" stroke="#18181b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 51 Q28 46 40 51 T64 51" fill="none" stroke="#3f3f46" strokeWidth="2.2" />
              <path d="M19 57 Q30 53 40 57 T61 57" fill="none" stroke="#71717a" strokeWidth="1.5" />
              <line x1="17" y1="63" x2="63" y2="17" stroke="#111827" strokeWidth="4" />
              <line x1="18.5" y1="64.5" x2="64.5" y2="18.5" stroke="#ffffff" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (visualId === "clocks_5") {
    return (
      <div className="bg-[#fcfcfb] border-[1.5px] border-[#18181b] rounded-[2px] p-3.5 mb-3.5 text-[#111827]">
        <div className="text-[0.76rem] font-serif font-bold text-[#111827] mb-2 border-b border-[#d4d4d8] pb-1">
          &lt;그 림&gt;
        </div>
        <div className="grid grid-cols-3 min-[520px]:grid-cols-5 border border-[#18181b] bg-white divide-x divide-[#d4d4d8]">
          <CsatClockFace hour={7} minute={15} numLabel="①" />
          <CsatClockFace hour={7} minute={45} numLabel="②" />
          <CsatClockFace hour={8} minute={15} numLabel="③" />
          <CsatClockFace hour={8} minute={45} numLabel="④" />
          <CsatClockFace hour={9} minute={15} numLabel="⑤" />
        </div>
      </div>
    );
  }

  if (visualId === "menu_discount") {
    const items = [
      { zh: "珍珠奶茶", price: "18元" },
      { zh: "小笼包", price: "24元" },
      { zh: "牛肉面", price: "26元" },
      { zh: "蛋炒饭", price: "20元" },
    ];
    return (
      <div className="bg-[#fcfcfb] border-[1.5px] border-[#18181b] rounded-[2px] p-3.5 mb-3.5 text-[#111827]">
        <div className="text-[0.76rem] font-serif font-bold text-[#111827] mb-2.5 border-b border-[#d4d4d8] pb-1">
          &lt;안내문&gt;
        </div>
        <div className="max-w-[420px] mx-auto bg-white border-2 border-[#18181b] p-1">
          <div className="border border-[#18181b] px-4 py-3">
            <div className="text-center font-hanzi font-extrabold text-[1.1rem] tracking-wide pb-2 mb-2.5 border-b border-[#18181b]">
              美 味 小 吃 店
            </div>
            <div className="space-y-1.5 text-[0.9rem] mb-3">
              {items.map((item) => (
                <div key={item.zh} className="flex items-baseline gap-2">
                  <span className="font-hanzi font-bold shrink-0">{item.zh}</span>
                  <span className="flex-1 border-b border-dotted border-[#71717a]" />
                  <span className="font-bold tabular-nums shrink-0">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#f4f4f5] border border-dashed border-[#18181b] px-3 py-1.5 text-center text-[0.84rem] font-bold">
              <span className="font-hanzi">今日优惠：满 50 元 减 10 元</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visualId === "weather_week") {
    const days: {
      day: string;
      kind: "sun" | "cloud" | "rain" | "wind" | "snow";
      label: string;
      temp: string;
    }[] = [
      { day: "星期一", kind: "sun", label: "晴", temp: "18℃~25℃" },
      { day: "星期二", kind: "cloud", label: "多云", temp: "15℃~22℃" },
      { day: "星期三", kind: "rain", label: "下雨", temp: "11℃~16℃" },
      { day: "星期四", kind: "wind", label: "刮风", temp: "8℃~14℃" },
      { day: "星期五", kind: "snow", label: "下雪", temp: "-2℃~3℃" },
    ];
    return (
      <div className="bg-[#fcfcfb] border-[1.5px] border-[#18181b] rounded-[2px] p-3.5 mb-3.5 text-[#111827]">
        <div className="text-[0.76rem] font-serif font-bold text-[#111827] mb-2 border-b border-[#d4d4d8] pb-1 flex justify-between">
          <span>&lt;도 표&gt;</span>
          <span className="font-hanzi text-[0.74rem]">北京一周天气预报</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-[#18181b] bg-white text-center text-[0.8rem]">
            <thead>
              <tr className="bg-[#f4f4f5]">
                {days.map((d) => (
                  <th
                    key={d.day}
                    className="border border-[#18181b] py-1.5 px-1 font-hanzi font-bold"
                  >
                    {d.day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {days.map((d) => (
                  <td key={d.day} className="border border-[#18181b] py-2 px-1">
                    <WeatherInkIcon kind={d.kind} />
                    <div className="font-hanzi font-bold text-[0.82rem] mt-1">
                      {d.label}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="bg-[#fafafa]">
                {days.map((d) => (
                  <td
                    key={d.day}
                    className="border border-[#18181b] py-1.5 px-1 text-[0.72rem] font-semibold tabular-nums"
                  >
                    {d.temp}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (visualId === "family_tree") {
    return (
      <div className="bg-[#fcfcfb] border-[1.5px] border-[#18181b] rounded-[2px] p-3.5 mb-3.5 text-[#111827]">
        <div className="text-[0.76rem] font-serif font-bold text-[#111827] mb-2.5 border-b border-[#d4d4d8] pb-1">
          &lt;그 림&gt; 샤오밍(小明)의 가족 가계도
        </div>
        <div className="bg-white border border-[#18181b] py-3.5 px-3 text-center">
          {/* Parents level */}
          <div className="flex justify-center items-center gap-4">
            <div className="border border-[#18181b] bg-[#f4f4f5] px-3.5 py-1.5 min-w-[118px]">
              <div className="font-hanzi font-bold text-[0.92rem]">爸爸 (45岁)</div>
              <div className="text-[0.74rem] text-[#3f3f46]">医生</div>
            </div>
            <div className="w-6 h-[1.5px] bg-[#18181b]" />
            <div className="border border-[#18181b] bg-[#f4f4f5] px-3.5 py-1.5 min-w-[118px]">
              <div className="font-hanzi font-bold text-[0.92rem]">妈妈 (43岁)</div>
              <div className="text-[0.74rem] text-[#3f3f46]">老师</div>
            </div>
          </div>

          {/* Orthogonal connector lines */}
          <div className="w-[1.5px] h-4 bg-[#18181b] mx-auto" />
          <div className="max-w-[290px] mx-auto h-[1.5px] bg-[#18181b]" />
          <div className="max-w-[290px] mx-auto grid grid-cols-3">
            <div className="w-[1.5px] h-3.5 bg-[#18181b] mx-auto" />
            <div className="w-[1.5px] h-3.5 bg-[#18181b] mx-auto" />
            <div className="w-[1.5px] h-3.5 bg-[#18181b] mx-auto" />
          </div>

          {/* Children level */}
          <div className="grid grid-cols-3 gap-2 max-w-[430px] mx-auto">
            <div className="border border-[#18181b] bg-white px-2 py-2">
              <div className="font-hanzi font-bold text-[0.9rem]">姐姐</div>
              <div className="text-[0.72rem] text-[#3f3f46] tabular-nums">
                20岁 · 大学生
              </div>
            </div>
            <div className="border-2 border-[#18181b] bg-[#f4f4f5] px-2 py-2">
              <div className="font-hanzi font-extrabold text-[0.9rem]">小明 (我)</div>
              <div className="text-[0.72rem] font-semibold text-[#111827] tabular-nums">
                17岁 · 高中生
              </div>
            </div>
            <div className="border border-[#18181b] bg-white px-2 py-2">
              <div className="font-hanzi font-bold text-[0.9rem]">弟弟</div>
              <div className="text-[0.72rem] text-[#3f3f46] tabular-nums">
                13岁 · 初中生
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (visualId === "scene_library") {
    return (
      <div className="bg-[#fcfcfb] border-[1.5px] border-[#18181b] rounded-[2px] p-3.5 mb-3.5 text-[#111827]">
        <div className="text-[0.76rem] font-serif font-bold text-[#111827] mb-2 border-b border-[#d4d4d8] pb-1">
          &lt;그 림&gt;
        </div>
        <svg
          viewBox="0 0 380 185"
          className="w-full max-w-[400px] mx-auto block bg-white border border-[#18181b]"
          role="img"
          aria-label="수능 및 HSK 시험지 스타일 흑백 펜화 도서관 독서 그림"
        >
          <defs>
            <pattern
              id="csat-hatch-scene"
              width="5"
              height="5"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="5" stroke="#a1a1aa" strokeWidth="0.9" />
            </pattern>
          </defs>

          {/* Background floor line & window */}
          <line x1="0" y1="145" x2="380" y2="145" stroke="#111827" strokeWidth="1" />
          <rect x="275" y="18" width="82" height="58" fill="#f4f4f5" stroke="#111827" strokeWidth="1.4" />
          <line x1="316" y1="18" x2="316" y2="76" stroke="#111827" strokeWidth="1" />
          <line x1="275" y1="47" x2="357" y2="47" stroke="#111827" strokeWidth="1" />

          {/* Hanging Sign 图书馆 */}
          <line x1="175" y1="0" x2="175" y2="14" stroke="#111827" strokeWidth="1" />
          <line x1="235" y1="0" x2="235" y2="14" stroke="#111827" strokeWidth="1" />
          <rect x="164" y="14" width="82" height="26" fill="#ffffff" stroke="#111827" strokeWidth="1.5" />
          <text x="205" y="31" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#111827">
            图书馆
          </text>

          {/* Bookshelf */}
          <rect x="18" y="18" width="98" height="127" fill="#ffffff" stroke="#111827" strokeWidth="1.6" />
          <line x1="18" y1="54" x2="116" y2="54" stroke="#111827" strokeWidth="1.5" />
          <line x1="18" y1="92" x2="116" y2="92" stroke="#111827" strokeWidth="1.5" />
          <line x1="18" y1="130" x2="116" y2="130" stroke="#111827" strokeWidth="1.5" />
          {/* Ink Books */}
          <rect x="25" y="25" width="11" height="29" fill="#e5e7eb" stroke="#111827" strokeWidth="1" />
          <rect x="36" y="28" width="10" height="26" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <rect x="46" y="23" width="12" height="31" fill="url(#csat-hatch-scene)" stroke="#111827" strokeWidth="1" />
          <rect x="58" y="29" width="10" height="25" fill="#d4d4d8" stroke="#111827" strokeWidth="1" />
          <polygon points="72,54 81,27 90,29 81,54" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <rect x="26" y="62" width="12" height="30" fill="#27272a" stroke="#111827" strokeWidth="1" />
          <rect x="38" y="65" width="11" height="27" fill="#ffffff" stroke="#111827" strokeWidth="1" />
          <rect x="49" y="61" width="13" height="31" fill="#e5e7eb" stroke="#111827" strokeWidth="1" />
          <rect x="62" y="67" width="10" height="25" fill="url(#csat-hatch-scene)" stroke="#111827" strokeWidth="1" />
          <rect x="28" y="100" width="52" height="8" fill="#e5e7eb" stroke="#111827" strokeWidth="1" />
          <rect x="32" y="108" width="44" height="8" fill="#ffffff" stroke="#111827" strokeWidth="1" />

          {/* Student reading (monochrome pen-ink line art) */}
          {/* Hair & Head */}
          <path d="M188 73 Q186 48 208 48 Q230 48 228 76 L224 88 L192 88 Z" fill="#27272a" />
          <circle cx="208" cy="68" r="14.5" fill="#ffffff" stroke="#111827" strokeWidth="1.6" />
          <path d="M193 64 Q208 53 223 64" fill="#27272a" />
          {/* Eyes looking down at book */}
          <path d="M200 69 Q203 71 206 69" fill="none" stroke="#111827" strokeWidth="1.3" />
          <path d="M210 69 Q213 71 216 69" fill="none" stroke="#111827" strokeWidth="1.3" />
          <path d="M206 75 Q208 76.5 210 75" fill="none" stroke="#111827" strokeWidth="1.1" />
          {/* Torso & arms */}
          <path
            d="M179 124 Q183 88 208 88 Q233 88 237 124 Z"
            fill="url(#csat-hatch-scene)"
            stroke="#111827"
            strokeWidth="1.6"
          />
          <path d="M199 88 L208 97 L217 88" fill="#ffffff" stroke="#111827" strokeWidth="1.3" />
          {/* Desk */}
          <rect x="142" y="124" width="136" height="9" fill="#e5e7eb" stroke="#111827" strokeWidth="1.5" />
          <rect x="152" y="133" width="8" height="40" fill="#ffffff" stroke="#111827" strokeWidth="1.4" />
          <rect x="260" y="133" width="8" height="40" fill="#ffffff" stroke="#111827" strokeWidth="1.4" />
          {/* Open Book */}
          <path d="M181 121 L208 114 L235 121 L235 124 L181 124 Z" fill="#ffffff" stroke="#111827" strokeWidth="1.4" />
          <line x1="208" y1="114" x2="208" y2="124" stroke="#111827" strokeWidth="1.2" />
          <line x1="188" y1="120" x2="203" y2="117" stroke="#71717a" strokeWidth="0.9" />
          <line x1="213" y1="117" x2="228" y2="120" stroke="#71717a" strokeWidth="0.9" />
        </svg>
      </div>
    );
  }

  // train_ticket
  return (
    <div className="bg-[#fcfcfb] border-[1.5px] border-[#18181b] rounded-[2px] p-3.5 mb-3.5 text-[#111827]">
      <div className="text-[0.76rem] font-serif font-bold text-[#111827] mb-2.5 border-b border-[#d4d4d8] pb-1">
        &lt;자 료&gt; 고속철도(高铁) 승차권
      </div>
      <div className="relative max-w-[440px] mx-auto bg-white border-[1.5px] border-[#18181b] px-4 py-3">
        <div className="flex justify-between items-center text-[0.74rem] font-bold border-b border-dashed border-[#18181b] pb-1.5 mb-2">
          <span className="font-hanzi">电子客票 · 中国铁路</span>
          <span className="tabular-nums">G105次</span>
        </div>
        <div className="flex items-center justify-between gap-2 my-1">
          <div className="text-center">
            <div className="font-hanzi text-[1.15rem] font-extrabold">北京南</div>
            <div className="text-[0.68rem] text-[#52525b]">Beijingnan</div>
          </div>
          <div className="text-center flex-1 px-2">
            <div className="text-[0.76rem] font-bold tabular-nums">G105</div>
            <div className="border-b-[1.5px] border-[#18181b] relative my-0.5">
              <span className="absolute right-0 -top-[5px] text-[0.7rem]">▶</span>
            </div>
            <div className="text-[0.68rem] text-[#52525b]">약 4시간 30분</div>
          </div>
          <div className="text-center">
            <div className="font-hanzi text-[1.15rem] font-extrabold">上海虹桥</div>
            <div className="text-[0.68rem] text-[#52525b]">Shanghaihongqiao</div>
          </div>
        </div>
        <div className="border-t border-dashed border-[#18181b] mt-2.5 pt-2 flex items-end justify-between gap-2">
          <div className="text-[0.76rem] font-bold space-y-0.5 tabular-nums">
            <div className="font-hanzi">2026年11月20日 09:30开</div>
            <div className="font-hanzi">04车 08A号 · 二等座 · ￥553.0元</div>
          </div>
          {/* Monochrome mini QR diagram */}
          <svg viewBox="0 0 28 28" className="w-[32px] h-[32px] shrink-0 border border-[#18181b] p-0.5 bg-white">
            <rect x="2" y="2" width="8" height="8" fill="none" stroke="#111827" strokeWidth="1.6" />
            <rect x="4.5" y="4.5" width="3" height="3" fill="#111827" />
            <rect x="18" y="2" width="8" height="8" fill="none" stroke="#111827" strokeWidth="1.6" />
            <rect x="20.5" y="4.5" width="3" height="3" fill="#111827" />
            <rect x="2" y="18" width="8" height="8" fill="none" stroke="#111827" strokeWidth="1.6" />
            <rect x="4.5" y="20.5" width="3" height="3" fill="#111827" />
            <rect x="13" y="4" width="3" height="3" fill="#111827" />
            <rect x="12" y="12" width="4" height="4" fill="#111827" />
            <rect x="18" y="14" width="3" height="3" fill="#111827" />
            <rect x="22" y="19" width="4" height="4" fill="#111827" />
            <rect x="13" y="20" width="3" height="5" fill="#111827" />
          </svg>
        </div>
      </div>
    </div>
  );
}
