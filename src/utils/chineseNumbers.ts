export type ArithmeticOp = "+" | "-" | "*" | "/";

export interface ChineseText {
  hanzi: string;
  pinyin: string;
}

export interface OperatorMeta {
  op: ArithmeticOp;
  symbol: string;
  buttonLabel: string;
  hanzi: string;
  pinyin: string;
  ko: string;
}

export const ARITHMETIC_OPERATORS: Record<ArithmeticOp, OperatorMeta> = {
  "+": {
    op: "+",
    symbol: "+",
    buttonLabel: "加",
    hanzi: "加",
    pinyin: "jiā",
    ko: "더하기",
  },
  "-": {
    op: "-",
    symbol: "-",
    buttonLabel: "减",
    hanzi: "减",
    pinyin: "jiǎn",
    ko: "빼기",
  },
  "*": {
    op: "*",
    symbol: "×",
    buttonLabel: "乘",
    hanzi: "乘",
    pinyin: "chéng",
    ko: "곱하기",
  },
  "/": {
    op: "/",
    symbol: "÷",
    buttonLabel: "除",
    hanzi: "除以",
    pinyin: "chúyǐ",
    ko: "나누기",
  },
};

export interface NumberRefItem {
  value: string;
  hanzi: string;
  pinyin: string;
  ko: string;
  note?: string;
}

export const BASIC_NUMBERS: NumberRefItem[] = [
  { value: "0", hanzi: "零", pinyin: "líng", ko: "영 / 0" },
  { value: "1", hanzi: "一", pinyin: "yī", ko: "일 / 하나" },
  { value: "2", hanzi: "二", pinyin: "èr", ko: "이 / 둘 (수·계산)" },
  { value: "2 (수량)", hanzi: "两", pinyin: "liǎng", ko: "둘 (개수·시각)" },
  { value: "3", hanzi: "三", pinyin: "sān", ko: "삼 / 셋" },
  { value: "4", hanzi: "四", pinyin: "sì", ko: "사 / 넷" },
  { value: "5", hanzi: "五", pinyin: "wǔ", ko: "오 / 다섯" },
  { value: "6", hanzi: "六", pinyin: "liù", ko: "육 / 여섯" },
  { value: "7", hanzi: "七", pinyin: "qī", ko: "칠 / 일곱" },
  { value: "8", hanzi: "八", pinyin: "bā", ko: "팔 / 여덟" },
  { value: "9", hanzi: "九", pinyin: "jiǔ", ko: "구 / 아홉" },
  { value: "10", hanzi: "十", pinyin: "shí", ko: "십 / 열" },
];

export const UNIT_NUMBERS: NumberRefItem[] = [
  { value: "100", hanzi: "百", pinyin: "bǎi", ko: "백", note: "一百 (yìbǎi)" },
  { value: "1,000", hanzi: "千", pinyin: "qiān", ko: "천", note: "一千 (yìqiān)" },
  { value: "10,000", hanzi: "万", pinyin: "wàn", ko: "만", note: "一万 (yíwàn)" },
  { value: "100,000,000", hanzi: "亿", pinyin: "yì", ko: "억", note: "一亿 (yíyì)" },
];

const DIGIT_HANZI = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const DIGIT_PINYIN = [
  "líng",
  "yī",
  "èr",
  "sān",
  "sì",
  "wǔ",
  "liù",
  "qī",
  "bā",
  "jiǔ",
];

function digitPinyinBeforeUnit(digit: number, unit: "shí" | "bǎi" | "qiān" | "wàn" | "yì"): string {
  if (digit !== 1) return DIGIT_PINYIN[digit];
  // Tone sandhi for 一: 4th tone before 万/亿 -> yí; 1st/2nd/3rd tone before 十/百/千 -> yì
  return unit === "wàn" || unit === "yì" ? "yí" : "yì";
}

function convertFourDigits(num: number, isTopSection: boolean): ChineseText {
  if (num === 0) return { hanzi: "", pinyin: "" };

  const d3 = Math.floor(num / 1000);
  const d2 = Math.floor((num % 1000) / 100);
  const d1 = Math.floor((num % 100) / 10);
  const d0 = num % 10;

  const digits = [d3, d2, d1, d0];
  const unitHanzi = ["千", "百", "十", ""] as const;
  const unitPinyin = ["qiān", "bǎi", "shí", ""] as const;

  let hanzi = "";
  const pinyinParts: string[] = [];
  let needZero = false;

  for (let i = 0; i < 4; i++) {
    const d = digits[i];
    if (d === 0) {
      if (hanzi.length > 0) {
        needZero = true;
      }
      continue;
    }

    if (needZero) {
      hanzi += "零";
      pinyinParts.push("líng");
      needZero = false;
    }

    const uHz = unitHanzi[i];
    const uPy = unitPinyin[i];

    // Special rule: 10..19 at the top of the whole number omits leading 一 (e.g., 15 -> 十五)
    if (i === 2 && d === 1 && hanzi.length === 0 && isTopSection) {
      hanzi += "十";
      pinyinParts.push("shí");
    } else if (uPy) {
      hanzi += DIGIT_HANZI[d] + uHz;
      const dPy = digitPinyinBeforeUnit(d, uPy);
      pinyinParts.push(`${dPy}${uPy}`);
    } else {
      hanzi += DIGIT_HANZI[d];
      pinyinParts.push(DIGIT_PINYIN[d]);
    }
  }

  return { hanzi, pinyin: pinyinParts.join(" ") };
}

function integerStringToChinese(intStr: string): ChineseText {
  const normalized = intStr.replace(/^0+/, "") || "0";
  if (normalized === "0") {
    return { hanzi: "零", pinyin: "líng" };
  }

  if (normalized.length > 12) {
    // Fallback digit-by-digit for huge numbers beyond 9999亿
    const chars = Array.from(normalized);
    return {
      hanzi: chars.map((c) => DIGIT_HANZI[Number(c)] ?? c).join(""),
      pinyin: chars.map((c) => DIGIT_PINYIN[Number(c)] ?? c).join(" "),
    };
  }

  const sections: number[] = [];
  for (let end = normalized.length; end > 0; end -= 4) {
    const start = Math.max(0, end - 4);
    sections.unshift(Number(normalized.slice(start, end)));
  }

  const sectionCount = sections.length; // 1: units, 2: 万, 3: 亿
  const secUnitHanzi = ["", "万", "亿"] as const;
  const secUnitPinyin = ["", "wàn", "yì"] as const;

  let hanzi = "";
  const pinyinParts: string[] = [];
  let hadZeroSection = false;

  for (let idx = 0; idx < sectionCount; idx++) {
    const secVal = sections[idx];
    const powerIdx = sectionCount - 1 - idx; // 2 -> 亿, 1 -> 万, 0 -> ""

    if (secVal === 0) {
      if (hanzi.length > 0) {
        hadZeroSection = true;
      }
      continue;
    }

    const isTopSection = hanzi.length === 0;
    if (!isTopSection && (hadZeroSection || secVal < 1000)) {
      hanzi += "零";
      pinyinParts.push("líng");
    }
    hadZeroSection = false;

    const part = convertFourDigits(secVal, isTopSection);
    const uHz = secUnitHanzi[powerIdx];
    const uPy = secUnitPinyin[powerIdx];

    if (uHz && secVal === 1 && isTopSection) {
      // e.g. 10000 -> 一万 (yí wàn), 100000000 -> 一亿 (yí yì)
      hanzi += `一${uHz}`;
      pinyinParts.push(`${digitPinyinBeforeUnit(1, uPy as "wàn" | "yì")} ${uPy}`);
    } else {
      hanzi += part.hanzi + uHz;
      if (part.pinyin) pinyinParts.push(part.pinyin);
      if (uPy) pinyinParts.push(uPy);
    }
  }

  return {
    hanzi: hanzi || "零",
    pinyin: pinyinParts.join(" ") || "líng",
  };
}

export function numberToChinese(input: number | string): ChineseText {
  const raw = typeof input === "number" ? String(input) : input.trim();
  if (!raw || raw === "-" || raw === ".") {
    return { hanzi: "零", pinyin: "líng" };
  }

  const num = Number(raw);
  if (!Number.isFinite(num)) {
    return { hanzi: "错误", pinyin: "cuòwù" };
  }

  // Format avoiding scientific notation when reasonable
  let clean = raw;
  if (/e/i.test(clean)) {
    clean = num.toString();
    if (/e/i.test(clean)) {
      return {
        hanzi: clean,
        pinyin: clean,
      };
    }
  }

  const isNegative = clean.startsWith("-");
  if (isNegative) {
    clean = clean.slice(1);
  }

  const [intPart = "0", decPart] = clean.split(".");
  const intZh = integerStringToChinese(intPart || "0");

  let hanzi = intZh.hanzi;
  const pinyinParts = [intZh.pinyin];

  if (decPart !== undefined && decPart.length > 0) {
    const trimmedDec = decPart;
    const decDigits = Array.from(trimmedDec);
    hanzi += "点" + decDigits.map((d) => DIGIT_HANZI[Number(d)] ?? d).join("");
    pinyinParts.push("diǎn");
    pinyinParts.push(...decDigits.map((d) => DIGIT_PINYIN[Number(d)] ?? d));
  }

  if (isNegative && !(intZh.hanzi === "零" && (!decPart || /^0+$/.test(decPart)))) {
    hanzi = "负" + hanzi;
    pinyinParts.unshift("fù");
  }

  return {
    hanzi,
    pinyin: pinyinParts.join(" "),
  };
}

export function expressionToChinese(
  left: string,
  op: ArithmeticOp,
  right: string,
  result: string
): ChineseText {
  const leftZh = numberToChinese(left);
  const rightZh = numberToChinese(right);
  const resultZh = numberToChinese(result);
  const opMeta = ARITHMETIC_OPERATORS[op];

  return {
    hanzi: `${leftZh.hanzi} ${opMeta.hanzi} ${rightZh.hanzi} 等于 ${resultZh.hanzi}`,
    pinyin: `${leftZh.pinyin} ${opMeta.pinyin} ${rightZh.pinyin} děngyú ${resultZh.pinyin}`,
  };
}
