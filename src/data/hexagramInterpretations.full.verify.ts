import assert from "node:assert/strict";
import { classicHexagramTexts } from "./classicTexts.ts";
import { hexagramClassics } from "./hexagramClassics.ts";
import {
  getAllHexagramInterpretations,
  getHexagramInterpretation,
  getLineInterpretation,
  getTransitionInterpretation,
} from "./hexagramInterpretations.ts";

const forbiddenTemplates = [
  /可理解为.{0,8}位置/,
  /关系.{0,4}行动分寸/,
  /整体气象.{0,4}行动边界/,
  /当前阅读入口/,
  /推动力.{0,4}显现/,
  /本爻.{0,12}阅读重心/,
  /说明.{0,8}爻辞原义/,
  /处境入口.{0,18}转向/,
];

const allInterpretations = getAllHexagramInterpretations();
assert.equal(allInterpretations.length, 64, "必须覆盖 64 卦内容");

for (const classic of hexagramClassics) {
  const interpretation = getHexagramInterpretation(classic.name);
  assert.ok(interpretation, `${classic.name} 必须有卦系内容`);
  assert.equal(interpretation.reviewStatus, "reviewed", `${classic.name} 必须是已审核稿`);
  assert.equal(interpretation.number, classic.number, `${classic.name} 卦序必须正确`);
  assert.ok(interpretation.guaCi.length > 0, `${classic.name} 必须有卦辞`);
  assert.ok(interpretation.xiangYue.includes(classic.imageText), `${classic.name} 必须呈现象曰原文`);
  assert.ok(interpretation.directTranslation.length >= 4, `${classic.name} 卦辞直译不能过短`);
  assert.ok(interpretation.modernReading.length >= 18, `${classic.name} 卦辞现代说明不能过短`);
  assert.ok(interpretation.termNotes.length >= 6, `${classic.name} 卦辞词语对照不能过短`);
  assert.ok(interpretation.overview.length >= 18, `${classic.name} 六爻总说明不能过短`);
}

let lineCount = 0;
for (const classic of classicHexagramTexts) {
  for (const line of classic.lineTexts) {
    lineCount += 1;
    const lineInterpretation = getLineInterpretation(classic.name, line.label);
    assert.ok(lineInterpretation, `${classic.name} ${line.label} 必须有爻辞内容`);
    assert.equal(lineInterpretation.original, line.text, `${classic.name} ${line.label} 原文必须准确`);
    assert.ok(lineInterpretation.directTranslation.length >= 4, `${classic.name} ${line.label} 直译不能过短`);
    assert.ok(lineInterpretation.modernReading.length >= 8, `${classic.name} ${line.label} 现代说明不能过短`);
    assert.ok(lineInterpretation.termNotes.length >= 4, `${classic.name} ${line.label} 词语对照不能过短`);
    assert.match(lineInterpretation.sourceNote, /传统文化学习/, `${classic.name} ${line.label} 必须有学习用途说明`);
  }
}
assert.equal(lineCount, 384, "必须覆盖 384 条爻辞");

const textBlob = allInterpretations
  .flatMap((item) => [
    item.directTranslation,
    item.modernReading,
    item.termNotes,
    item.overview,
    ...Object.values(item.lines).flatMap((line) => [line.directTranslation, line.modernReading, line.termNotes]),
  ])
  .join("\n");

for (const pattern of forbiddenTemplates) {
  assert.doesNotMatch(textBlob, pattern, `内容库不能出现万能模板句：${pattern}`);
}

const qianFirst = getLineInterpretation("乾为天", "初九");
assert.ok(qianFirst);
assert.match(qianFirst.original, /潜龙勿用/);
assert.match(qianFirst.modernReading, /能力|准备|情况/);

const kunSixFive = getLineInterpretation("坤为地", "六五");
assert.ok(kunSixFive);
assert.match(kunSixFive.original, /黄裳/);
assert.ok(kunSixFive.modernReading.length > 12);

const generatedTransition = getTransitionInterpretation("泽水困", "山天大畜");
assert.ok(generatedTransition);
assert.match(generatedTransition, /泽水困|山天大畜|卦辞|象曰/);

console.log("Full hexagram interpretation checks passed.");
