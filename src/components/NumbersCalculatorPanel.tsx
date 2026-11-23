import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ARITHMETIC_OPERATORS,
  ArithmeticOp,
  BASIC_NUMBERS,
  expressionToChinese,
  numberToChinese,
  UNIT_NUMBERS,
} from "../utils/chineseNumbers";
import { speakChinese } from "../utils/speech";

interface NumbersCalculatorPanelProps {
  isActive: boolean;
}

interface CalcHistoryItem {
  id: number;
  left: string;
  op: ArithmeticOp;
  right: string;
  result: string;
  hanziExpr: string;
  pinyinExpr: string;
}

const DIGIT_SPEAK = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const PRESET_NUMBERS = ["15", "20", "105", "250", "2026", "10000", "12345"];

function computeArithmetic(
  leftStr: string,
  op: ArithmeticOp,
  rightStr: string
): { ok: true; value: string } | { ok: false; error: string } {
  const a = Number(leftStr);
  const b = Number(rightStr);
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { ok: false, error: "올바른 숫자가 아닙니다 (数字无效)" };
  }
  if (op === "/" && b === 0) {
    return { ok: false, error: "0으로 나눌 수 없습니다 (不能除以零)" };
  }

  let raw = 0;
  if (op === "+") raw = a + b;
  else if (op === "-") raw = a - b;
  else if (op === "*") raw = a * b;
  else raw = a / b;

  if (!Number.isFinite(raw)) {
    return { ok: false, error: "계산 범위를 초과했습니다 (超出范围)" };
  }

  // Clean IEEE-754 floating point noise like 0.1 + 0.2 = 0.30000000000000004
  const cleaned = Number(raw.toPrecision(12));
  return { ok: true, value: Object.is(cleaned, -0) ? "0" : String(cleaned) };
}

export function NumbersCalculatorPanel({
  isActive,
}: NumbersCalculatorPanelProps) {
  // Left section state: number reference & converter
  const [activeRefKey, setActiveRefKey] = useState<string | null>(null);
  const [converterInput, setConverterInput] = useState<string>("2026");

  // Right section state: Chinese calculator
  const [display, setDisplay] = useState<string>("0");
  const [storedValue, setStoredValue] = useState<string | null>(null);
  const [pendingOp, setPendingOp] = useState<ArithmeticOp | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [lastEquation, setLastEquation] = useState<{
    left: string;
    op: ArithmeticOp;
    right: string;
    result: string;
  } | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [history, setHistory] = useState<CalcHistoryItem[]>([]);
  const [tapSpeak, setTapSpeak] = useState<boolean>(true);

  const [speakingTag, setSpeakingTag] = useState<string | null>(null);
  const [ttsNotice, setTtsNotice] = useState<string>("");

  const playChinese = useCallback(
    (text: string, tag: string, rate = 1.0) => {
      speakChinese(text, rate, {
        onStart: () => {
          setSpeakingTag(tag);
          setTtsNotice(
            rate < 1 ? `🐢 느리게 발음 중: ${text}` : `🔊 발음 중: ${text}`
          );
        },
        onEnd: () => {
          setSpeakingTag(null);
          setTtsNotice("");
        },
        onError: (msg) => {
          setSpeakingTag(null);
          setTtsNotice(msg);
        },
      });
    },
    []
  );

  const convertedNumber = useMemo(() => {
    const trimmed = converterInput.trim();
    if (!trimmed) {
      return { hanzi: "零", pinyin: "líng" };
    }
    if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return null;
    }
    return numberToChinese(trimmed);
  }, [converterInput]);

  const displayChinese = useMemo(() => {
    if (calcError) {
      return { hanzi: "不能除以零", pinyin: "bù néng chúyǐ líng" };
    }
    return numberToChinese(display);
  }, [calcError, display]);

  const equationBanner = useMemo(() => {
    if (lastEquation) {
      const expr = expressionToChinese(
        lastEquation.left,
        lastEquation.op,
        lastEquation.right,
        lastEquation.result
      );
      const opMeta = ARITHMETIC_OPERATORS[lastEquation.op];
      return {
        arabic: `${lastEquation.left} ${opMeta.symbol} ${lastEquation.right} = ${lastEquation.result}`,
        hanzi: expr.hanzi,
        pinyin: expr.pinyin,
        complete: true,
      };
    }

    if (storedValue !== null && pendingOp !== null) {
      const leftZh = numberToChinese(storedValue);
      const opMeta = ARITHMETIC_OPERATORS[pendingOp];
      if (waitingForOperand) {
        return {
          arabic: `${storedValue} ${opMeta.symbol}`,
          hanzi: `${leftZh.hanzi} ${opMeta.hanzi}`,
          pinyin: `${leftZh.pinyin} ${opMeta.pinyin}`,
          complete: false,
        };
      }
      const rightZh = numberToChinese(display);
      return {
        arabic: `${storedValue} ${opMeta.symbol} ${display}`,
        hanzi: `${leftZh.hanzi} ${opMeta.hanzi} ${rightZh.hanzi}`,
        pinyin: `${leftZh.pinyin} ${opMeta.pinyin} ${rightZh.pinyin}`,
        complete: false,
      };
    }

    return null;
  }, [display, lastEquation, pendingOp, storedValue, waitingForOperand]);

  const handleDigit = useCallback(
    (digit: string) => {
      setCalcError(null);
      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
        if (!pendingOp) {
          setLastEquation(null);
        }
      } else {
        setDisplay((prev) => {
          if (prev === "0") return digit;
          if (prev === "-0") return `-${digit}`;
          if (prev.length >= 12) return prev;
          return prev + digit;
        });
      }
      if (tapSpeak) {
        playChinese(DIGIT_SPEAK[Number(digit)] || digit, `key-${digit}`);
      }
    },
    [pendingOp, playChinese, tapSpeak, waitingForOperand]
  );

  const handleDot = useCallback(() => {
    setCalcError(null);
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      if (!pendingOp) {
        setLastEquation(null);
      }
    } else {
      setDisplay((prev) => (prev.includes(".") ? prev : `${prev}.`));
    }
    if (tapSpeak) {
      playChinese("点", "key-dot");
    }
  }, [pendingOp, playChinese, tapSpeak, waitingForOperand]);

  const handleToggleSign = useCallback(() => {
    setCalcError(null);
    if (display === "0" || display === "0.") return;
    const next = display.startsWith("-") ? display.slice(1) : `-${display}`;
    setDisplay(next);
    if (tapSpeak) {
      playChinese(numberToChinese(next).hanzi, "key-sign");
    }
  }, [display, playChinese, tapSpeak]);

  const handleBackspace = useCallback(() => {
    setCalcError(null);
    if (waitingForOperand) return;
    setDisplay((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith("-"))) {
        return "0";
      }
      return prev.slice(0, -1);
    });
  }, [waitingForOperand]);

  const handleClearAll = useCallback(() => {
    setDisplay("0");
    setStoredValue(null);
    setPendingOp(null);
    setWaitingForOperand(false);
    setLastEquation(null);
    setCalcError(null);
    if (tapSpeak) {
      playChinese("归零", "key-ac");
    }
  }, [playChinese, tapSpeak]);

  const handleOperator = useCallback(
    (nextOp: ArithmeticOp) => {
      setCalcError(null);
      if (storedValue !== null && pendingOp !== null && !waitingForOperand) {
        const res = computeArithmetic(storedValue, pendingOp, display);
        if (!res.ok) {
          setCalcError(res.error);
          setStoredValue(null);
          setPendingOp(null);
          setWaitingForOperand(true);
          return;
        }
        setDisplay(res.value);
        setStoredValue(res.value);
        setLastEquation({
          left: storedValue,
          op: pendingOp,
          right: display,
          result: res.value,
        });
      } else {
        setStoredValue(display);
        setLastEquation(null);
      }
      setPendingOp(nextOp);
      setWaitingForOperand(true);
      if (tapSpeak) {
        playChinese(ARITHMETIC_OPERATORS[nextOp].hanzi, `op-${nextOp}`);
      }
    },
    [display, pendingOp, playChinese, storedValue, tapSpeak, waitingForOperand]
  );

  const handleEquals = useCallback(() => {
    setCalcError(null);
    if (storedValue === null || pendingOp === null) {
      if (tapSpeak) {
        playChinese(numberToChinese(display).hanzi, "calc-result");
      }
      return;
    }

    const res = computeArithmetic(storedValue, pendingOp, display);
    if (!res.ok) {
      setCalcError(res.error);
      setStoredValue(null);
      setPendingOp(null);
      setWaitingForOperand(true);
      if (tapSpeak) {
        playChinese("不能除以零", "calc-error");
      }
      return;
    }

    const eq = {
      left: storedValue,
      op: pendingOp,
      right: display,
      result: res.value,
    };
    const expr = expressionToChinese(eq.left, eq.op, eq.right, eq.result);

    setDisplay(res.value);
    setStoredValue(null);
    setPendingOp(null);
    setWaitingForOperand(true);
    setLastEquation(eq);
    setHistory((prev) => [
      {
        id: Date.now(),
        ...eq,
        hanziExpr: expr.hanzi,
        pinyinExpr: expr.pinyin,
      },
      ...prev.slice(0, 5),
    ]);

    if (tapSpeak) {
      playChinese(expr.hanzi, "calc-expr");
    }
  }, [display, pendingOp, playChinese, storedValue, tapSpeak]);

  // Optional keyboard support on this tab when not typing inside input
  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (evt: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (/^[0-9]$/.test(evt.key)) {
        evt.preventDefault();
        handleDigit(evt.key);
      } else if (evt.key === ".") {
        evt.preventDefault();
        handleDot();
      } else if (evt.key === "+" || evt.key === "-" || evt.key === "*" || evt.key === "/") {
        evt.preventDefault();
        handleOperator(evt.key);
      } else if (evt.key === "Enter" || evt.key === "=") {
        evt.preventDefault();
        handleEquals();
      } else if (evt.key === "Backspace") {
        evt.preventDefault();
        handleBackspace();
      } else if (evt.key === "Escape") {
        evt.preventDefault();
        handleClearAll();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    handleBackspace,
    handleClearAll,
    handleDigit,
    handleDot,
    handleEquals,
    handleOperator,
    isActive,
  ]);

  const digitBtnClass =
    "border border-[#e2e8f0] bg-white text-[#0f172a] rounded-[12px] py-2.5 px-2 cursor-pointer transition hover:bg-[#f8fafc] hover:border-[#cbd5e1] active:scale-[0.98] flex flex-col items-center justify-center min-h-[64px] select-none";
  const opBtnClass = (op: ArithmeticOp) =>
    `border rounded-[12px] py-2.5 px-2 cursor-pointer transition active:scale-[0.98] flex flex-col items-center justify-center min-h-[64px] select-none ${
      pendingOp === op && waitingForOperand
        ? "bg-[#2563eb] border-[#2563eb] text-white shadow-sm"
        : "bg-[#eff6ff] border-[#bfdbfe] text-[#1d4ed8] hover:bg-[#dbeafe]"
    }`;

  return (
    <section aria-label="중국어 숫자 및 사칙연산 계산기">
      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 items-start">
        {/* Left: Chinese Numbers & Converter */}
        <article className="card-surface p-5">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div>
              <h2 className="text-[1.05rem] font-extrabold m-0">
                🔢 중국어 숫자 표 (0~10 · 백·천·만·억)
              </h2>
              <p className="text-[0.82rem] text-[#64748b] mt-0.5 mb-0">
                숫자 카드를 누르면 원어민 중국어 발음을 바로 들을 수 있어요.
              </p>
            </div>
          </div>

          {/* 0 ~ 10 + 两 */}
          <div className="grid grid-cols-3 min-[460px]:grid-cols-4 gap-2 mb-3.5">
            {BASIC_NUMBERS.map((item) => {
              const key = `num-${item.hanzi}-${item.value}`;
              const isSelected = activeRefKey === key;
              const isSpeaking = speakingTag === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveRefKey(key);
                    playChinese(item.hanzi, key);
                  }}
                  className={`border rounded-[12px] p-2.5 text-center cursor-pointer transition hover:-translate-y-px select-none ${
                    isSpeaking
                      ? "bg-[#fef2f2] border-[#dc2626] btn-speaking"
                      : isSelected
                      ? "bg-[#fef2f2] border-[#fca5a5]"
                      : "bg-[#f8fafc] border-[#e2e8f0] hover:bg-white hover:border-[#cbd5e1]"
                  }`}
                >
                  <div className="text-[0.72rem] font-extrabold text-[#64748b]">
                    {item.value}
                  </div>
                  <div className="font-hanzi text-[1.75rem] font-bold text-[#0f172a] leading-tight my-0.5">
                    {item.hanzi}
                  </div>
                  <div className="text-[0.8rem] font-bold text-[#dc2626]">
                    {item.pinyin}
                  </div>
                  <div className="text-[0.72rem] text-[#475569] mt-0.5 truncate">
                    {item.ko}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 百, 千, 万, 亿 */}
          <div className="text-[0.8rem] font-extrabold text-[#475569] mb-1.5">
            큰 단위 숫자
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {UNIT_NUMBERS.map((item) => {
              const key = `unit-${item.hanzi}`;
              const isSpeaking = speakingTag === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveRefKey(key);
                    playChinese(item.note ? item.note.split(" ")[0] : item.hanzi, key);
                  }}
                  className={`border rounded-[12px] p-2.5 text-center cursor-pointer transition hover:-translate-y-px select-none ${
                    isSpeaking
                      ? "bg-[#eff6ff] border-[#2563eb] btn-speaking"
                      : "bg-[#f8fafc] border-[#e2e8f0] hover:bg-white hover:border-[#cbd5e1]"
                  }`}
                >
                  <div className="text-[0.7rem] font-bold text-[#64748b]">
                    {item.value}
                  </div>
                  <div className="font-hanzi text-[1.55rem] font-bold text-[#0f172a] leading-tight">
                    {item.hanzi}
                  </div>
                  <div className="text-[0.78rem] font-bold text-[#2563eb]">
                    {item.pinyin} · {item.ko}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Arbitrary Number -> Chinese Converter */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] p-3.5 mb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <label
                htmlFor="number-converter-input"
                className="text-[0.86rem] font-extrabold text-[#1e293b]"
              >
                🔄 숫자 → 중국어 읽기 변환기
              </label>
              <span className="text-[0.74rem] text-[#64748b]">
                정수·소수·음수 입력 가능
              </span>
            </div>

            <div className="flex gap-2 mb-2.5">
              <input
                id="number-converter-input"
                type="text"
                inputMode="decimal"
                value={converterInput}
                onChange={(e) => setConverterInput(e.target.value)}
                placeholder="예: 2026 또는 3.14"
                className="flex-1 min-w-0 px-3 py-2 border border-[#cbd5e1] rounded-[10px] bg-white text-[#0f172a] font-bold text-[0.95rem] focus:outline-none focus:border-[#2563eb]"
              />
              <button
                type="button"
                disabled={!convertedNumber}
                onClick={() =>
                  convertedNumber &&
                  playChinese(convertedNumber.hanzi, "conv-normal")
                }
                className={`border border-[#2563eb] bg-[#2563eb] text-white px-3.5 py-2 rounded-[10px] text-[0.85rem] font-semibold cursor-pointer inline-flex items-center gap-1 transition hover:bg-[#1d4ed8] disabled:opacity-45 disabled:cursor-not-allowed ${
                  speakingTag === "conv-normal" ? "btn-speaking" : ""
                }`}
              >
                🔊 듣기
              </button>
              <button
                type="button"
                disabled={!convertedNumber}
                onClick={() =>
                  convertedNumber &&
                  playChinese(convertedNumber.hanzi, "conv-slow", 0.7)
                }
                className={`border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-3 py-2 rounded-[10px] text-[0.85rem] font-semibold cursor-pointer inline-flex items-center gap-1 transition hover:bg-[#dbeafe] disabled:opacity-45 disabled:cursor-not-allowed ${
                  speakingTag === "conv-slow" ? "btn-speaking" : ""
                }`}
              >
                🐢 0.7×
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRESET_NUMBERS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setConverterInput(preset)}
                  className={`px-2.5 py-1 rounded-full text-[0.76rem] font-bold border cursor-pointer transition ${
                    converterInput === preset
                      ? "bg-[#dc2626] border-[#dc2626] text-white"
                      : "bg-white border-[#e2e8f0] text-[#475569] hover:border-[#cbd5e1]"
                  }`}
                >
                  {Number(preset).toLocaleString()}
                </button>
              ))}
            </div>

            {convertedNumber ? (
              <div className="bg-white border border-[#e2e8f0] rounded-[12px] px-3.5 py-2.5">
                <div className="font-hanzi text-[1.55rem] font-bold text-[#0f172a] leading-snug break-all">
                  {convertedNumber.hanzi}
                </div>
                <div className="text-[0.88rem] font-bold text-[#dc2626] mt-0.5 break-words">
                  {convertedNumber.pinyin}
                </div>
              </div>
            ) : (
              <div className="text-[0.82rem] font-semibold text-[#d97706]">
                예: 15, 2026, -8, 3.14 처럼 숫자만 입력해 주세요.
              </div>
            )}
          </div>

          {/* 二 vs 两 usage note */}
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[12px] px-3.5 py-2.5 text-[0.8rem] text-[#78350f] leading-relaxed">
            <strong>💡 二(èr) vs 两(liǎng)</strong>: 숫자 세기·전화번호·사칙연산에서는{" "}
            <strong className="font-hanzi">二</strong>를 쓰고, 개수(两个 2개)·시각(两点 2시)처럼
            양사 앞에서는 <strong className="font-hanzi">两</strong>을 씁니다.
          </div>
        </article>

        {/* Right: Chinese Arithmetic Calculator */}
        <article className="card-surface p-5">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div>
              <h2 className="text-[1.05rem] font-extrabold m-0">
                🧮 중국어 사칙연산 계산기 (中文计算器)
              </h2>
              <p className="text-[0.8rem] text-[#64748b] mt-0.5 mb-0">
                버튼이 중국어로 배치되어 있어 계산하며 숫자와 연산을 익힙니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTapSpeak((prev) => !prev)}
              className={`border px-2.5 py-1 rounded-full text-[0.75rem] font-bold cursor-pointer transition ${
                tapSpeak
                  ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]"
                  : "bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]"
              }`}
            >
              {tapSpeak ? "🔊 누를 때 발음 ON" : "🔇 누를 때 발음 OFF"}
            </button>
          </div>

          {/* Calculator Display */}
          <div className="bg-[#0f172a] text-white rounded-[16px] p-4 mb-3.5 shadow-inner">
            <div className="min-h-[42px] text-right mb-1.5">
              {equationBanner ? (
                <>
                  <div className="text-[0.82rem] text-[#94a3b8] font-semibold">
                    {equationBanner.arabic}
                  </div>
                  <div className="font-hanzi text-[0.95rem] font-bold text-[#fde68a] mt-0.5 break-words">
                    {equationBanner.hanzi}
                  </div>
                  <div className="text-[0.74rem] text-[#cbd5e1]">
                    {equationBanner.pinyin}
                  </div>
                </>
              ) : (
                <div className="text-[0.78rem] text-[#64748b]">
                  중국어 숫자 버튼으로 사칙연산을 계산해 보세요
                </div>
              )}
            </div>

            <div className="text-right font-mono text-[clamp(1.85rem,4.5vw,2.45rem)] font-extrabold tracking-tight leading-none py-1 overflow-x-auto">
              {calcError ? "错误" : display}
            </div>

            {calcError ? (
              <div className="text-right text-[0.82rem] font-bold text-[#fca5a5] mt-1">
                {calcError}
              </div>
            ) : (
              <div className="mt-2 pt-2 border-t border-slate-700/70 flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="font-hanzi text-[1.1rem] font-bold text-[#f8fafc] truncate">
                    {displayChinese.hanzi}
                  </div>
                  <div className="text-[0.76rem] text-[#93c5fd] truncate">
                    {displayChinese.pinyin}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      playChinese(displayChinese.hanzi, "calc-result")
                    }
                    className={`border border-slate-600 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-[8px] text-[0.76rem] font-bold cursor-pointer transition ${
                      speakingTag === "calc-result" ? "btn-speaking" : ""
                    }`}
                  >
                    🔊 결과 읽기
                  </button>
                  {equationBanner && (
                    <button
                      type="button"
                      onClick={() =>
                        playChinese(equationBanner.hanzi, "calc-expr")
                      }
                      className={`border border-[#2563eb] bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-2.5 py-1.5 rounded-[8px] text-[0.76rem] font-bold cursor-pointer transition ${
                        speakingTag === "calc-expr" ? "btn-speaking" : ""
                      }`}
                    >
                      🗣️ 식 읽기
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chinese Keypad Layout (4 x 5) */}
          <div
            className="grid grid-cols-4 gap-2 mb-3.5"
            role="group"
            aria-label="중국어 계산기 키패드"
          >
            {/* Row 1: Controls + Divide */}
            <button
              type="button"
              onClick={handleClearAll}
              className="border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] rounded-[12px] py-2 px-1 cursor-pointer transition hover:bg-[#fee2e2] active:scale-[0.98] flex flex-col items-center justify-center min-h-[60px] select-none"
            >
              <span className="font-hanzi text-[1.1rem] font-extrabold leading-tight">
                归零
              </span>
              <span className="text-[0.68rem] font-bold opacity-85">
                AC · 초기화
              </span>
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="border border-[#e2e8f0] bg-[#f8fafc] text-[#334155] rounded-[12px] py-2 px-1 cursor-pointer transition hover:bg-[#f1f5f9] active:scale-[0.98] flex flex-col items-center justify-center min-h-[60px] select-none"
            >
              <span className="font-hanzi text-[1.1rem] font-extrabold leading-tight">
                退格
              </span>
              <span className="text-[0.68rem] font-bold opacity-80">
                ⌫ · 지우기
              </span>
            </button>

            <button
              type="button"
              onClick={handleToggleSign}
              className="border border-[#e2e8f0] bg-[#f8fafc] text-[#334155] rounded-[12px] py-2 px-1 cursor-pointer transition hover:bg-[#f1f5f9] active:scale-[0.98] flex flex-col items-center justify-center min-h-[60px] select-none"
            >
              <span className="font-hanzi text-[1.1rem] font-extrabold leading-tight">
                正负
              </span>
              <span className="text-[0.68rem] font-bold opacity-80">
                ± · 부호
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOperator("/")}
              className={opBtnClass("/")}
            >
              <span className="font-hanzi text-[1.35rem] font-bold leading-tight">
                除以
              </span>
              <span className="text-[0.7rem] font-bold opacity-85">
                ÷ · chúyǐ
              </span>
            </button>

            {/* Row 2: 7 8 9 × */}
            {[
              { d: "7", hz: "七", py: "qī" },
              { d: "8", hz: "八", py: "bā" },
              { d: "9", hz: "九", py: "jiǔ" },
            ].map((k) => (
              <button
                key={k.d}
                type="button"
                onClick={() => handleDigit(k.d)}
                className={digitBtnClass}
              >
                <span className="font-hanzi text-[1.5rem] font-bold leading-tight">
                  {k.hz}
                </span>
                <span className="text-[0.72rem] font-bold text-[#64748b]">
                  {k.d} · {k.py}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleOperator("*")}
              className={opBtnClass("*")}
            >
              <span className="font-hanzi text-[1.4rem] font-bold leading-tight">
                乘
              </span>
              <span className="text-[0.7rem] font-bold opacity-85">
                × · chéng
              </span>
            </button>

            {/* Row 3: 4 5 6 - */}
            {[
              { d: "4", hz: "四", py: "sì" },
              { d: "5", hz: "五", py: "wǔ" },
              { d: "6", hz: "六", py: "liù" },
            ].map((k) => (
              <button
                key={k.d}
                type="button"
                onClick={() => handleDigit(k.d)}
                className={digitBtnClass}
              >
                <span className="font-hanzi text-[1.5rem] font-bold leading-tight">
                  {k.hz}
                </span>
                <span className="text-[0.72rem] font-bold text-[#64748b]">
                  {k.d} · {k.py}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleOperator("-")}
              className={opBtnClass("-")}
            >
              <span className="font-hanzi text-[1.4rem] font-bold leading-tight">
                减
              </span>
              <span className="text-[0.7rem] font-bold opacity-85">
                - · jiǎn
              </span>
            </button>

            {/* Row 4: 1 2 3 + */}
            {[
              { d: "1", hz: "一", py: "yī" },
              { d: "2", hz: "二", py: "èr" },
              { d: "3", hz: "三", py: "sān" },
            ].map((k) => (
              <button
                key={k.d}
                type="button"
                onClick={() => handleDigit(k.d)}
                className={digitBtnClass}
              >
                <span className="font-hanzi text-[1.5rem] font-bold leading-tight">
                  {k.hz}
                </span>
                <span className="text-[0.72rem] font-bold text-[#64748b]">
                  {k.d} · {k.py}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleOperator("+")}
              className={opBtnClass("+")}
            >
              <span className="font-hanzi text-[1.4rem] font-bold leading-tight">
                加
              </span>
              <span className="text-[0.7rem] font-bold opacity-85">
                + · jiā
              </span>
            </button>

            {/* Row 5: 0 (span 2) . = */}
            <button
              type="button"
              onClick={() => handleDigit("0")}
              className={`${digitBtnClass} col-span-2`}
            >
              <span className="font-hanzi text-[1.5rem] font-bold leading-tight">
                零
              </span>
              <span className="text-[0.72rem] font-bold text-[#64748b]">
                0 · líng
              </span>
            </button>

            <button
              type="button"
              onClick={handleDot}
              className={digitBtnClass}
            >
              <span className="font-hanzi text-[1.45rem] font-bold leading-tight">
                点
              </span>
              <span className="text-[0.72rem] font-bold text-[#64748b]">
                . · diǎn
              </span>
            </button>

            <button
              type="button"
              onClick={handleEquals}
              className="border border-[#dc2626] bg-[#dc2626] text-white rounded-[12px] py-2.5 px-2 cursor-pointer transition hover:bg-[#b91c1c] active:scale-[0.98] flex flex-col items-center justify-center min-h-[64px] select-none shadow-sm"
            >
              <span className="font-hanzi text-[1.35rem] font-bold leading-tight">
                等于
              </span>
              <span className="text-[0.7rem] font-bold opacity-90">
                = · děngyú
              </span>
            </button>
          </div>

          {/* Quick Arithmetic Operator Expressions */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {(["+", "-", "*", "/"] as ArithmeticOp[]).map((op) => {
              const meta = ARITHMETIC_OPERATORS[op];
              return (
                <button
                  key={op}
                  type="button"
                  onClick={() => playChinese(meta.hanzi, `badge-${op}`)}
                  className="border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white rounded-full px-2.5 py-1 text-[0.75rem] font-bold text-[#334155] cursor-pointer transition"
                >
                  {meta.symbol}{" "}
                  <span className="font-hanzi text-[#0f172a]">{meta.hanzi}</span>{" "}
                  ({meta.pinyin} · {meta.ko})
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => playChinese("等于", "badge-eq")}
              className="border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white rounded-full px-2.5 py-1 text-[0.75rem] font-bold text-[#334155] cursor-pointer transition"
            >
              = <span className="font-hanzi text-[#0f172a]">等于</span> (děngyú · 같다)
            </button>
          </div>

          <div className="text-[0.78rem] text-[#64748b] min-h-[18px] mb-3">
            {ttsNotice}
          </div>

          {/* Calculation History */}
          {history.length > 0 && (
            <div className="border-t border-[#e2e8f0] pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.82rem] font-extrabold text-[#475569]">
                  📝 최근 계산 기록 (计算历史)
                </span>
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="border-none bg-transparent text-[0.75rem] font-bold text-[#64748b] underline cursor-pointer"
                >
                  기록 비우기
                </button>
              </div>
              <div className="space-y-1.5">
                {history.map((item) => {
                  const opSymbol = ARITHMETIC_OPERATORS[item.op].symbol;
                  const tag = `hist-${item.id}`;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-[0.82rem] font-bold text-[#334155]">
                          {item.left} {opSymbol} {item.right} = {item.result}
                        </div>
                        <div className="font-hanzi text-[0.95rem] font-bold text-[#0f172a] truncate">
                          {item.hanziExpr}
                        </div>
                        <div className="text-[0.72rem] text-[#dc2626] font-semibold truncate">
                          {item.pinyinExpr}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => playChinese(item.hanziExpr, tag)}
                        className={`shrink-0 border border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb] px-2.5 py-1.5 rounded-[8px] text-[0.76rem] font-bold cursor-pointer hover:bg-[#dbeafe] ${
                          speakingTag === tag ? "btn-speaking" : ""
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
        </article>
      </div>
    </section>
  );
}
