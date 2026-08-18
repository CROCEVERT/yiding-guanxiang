import assert from "node:assert/strict";
import {
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
];

const kun = getHexagramInterpretation("泽水困");
assert.ok(kun, "样板库必须包含泽水困");
assert.equal(kun.number, 47);
assert.match(kun.modernReading, /困难|受限|困境|卡住/);
assert.ok(kun.termNotes.length > 12);

const kunFirst = getLineInterpretation("泽水困", "初六");
assert.ok(kunFirst, "泽水困必须包含初六爻辞内容");
assert.match(kunFirst.original, /臀困于株木/);
assert.ok(kunFirst.modernReading.length > 12);
assert.match(kunFirst.sourceNote, /传统文化学习/);

const kunFourth = getLineInterpretation("泽水困", "九四");
assert.ok(kunFourth, "泽水困必须包含九四爻辞内容");
assert.match(kunFourth.original, /来徐徐/);
assert.ok(kunFourth.modernReading.length > 12);
assert.notEqual(kunFirst.modernReading, kunFourth.modernReading, "不同爻位不能复用同一段现代说明");

const transition = getTransitionInterpretation("泽水困", "风泽中孚");
assert.ok(transition, "样板库必须包含泽水困到风泽中孚的变化说明");
assert.match(transition, /困|中孚|信|沟通|判断/);

const textBlob = [
  kun.directTranslation,
  kun.modernReading,
  kun.termNotes,
  kunFirst.directTranslation,
  kunFirst.modernReading,
  kunFirst.termNotes,
  kunFourth.directTranslation,
  kunFourth.modernReading,
  kunFourth.termNotes,
  transition,
].join("\n");

for (const pattern of forbiddenTemplates) {
  assert.doesNotMatch(textBlob, pattern, `内容库不能出现万能模板句：${pattern}`);
}

console.log("Hexagram interpretation sample checks passed.");
