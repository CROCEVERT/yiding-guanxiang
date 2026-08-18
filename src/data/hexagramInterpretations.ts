import { classicTextEditorialPolicy, getClassicHexagramText } from "./classicTexts.ts";
import { getHexagramClassic, hexagramClassics } from "./hexagramClassics.ts";
import { reviewedCopyByName } from "./reviewedCopies.public.ts";

export type LineInterpretation = {
  label: string;
  original: string;
  directTranslation: string;
  modernReading: string;
  termNotes: string;
  sourceNote: string;
  reviewStatus: "reviewed";
};

export type HexagramInterpretation = {
  name: string;
  number: number;
  reviewStatus: "reviewed";
  guaCi: string;
  xiangYue: string;
  directTranslation: string;
  modernReading: string;
  termNotes: string;
  overview: string;
  lines: Record<string, LineInterpretation>;
};

const sourceNote = `经文：按${classicTextEditorialPolicy.sourceTitle}${classicTextEditorialPolicy.sourceEdition}整理，并持续记录异文与复核。现代说明为本项目的当代阅读转译，不是经文原话或唯一解释；仅供文化学习与问题参照，属于传统文化学习用途，不构成现实结论或专业意见。`;

const transitionNotes = new Map<string, string>([
  [
    "泽水困->风泽中孚",
    "从泽水困到风泽中孚，象义从“受限中守志”转到“恢复可信沟通”。前者呈现受困处境，后者呈现事实、承诺和边界重新建立后的信任结构。",
  ],
  [
    "天泽履->风泽中孚",
    "从天泽履到风泽中孚，重点从谨慎行走转向内外一致。先守边界，再谈信任；如果礼序不清，后面的承诺也容易失真。",
  ],
  [
    "泽水困->山天大畜",
    "从泽水困到山天大畜，重点从困境消耗转向蓄养力量。暂时受阻未必只代表停顿，也可能提示先修资源、能力和承接结构。",
  ],
]);

function buildReviewedInterpretation(name: string): HexagramInterpretation | undefined {
  const classic = getHexagramClassic(name);
  const copy = classic ? reviewedCopyByName[classic.name] : undefined;
  const classicText = classic ? getClassicHexagramText(classic.number) : undefined;

  if (!copy || !classic || !classicText || classicText.lineTexts.some(({ label }) => !copy.lines[label])) {
    return undefined;
  }

  return {
    name: classic.name,
    number: classic.number,
    reviewStatus: "reviewed",
    guaCi: classicText.judgment,
    xiangYue: classic.imageText,
    directTranslation: copy.directTranslation,
    modernReading: copy.modernReading,
    termNotes: copy.termNotes,
    overview: copy.overview,
    lines: Object.fromEntries(
      classicText.lineTexts.map((classicLine) => {
        const lineCopy = copy.lines[classicLine.label];
        return [
          classicLine.label,
          {
            label: classicLine.label,
            original: classicLine.text,
            directTranslation: lineCopy.directTranslation,
            modernReading: lineCopy.modernReading,
            termNotes: lineCopy.termNotes,
            sourceNote,
            reviewStatus: "reviewed" as const,
          },
        ];
      }),
    ),
  };
}

export function getHexagramInterpretation(name: string | undefined) {
  return name ? buildReviewedInterpretation(name) : undefined;
}

export function getLineInterpretation(hexagramName: string | undefined, label: string | undefined) {
  const interpretation = getHexagramInterpretation(hexagramName);
  return label ? interpretation?.lines[label] : undefined;
}

export function getTransitionInterpretation(baseHexagramName: string | undefined, changedHexagramName: string | undefined) {
  if (!baseHexagramName || !changedHexagramName) {
    return undefined;
  }

  const manual = transitionNotes.get(`${baseHexagramName}->${changedHexagramName}`);
  if (manual) {
    return manual;
  }

  const base = getHexagramInterpretation(baseHexagramName);
  const changed = getHexagramInterpretation(changedHexagramName);
  if (!base || !changed) {
    return undefined;
  }

  return `${base.name}至${changed.name}：先读本卦卦辞“${base.guaCi}”、象曰“${base.xiangYue}”，再读之卦卦辞“${changed.guaCi}”、象曰“${changed.xiangYue}”。`;
}

export function getAllHexagramInterpretations() {
  return hexagramClassics
    .map((classic) => buildReviewedInterpretation(classic.name))
    .filter((item): item is HexagramInterpretation => Boolean(item));
}
