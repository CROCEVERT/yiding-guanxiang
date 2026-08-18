import {
  buildInsightResult,
  buildReferenceSummary,
  generateRound,
  getBaseLines,
  getChangedLines,
  getHexagramName,
  getHexagramResult,
  getLineInfo,
  getMovingLines,
  getTrigrams,
} from "./insight.ts";
import type { LineRecord } from "../types.ts";

const assert = (condition: boolean, message: string) => {
  console.assert(condition, message);
  if (!condition) {
    throw new Error(message);
  }
};

const lineChecks = [
  { sum: 6, kind: "old-yin", baseLine: "yin", changedLine: "yang", isChanging: true },
  { sum: 7, kind: "young-yang", baseLine: "yang", changedLine: "yang", isChanging: false },
  { sum: 8, kind: "young-yin", baseLine: "yin", changedLine: "yin", isChanging: false },
  { sum: 9, kind: "old-yang", baseLine: "yang", changedLine: "yin", isChanging: true },
] as const;

lineChecks.forEach((check) => {
  const line = getLineInfo(check.sum);
  assert(line.kind === check.kind, `${check.sum} 本次符号判断正确`);
  assert(line.baseLine === check.baseLine, `${check.sum} 当前卦象爻形正确`);
  assert(line.changedLine === check.changedLine, `${check.sum} 变化后爻形正确`);
  assert(line.isChanging === check.isChanging, `${check.sum} 变化爻判断正确`);
});

const sums = [6, 7, 8, 9, 7, 6];
assert(getBaseLines(sums).join(",") === "yin,yang,yin,yang,yang,yin", "当前卦象按 index 0 到 5 保存");
assert(getChangedLines(sums).join(",") === "yang,yang,yin,yin,yang,yang", "趋势参照按变化爻生成");
assert(getMovingLines(sums).join(",") === "1,4,6", "变化爻返回第 1、4、6 爻");

const sixRounds = Array.from({ length: 6 }, (_, index) => generateRound(index + 1));
assert(sixRounds[0].round === 1, "第一次显示在最下方");
assert(sixRounds[5].round === 6, "第六次显示在最上方");

const pureYang = ["yang", "yang", "yang", "yang", "yang", "yang"] as const;
const pureYin = ["yin", "yin", "yin", "yin", "yin", "yin"] as const;
assert(getTrigrams(pureYang).lowerTrigram.name === "乾", "下卦取第 1、2、3 爻");
assert(getTrigrams(pureYang).upperTrigram.name === "乾", "上卦取第 4、5、6 爻");
assert(getHexagramName(pureYang) === "乾为天", "六阳爻映射为乾为天");
assert(getHexagramName(pureYin) === "坤为地", "六阴爻映射为坤为地");

const staticRounds = [7, 7, 7, 7, 7, 7] as const;
const staticResult = getHexagramResult(staticRounds);
assert(staticResult.baseHexagramName === "乾为天", "静卦本卦映射正确");
assert(staticResult.changedHexagramName === "乾为天", "静卦不应生成不同之卦");
assert(staticResult.movingLines.length === 0, "静卦不应有动爻");
assert(buildReferenceSummary(staticResult) === "本次参照：乾为天（无动爻）。", "静卦记录摘要应明确无动爻");

const singleMovingRounds = [9, 7, 7, 8, 8, 8] as const;
const singleMovingResult = getHexagramResult(singleMovingRounds);
assert(singleMovingResult.movingLines.join(",") === "1", "单动爻应只标记一条动爻");
assert(singleMovingResult.baseHexagramName !== singleMovingResult.changedHexagramName, "单动爻应生成变化后的对照卦");
assert(buildReferenceSummary(singleMovingResult).includes("初爻"), "单动爻摘要应保留动爻位置");

const mappingRounds = [
  { total: 9, round: 1, kind: "old-yang", isChanging: true },
  { total: 7, round: 2, kind: "young-yang", isChanging: false },
  { total: 7, round: 3, kind: "young-yang", isChanging: false },
  { total: 8, round: 4, kind: "young-yin", isChanging: false },
  { total: 8, round: 5, kind: "young-yin", isChanging: false },
  { total: 6, round: 6, kind: "old-yin", isChanging: true },
] as const;
const mappedResult = getHexagramResult(mappingRounds);
assert(mappedResult.baseHexagramName === "地天泰", "本卦由 baseLines 计算");
assert(mappedResult.changedHexagramName === "山风蛊", "变化参照由 changedLines 计算");
assert(mappedResult.movingLines.join(",") === "1,6", "变化爻保留数组序号");
assert(mappedResult.baseHexagramName !== mappedResult.changedHexagramName, "多动爻应生成变化后的对照卦");
assert(mappedResult.lowerTrigram.name === "乾", "下象来自第 1、2、3 爻");
assert(mappedResult.upperTrigram.name === "坤", "上象来自第 4、5、6 爻");
assert(buildReferenceSummary(mappedResult) === "本次参照：地天泰；动爻：初爻、上爻；之卦：山风蛊。", "记录摘要只陈述实际本卦、动爻与之卦");

const verifiedRecords = mappingRounds.map((line) => ({ ...line, coins: [] })) as LineRecord[];
const unifiedResult = buildInsightResult(verifiedRecords);
assert(!("primary" in unifiedResult) && !("changed" in unifiedResult), "新结果不再写入旧版六个伪卦字段");
assert(unifiedResult.hexagramResult.baseHexagramName === "地天泰", "新结果只以六爻映射为卦象真源");
console.info("六爻生成 console 验证通过");
