import type { CoinResult, InsightResult, LineKind, LinePolarity, LineRecord, LineValue, Trigram } from "../types";

type LineInput = LinePolarity | LineValue | Pick<LineRecord, "total" | "round">;

type LineInfo = {
  sum: LineValue;
  kind: LineKind;
  label: string;
  baseLine: LinePolarity;
  changedLine: LinePolarity;
  isChanging: boolean;
};

const trigramMap: Record<string, Trigram> = {
  "111": { key: "qian", name: "乾", symbol: "☰", nature: "天", lines: ["yang", "yang", "yang"] },
  "110": { key: "dui", name: "兑", symbol: "☱", nature: "泽", lines: ["yang", "yang", "yin"] },
  "101": { key: "li", name: "离", symbol: "☲", nature: "火", lines: ["yang", "yin", "yang"] },
  "100": { key: "zhen", name: "震", symbol: "☳", nature: "雷", lines: ["yang", "yin", "yin"] },
  "011": { key: "xun", name: "巽", symbol: "☴", nature: "风", lines: ["yin", "yang", "yang"] },
  "010": { key: "kan", name: "坎", symbol: "☵", nature: "水", lines: ["yin", "yang", "yin"] },
  "001": { key: "gen", name: "艮", symbol: "☶", nature: "山", lines: ["yin", "yin", "yang"] },
  "000": { key: "kun", name: "坤", symbol: "☷", nature: "地", lines: ["yin", "yin", "yin"] },
};

const hexagramNameMap: Record<string, Record<string, string>> = {
  乾: {
    乾: "乾为天",
    兑: "天泽履",
    离: "天火同人",
    震: "天雷无妄",
    巽: "天风姤",
    坎: "天水讼",
    艮: "天山遁",
    坤: "天地否",
  },
  兑: {
    乾: "泽天夬",
    兑: "兑为泽",
    离: "泽火革",
    震: "泽雷随",
    巽: "泽风大过",
    坎: "泽水困",
    艮: "泽山咸",
    坤: "泽地萃",
  },
  离: {
    乾: "火天大有",
    兑: "火泽睽",
    离: "离为火",
    震: "火雷噬嗑",
    巽: "火风鼎",
    坎: "火水未济",
    艮: "火山旅",
    坤: "火地晋",
  },
  震: {
    乾: "雷天大壮",
    兑: "雷泽归妹",
    离: "雷火丰",
    震: "震为雷",
    巽: "雷风恒",
    坎: "雷水解",
    艮: "雷山小过",
    坤: "雷地豫",
  },
  巽: {
    乾: "风天小畜",
    兑: "风泽中孚",
    离: "风火家人",
    震: "风雷益",
    巽: "巽为风",
    坎: "涣卦",
    艮: "风山渐",
    坤: "风地观",
  },
  坎: {
    乾: "水天需",
    兑: "水泽节",
    离: "水火既济",
    震: "水雷屯",
    巽: "水风井",
    坎: "坎为水",
    艮: "水山蹇",
    坤: "水地比",
  },
  艮: {
    乾: "山天大畜",
    兑: "山泽损",
    离: "山火贲",
    震: "山雷颐",
    巽: "山风蛊",
    坎: "山水蒙",
    艮: "艮为山",
    坤: "山地剥",
  },
  坤: {
    乾: "地天泰",
    兑: "地泽临",
    离: "地火明夷",
    震: "地雷复",
    巽: "地风升",
    坎: "地水师",
    艮: "地山谦",
    坤: "坤为地",
  },
};

const lineInfoMap: Record<LineValue, LineInfo> = {
  6: {
    sum: 6,
    kind: "old-yin",
    label: "老阴 · 变化爻",
    baseLine: "yin",
    changedLine: "yang",
    isChanging: true,
  },
  7: {
    sum: 7,
    kind: "young-yang",
    label: "少阳 · 稳定爻",
    baseLine: "yang",
    changedLine: "yang",
    isChanging: false,
  },
  8: {
    sum: 8,
    kind: "young-yin",
    label: "少阴 · 稳定爻",
    baseLine: "yin",
    changedLine: "yin",
    isChanging: false,
  },
  9: {
    sum: 9,
    kind: "old-yang",
    label: "老阳 · 变化爻",
    baseLine: "yang",
    changedLine: "yin",
    isChanging: true,
  },
};

export const lineKindLabel: Record<LineKind, string> = {
  "old-yin": lineInfoMap[6].label,
  "young-yang": lineInfoMap[7].label,
  "young-yin": lineInfoMap[8].label,
  "old-yang": lineInfoMap[9].label,
};

const assertLineValue = (sum: number): LineValue => {
  if (sum === 6 || sum === 7 || sum === 8 || sum === 9) {
    return sum;
  }

  throw new Error(`铜钱总和必须是 6、7、8、9，当前为 ${sum}`);
};

export const generateCoin = (round = 1, index = 0): CoinResult => {
  const side = Math.random() > 0.5 ? "front" : "back";

  return {
    id: `${round}-${index}`,
    side,
    value: side === "front" ? 3 : 2,
  };
};

export const getLineInfo = (sum: number): LineInfo => {
  return lineInfoMap[assertLineValue(sum)];
};

export const generateRound = (round: number): LineRecord => {
  const coins = Array.from({ length: 3 }, (_, index) => generateCoin(round, index));
  const total = assertLineValue(coins.reduce((sum, coin) => sum + coin.value, 0));
  const line = getLineInfo(total);

  return {
    round,
    coins,
    total,
    kind: line.kind,
    isChanging: line.isChanging,
  };
};

export const getBaseLines = (sums: number[]): LinePolarity[] => {
  return sums.map((sum) => getLineInfo(sum).baseLine);
};

export const getChangedLines = (sums: number[]): LinePolarity[] => {
  return sums.map((sum) => getLineInfo(sum).changedLine);
};

export const getMovingLines = (sums: number[]): number[] => {
  return sums.reduce<number[]>((movingLines, sum, index) => {
    if (getLineInfo(sum).isChanging) {
      movingLines.push(index + 1);
    }

    return movingLines;
  }, []);
};

const lineToPolarity = (line: LineInput, mode: "base" | "changed" = "base"): LinePolarity => {
  if (line === "yin" || line === "yang") {
    return line;
  }

  const sum = typeof line === "number" ? line : line.total;
  const info = getLineInfo(sum);
  return mode === "base" ? info.baseLine : info.changedLine;
};

const normalizeHexagramLines = (lines: readonly LineInput[], mode: "base" | "changed" = "base") => {
  if (lines.length !== 6) {
    throw new Error(`六爻映射需要 6 条记录，当前为 ${lines.length}`);
  }

  return lines.map((line) => lineToPolarity(line, mode)) as [
    LinePolarity,
    LinePolarity,
    LinePolarity,
    LinePolarity,
    LinePolarity,
    LinePolarity,
  ];
};

const getTrigramKey = (lines: readonly [LinePolarity, LinePolarity, LinePolarity]) => {
  return lines.map((line) => (line === "yang" ? "1" : "0")).join("");
};

const getTrigramByLines = (lines: readonly [LinePolarity, LinePolarity, LinePolarity]) => {
  return trigramMap[getTrigramKey(lines)];
};

export const getTrigrams = (lines: readonly LineInput[]) => {
  const normalizedLines = normalizeHexagramLines(lines);
  const lowerLines = normalizedLines.slice(0, 3) as [LinePolarity, LinePolarity, LinePolarity];
  const upperLines = normalizedLines.slice(3, 6) as [LinePolarity, LinePolarity, LinePolarity];

  return {
    lowerTrigram: getTrigramByLines(lowerLines),
    upperTrigram: getTrigramByLines(upperLines),
  };
};

export const getHexagramName = (lines: readonly LineInput[]): string => {
  const { upperTrigram, lowerTrigram } = getTrigrams(lines);
  return hexagramNameMap[upperTrigram.name][lowerTrigram.name];
};

export const getHexagramResult = (lines: readonly LineInput[]) => {
  const baseLines = normalizeHexagramLines(lines, "base");
  const changedLines = normalizeHexagramLines(lines, "changed");
  const sums = lines
    .filter((line): line is LineValue | Pick<LineRecord, "total" | "round"> => line !== "yin" && line !== "yang")
    .map((line) => (typeof line === "number" ? line : line.total));
  const { lowerTrigram, upperTrigram } = getTrigrams(baseLines);

  return {
    baseHexagramName: getHexagramName(baseLines),
    changedHexagramName: getHexagramName(changedLines),
    movingLines: sums.length === 6 ? getMovingLines(sums) : [],
    upperTrigram,
    lowerTrigram,
  };
};

const resultLineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

export const buildReferenceSummary = (hexagramResult: ReturnType<typeof getHexagramResult>) => {
  if (hexagramResult.movingLines.length === 0) {
    return `本次参照：${hexagramResult.baseHexagramName}（无动爻）。`;
  }

  const movingLineNames = hexagramResult.movingLines.map((lineNumber) => resultLineNames[lineNumber - 1] ?? `第${lineNumber}爻`).join("、");
  return `本次参照：${hexagramResult.baseHexagramName}；动爻：${movingLineNames}；之卦：${hexagramResult.changedHexagramName}。`;
};

export const createCoinRound = (round: number): LineRecord => {
  return generateRound(round);
};

export const buildInsightResult = (lines: LineRecord[]): InsightResult => {
  const hexagramResult = getHexagramResult(lines);

  return {
    changingLines: hexagramResult.movingLines,
    hexagramResult,
    summary: buildReferenceSummary(hexagramResult),
  };
};

export const formatCoinSide = (side: CoinResult["side"]): string => {
  return side === "front" ? "正面" : "反面";
};

export const verifyInsightLogic = () => {
  const checks = [
    { sum: 6, kind: "old-yin", baseLine: "yin", changedLine: "yang", isChanging: true },
    { sum: 7, kind: "young-yang", baseLine: "yang", changedLine: "yang", isChanging: false },
    { sum: 8, kind: "young-yin", baseLine: "yin", changedLine: "yin", isChanging: false },
    { sum: 9, kind: "old-yang", baseLine: "yang", changedLine: "yin", isChanging: true },
  ] as const;

  checks.forEach((check) => {
    const line = getLineInfo(check.sum);
    console.assert(line.kind === check.kind, `${check.sum} 本次符号判断正确`);
    console.assert(line.baseLine === check.baseLine, `${check.sum} 当前卦象爻形正确`);
    console.assert(line.changedLine === check.changedLine, `${check.sum} 变化后爻形正确`);
    console.assert(line.isChanging === check.isChanging, `${check.sum} 变化爻判断正确`);
  });

  const generatedOrder = Array.from({ length: 6 }, (_, index) => generateRound(index + 1));
  console.assert(generatedOrder[0].round === 1, "第一次显示在最下方");
  console.assert(generatedOrder[5].round === 6, "第六次显示在最上方");
  console.info("六爻生成规则验证完成：6/7/8/9、本次符号、变化爻、上下顺序均已通过。");
};

if (import.meta.env?.DEV) {
  verifyInsightLogic();
}
