import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { LineRecord } from "../types.ts";
import {
  buildChangedHexagramNote,
  buildLineSpecificNote,
  buildMovingLinesOverview,
  buildStaticOverallNote,
} from "./resultPresentation.ts";

const makeLine = (round: number, total: 6 | 7 | 8 | 9, isChanging: boolean): LineRecord => ({
  round,
  coins: [],
  total,
  kind: total === 6 ? "old-yin" : total === 7 ? "young-yang" : total === 8 ? "young-yin" : "old-yang",
  isChanging,
});

const lvNineFour = buildLineSpecificNote({
  baseHexagramName: "天泽履",
  changedHexagramName: "风泽中孚",
  index: 3,
  line: makeLine(4, 9, true),
  lineText: "履虎尾，愬愬终吉。",
});

const lvNineTwo = buildLineSpecificNote({
  baseHexagramName: "天泽履",
  changedHexagramName: "天雷无妄",
  index: 1,
  line: makeLine(2, 9, true),
  lineText: "履道坦坦，幽人贞吉。",
});

assert.match(lvNineFour, /履虎尾，愬愬终吉。/, "动爻说明必须保留对应爻辞原文");
assert.match(lvNineFour, /九四|上卦之初|外部/, "九四说明必须体现具体爻位语境");
assert.notEqual(lvNineFour, lvNineTwo, "不同动爻不能生成同一段说明");

const overview = buildMovingLinesOverview({
  baseHexagramName: "天泽履",
  changedHexagramName: "风泽中孚",
  movingLineDetails: [
    { lineName: "九四", text: "履虎尾，愬愬终吉。" },
  ],
});
assert.match(overview, /天泽履/);
assert.match(overview, /风泽中孚/);
assert.match(overview, /九四/);
assert.doesNotMatch(overview, /履虎尾/, "动爻总览不应重复动爻卡已经展示的原文");
assert.match(overview, /不是对现实结果的预告/);

const changedNote = buildChangedHexagramNote({
  changedHexagramName: "风泽中孚",
  changedNumber: 61,
  changedJudgment: "豚鱼吉，利涉大川，利贞。",
  changedImageText: "泽上有风，中孚；君子以议狱缓死。",
});
assert.match(changedNote, /第61卦/);
assert.match(changedNote, /豚鱼吉/);
assert.match(changedNote, /泽上有风/);

const staticNote = buildStaticOverallNote({
  baseHexagramName: "山天大畜",
  judgment: "利贞，不家食吉，利涉大川。",
  imageText: "天在山中，大畜；君子以多识前言往行，以畜其德。",
});
assert.match(staticNote, /山天大畜/);
assert.match(staticNote, /利贞/);
assert.match(staticNote, /天在山中/);

const resultSource =
  readFileSync(new URL("./ResultPage.tsx", import.meta.url), "utf8") +
  readFileSync(new URL("./resultPresentation.ts", import.meta.url), "utf8");
for (const forbidden of [
  /推动力已经.{0,10}显现/,
  /问题结构中正在.{0,10}变化/,
  /之卦不作为.{0,8}结论/,
  /发生变化的位置.{0,12}行动分寸/,
  /作为本次.{0,8}阅读入口/,
  /变化之后的.{0,8}整体气象/,
]) {
  assert.doesNotMatch(resultSource, forbidden, `结果页不能保留模板话术：${forbidden}`);
}

console.log("Result content quality checks passed.");
