import assert from "node:assert/strict";
import { classicHexagramTexts } from "./classicTexts.ts";
import {
  getAllHexagramInterpretations,
  getHexagramInterpretation,
  getLineInterpretation,
  getTransitionInterpretation,
} from "./hexagramInterpretations.ts";

const requiredNote = "仅供文化学习与问题参照";
const requiredBoundary = "不构成现实结论或专业意见";

const forbiddenTemplates = [
  /事情有通达展开的可能/,
  /适合面对较大的阻隔或重要行动/,
  /有利于顺势而行/,
  /需要守住原则与分寸/,
  /推动力已经.{0,10}显现/,
  /不至于给出单一结论/,
  /可理解为对当下位置、关系和行动分寸的提示/,
  /位置、关系和行动分寸/,
  /发生变化的位置/,
  /对应问题时/,
  /行动分寸/,
  /此处重点在于分清局势中的主动推动、阻滞因素与可协调之处/,
  /适合用来定位问题中最相似的一层处境/,
  /可理解为对当下/,
  /作为阅读入口/,
  /不作为现实结论/,
  /不作现实结论/,
  /不作现实定论/,
];

const all = getAllHexagramInterpretations();
assert.equal(all.length, 64, "should provide all 64 hexagram interpretations");

const rendered: string[] = [];
let lineCount = 0;

for (const classic of classicHexagramTexts) {
  const interpretation = getHexagramInterpretation(classic.name);
  assert.ok(interpretation, `${classic.name} should have interpretation`);
  assert.equal(Object.keys(interpretation.lines).length, 6, `${classic.name} should have six line interpretations`);
  assert.equal(interpretation.guaCi, classic.judgment, `${classic.name} guaCi should use classic text`);
  assert.ok(interpretation.xiangYue.length > 0, `${classic.name} xiangYue should provide classic image text`);
  assert.doesNotMatch(interpretation.xiangYue, /暂缺/, `${classic.name} xiangYue should not be placeholder text`);

  rendered.push(
    interpretation.directTranslation,
    interpretation.modernReading,
    interpretation.termNotes,
    interpretation.overview,
  );

  for (const row of classic.lineTexts) {
    lineCount += 1;
    const line = getLineInterpretation(classic.name, row.label);
    assert.ok(line, `${classic.name} ${row.label} should have interpretation`);
    assert.equal(line.original, row.text, `${classic.name} ${row.label} should preserve classic line text`);
    assert.ok(line.directTranslation.length > 0, `${classic.name} ${row.label} should have a direct translation`);
    assert.ok(line.modernReading.length > 0, `${classic.name} ${row.label} should have a modern reading`);
    assert.ok(line.termNotes.length > 0, `${classic.name} ${row.label} should have term notes`);
    assert.doesNotMatch(line.directTranslation, /^经典原文/, `${classic.name} ${row.label} should not repeat the separately rendered classic text`);
    assert.ok(line.sourceNote.includes(requiredNote), `${classic.name} ${row.label} source note missing learning boundary`);
    assert.ok(line.sourceNote.includes(requiredBoundary), `${classic.name} ${row.label} source note missing conclusion boundary`);
    rendered.push(line.directTranslation, line.modernReading, line.termNotes, line.sourceNote);
  }
}

assert.equal(lineCount, 384, "should verify 384 line interpretations");

const lin = getHexagramInterpretation("地泽临");
assert.ok(lin, "地泽临 should have a reviewed interpretation");
assert.equal(lin.reviewStatus, "reviewed");
assert.ok(lin.lines.六三.directTranslation.length > 12);
assert.ok(lin.lines.六五.modernReading.length > 12);
assert.match(lin.lines.初九.sourceNote, /现代说明/);

const guan = getHexagramInterpretation("风地观");
assert.ok(guan, "风地观 should have a reviewed interpretation");
assert.equal(guan.reviewStatus, "reviewed");
assert.ok(guan.lines.六二.directTranslation.length > 12);
assert.ok(guan.lines.九五.modernReading.length > 12);
assert.match(guan.lines.初六.sourceNote, /现代说明/);

const yi = getHexagramInterpretation("风雷益");
assert.ok(yi, "风雷益 should have a reviewed interpretation");
assert.equal(yi.reviewStatus, "reviewed");
assert.ok(yi.lines.六三.directTranslation.length > 12);
assert.ok(yi.lines.六三.modernReading.length > 12);

for (const interpretation of all) {
  assert.ok(!("situation" in interpretation) && !("risk" in interpretation), `${interpretation.name} 不应保留旧行动或误读字段`);
  for (const line of Object.values(interpretation.lines)) {
    assert.ok(!("readingFocus" in line) && !("plainMeaning" in line), `${interpretation.name} ${line.label} 不应保留旧字段`);
  }
}
assert.match(yi.lines.初九.sourceNote, /现代说明/);

const transition = getTransitionInterpretation("天火同人", "天泽履");
assert.doesNotMatch(transition ?? "", new RegExp(requiredNote), "transition note should not repeat the global learning boundary");
assert.doesNotMatch(transition ?? "", new RegExp(requiredBoundary), "transition note should not repeat the global conclusion boundary");
rendered.push(transition ?? "");

const blob = rendered.join("\n");
assert.doesNotMatch(blob, new RegExp([
  "\\u8bfe\\u7a0b\\u53c2\\u7167",
  "\\u7b2c\\d{3}\\u8bb2",
  "\\u4f60\\u73b0\\u5728\\u5148\\u600e\\u4e48\\u505a",
].join("|")), "公开运行时文案不应含受限栏目");
for (const pattern of forbiddenTemplates) {
  assert.doesNotMatch(blob, pattern);
}

console.log("Hexagram content engine checks passed.");
