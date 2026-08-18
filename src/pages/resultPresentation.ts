import type { LineRecord, LineValue } from "../types";

const middleLinePositions = ["", "二", "三", "四", "五", ""] as const;
const linePositionNotes = [
  "初爻在一卦之始，重点看起手方式、最初动机和第一步是否稳妥",
  "二爻居下卦之中，重点看基础层面的承接、配合与内在秩序",
  "三爻处下卦将尽之位，重点看从内部准备转向外部接触时的临界压力",
  "四爻入上卦之初，重点看外部关系、现实压力与进退尺度",
  "五爻居上卦之中，重点看关键位置上的判断、承担与统摄能力",
  "上爻在一卦之终，重点看收束、余势、边界和后续回看",
] as const;

export function getTraditionalLineName(index: number, total: LineValue) {
  const polarityNumber = total === 7 || total === 9 ? "九" : "六";

  if (index === 0) {
    return `初${polarityNumber}`;
  }

  if (index === 5) {
    return `上${polarityNumber}`;
  }

  return `${polarityNumber}${middleLinePositions[index]}`;
}

export function getHexagramMotionLabel(lines: readonly { isChanging: boolean }[]) {
  return lines.some((line) => line.isChanging) ? "[动卦]" : "[静卦]";
}

export function isStaticHexagram(lines: readonly { isChanging: boolean }[]) {
  return !lines.some((line) => line.isChanging);
}

export function getMovingLineNames(lines: readonly LineRecord[]) {
  return lines
    .map((line, index) => (line.isChanging ? getTraditionalLineName(index, line.total) : ""))
    .filter(Boolean);
}

export function getHexagramStateLabel(lines: readonly LineRecord[], baseHexagramName = "") {
  const movingCount = lines.filter((line) => line.isChanging).length;

  if (movingCount === 0) {
    return "静卦";
  }

  if (movingCount === 6) {
    if (baseHexagramName.includes("乾")) {
      return "六爻皆动 · 用九";
    }

    if (baseHexagramName.includes("坤")) {
      return "六爻皆动 · 用六";
    }

    return "六爻皆动";
  }

  return "变卦";
}

export function getGuaCiText(hexagramName: string, theme?: string) {
  return `${hexagramName}卦辞用于经典文本学习${theme ? `，可结合“${theme}”作传统象义参照` : ""}。`;
}

export function getTuanText() {
  return "";
}

export function getCoreImageText(imageText?: string) {
  return imageText ?? "";
}

export function getLineReadingNote(line: LineRecord) {
  return buildLineSpecificNote({
    baseHexagramName: "本卦",
    changedHexagramName: line.isChanging ? "之卦" : "本卦",
    index: line.round - 1,
    line,
  });
}

type LineSpecificNoteParams = {
  baseHexagramName: string;
  changedHexagramName?: string;
  index: number;
  line: LineRecord;
  lineText?: string;
};

export function buildLineSpecificNote({
  index,
  line,
  lineText,
}: LineSpecificNoteParams) {
  const lineName = getTraditionalLineName(index, line.total);
  const positionNote = linePositionNotes[index] ?? "此爻用于观察当前问题中的具体位置";
  const original = lineText ? `经典原文“${lineText}”` : "经典原文暂缺";
  const state = line.isChanging ? "此爻在本次六爻中为变化爻" : "此爻在本次六爻中保持不变";

  return `${lineName}：${original}。${positionNote}。${state}。`;
}

export function buildMovingLinesOverview({
  baseHexagramName,
  changedHexagramName,
  movingLineDetails,
}: {
  baseHexagramName: string;
  changedHexagramName: string;
  movingLineDetails: { lineName: string; text?: string }[];
}) {
  const count = movingLineDetails.length;
  const details = movingLineDetails
    .map(({ lineName }) => lineName)
    .join("；");

  if (count === 1) {
    return `${baseHexagramName}本次以${details}为动爻。先读这一爻在本卦中的位置、原文与白话，再把${changedHexagramName}作为动爻转换后的结构对照；它不是对现实结果的预告。`;
  }

  if (count === 2) {
    return `${baseHexagramName}本次有两爻动：${details}。分别阅读两条爻辞所处的位置，不把它们自动译成“两件事”或某种确定走向；随后再与${changedHexagramName}对照。`;
  }

  if (count === 3) {
    return `${baseHexagramName}本次有三爻动：${details}。三处爻位都需逐条读，不以动爻数量直接推断“变化更大”；${changedHexagramName}只提供转换后的另一组经典文本。`;
  }

  if (count === 4) {
    return `${baseHexagramName}本次有四爻动：${details}。本卦仍是起点，逐条核对动爻后，再用${changedHexagramName}检查转换后的卦象结构；不要跳过本卦直接下结论。`;
  }

  if (count === 5) {
    return `${baseHexagramName}本次有五爻动：${details}。可把${changedHexagramName}的卦辞与象曰纳入对照，但仍须回看本卦唯一不变的一爻，避免把之卦当作现实的必然终局。`;
  }

  return `${baseHexagramName}本次六爻皆动，六条爻辞都需要逐条阅读。${baseHexagramName}是起点文本，${changedHexagramName}是转换后的文本参照；若本卦为乾或坤，再一并参考用九、用六。`;
}

export function buildChangedHexagramNote({
  changedHexagramName,
  changedNumber,
  changedJudgment,
  changedImageText,
}: {
  changedHexagramName: string;
  changedNumber?: number;
  changedJudgment?: string;
  changedImageText?: string;
}) {
  const numberText = changedNumber ? `第${changedNumber}卦` : "对应之卦";
  const parts = [`${changedHexagramName}${numberText}`];

  if (changedJudgment) {
    parts.push(`卦辞“${changedJudgment}”`);
  }

  if (changedImageText) {
    parts.push(`象曰“${changedImageText}”`);
  }

  return `${parts.join("；")}。之卦用于对照动爻翻转后的卦象与文本，不等于“接下来一定发生什么”。`;
}

export function buildBaseToChangedNote({
  baseHexagramName,
  changedHexagramName,
  baseJudgment,
  changedJudgment,
  movingSummary,
}: {
  baseHexagramName: string;
  changedHexagramName: string;
  baseJudgment?: string;
  changedJudgment?: string;
  movingSummary: string;
}) {
  const baseText = baseJudgment ? `${baseHexagramName}的卦辞` : `${baseHexagramName}的卦辞暂缺`;
  const changedText = changedJudgment ? `${changedHexagramName}的卦辞` : `${changedHexagramName}的卦辞暂缺`;

  return `把${baseHexagramName}与${changedHexagramName}并读时，先看${movingSummary}涉及哪些爻位，再回到这些爻在本卦中的原文和位置；最后对照${changedText}与卦象。${baseText}是起点，不把“本卦变为之卦”翻译成单一的现实结果。`;
}

export function buildStaticOverallNote({
  baseHexagramName,
  judgment,
  imageText,
}: {
  baseHexagramName: string;
  judgment?: string;
  imageText?: string;
}) {
  return `${baseHexagramName}本次无动爻。卦辞为“${judgment ?? "经典卦辞暂缺"}”，象曰为“${imageText ?? "象传原文暂缺"}”。`;
}

export function buildSituationObservation({
  baseHexagramName,
  upperNature,
  lowerNature,
  imageText,
}: {
  baseHexagramName: string;
  upperNature: string;
  lowerNature: string;
  imageText?: string;
}) {
  return `按《易经》象义整理，${baseHexagramName}由上象${upperNature}、下象${lowerNature}构成。${imageText ? `象曰“${imageText}”。` : ""}阅读时可先核对卦名、卦辞与象曰，再把上下象作为经典文本中的结构线索。`;
}

export function buildRiskPrompt({
  movingCount,
  movingLineDetails,
  judgment,
}: {
  movingCount: number;
  movingLineDetails: { lineName: string; text?: string }[];
  judgment?: string;
}) {
  if (movingCount === 0) {
    return `本卦无动爻，审慎点不在某一处突变，而在误读整体卦辞“${judgment ?? "本卦卦辞"}”后急于下结论。本段只是经典文本阅读提醒。`;
  }

  const details = movingLineDetails.map(({ lineName, text }) => `${lineName}${text ? `“${text}”` : ""}`).join("、");
  return `本次涉及${details}。审慎点在于先回到这些爻辞的原文语境，再对照之卦文本；不要把某一句局部象义直接当作现实判断。`;
}

export function buildReflectionPrompt({
  baseHexagramName,
  imageText,
  movingCount,
}: {
  baseHexagramName: string;
  imageText?: string;
  movingCount: number;
}) {
  const motionQuestion =
    movingCount === 0
      ? "我是否把卦辞、象曰与上下卦关系分开看过，而不是只抓一句话下判断？"
      : "这些爻辞里反复出现的名物、动作或限制词，分别对应我问题里的哪些真实材料？";

  return `读${baseHexagramName}时，可以先问：${imageText ? `象曰“${imageText}”描绘的画面，在我的问题里最像哪一处事实？` : "上下卦关系对应我问题中的哪两股力量？"} ${motionQuestion} 这些问题仅用于整理思路。`;
}
