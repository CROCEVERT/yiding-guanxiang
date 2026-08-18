/// <reference types="node" />

import { readFileSync } from "node:fs";
import { join } from "node:path";

const assert = (condition: boolean, message: string) => {
  console.assert(condition, message);
  if (!condition) {
    throw new Error(message);
  }
};

const root = process.cwd();
const resultPage = readFileSync(join(root, "src/pages/ResultPage.tsx"), "utf8");
const presentation = readFileSync(join(root, "src/pages/resultPresentation.ts"), "utf8");

for (const expected of [
  "本卦背景",
  "查看卦辞与象曰",
  "经文与现代说明",
  "直译",
  "用今天的话说",
  "词语对照",
  "仅作经文含义参照，不作为现实结论，慎断是非。",
  "仅作现代阅读参照，不代表现实结果，慎断是非。",
  "阅读提醒：本页内容仅供传统文化学习与问题整理参考",
  "《易经》经典原文用语",
  "不代表现实结果判断",
]) {
  assert(resultPage.includes(expected), `结果页缺少合规文案：${expected}`);
}

for (const removed of ['title="风险提示"', 'title="动爻释义"', 'title="本卦到之卦"', "卦辞看判断语气", "前者看当前处境"]) {
  assert(!resultPage.includes(removed) && !presentation.includes(removed), `不应再出现旧表达：${removed}`);
}

assert(!resultPage.includes("处境较为顺遂"), "吉不应解释成现实顺遂");
assert(!resultPage.includes("此处存在明显风险，需要谨慎"), "凶不应解释成现实风险判断");
assert(!resultPage.includes("你可以先想"), "动卦页不应重复展示行动提示");
assert(!resultPage.includes("你现在先怎么做"), "结果页不应展示行动建议");
assert(!resultPage.includes("readingFocus") && !resultPage.includes("situation"), "结果页不应读取行动建议字段");
assert(resultPage.includes("不作为现实结论，慎断是非。"), "直译后的现实边界必须以灰色同句标注“慎断是非”");
assert(resultPage.includes("不代表现实结果，慎断是非。"), "现代说明后的现实边界必须以灰色同句标注“慎断是非”");
assert(!resultPage.includes("大白话："), "释义标签应明确说明其为经文意思，而非泛化口语化承诺");
assert(!resultPage.includes('<details className="interpretation-source">\n      <summary>经文与现代说明</summary>'), "固定来源说明不应伪装成可折叠控件");
assert(resultPage.includes('className="interpretation-source interpretation-source-static"'), "固定来源说明必须始终展示");

console.info("结果页合规来源标注验证通过");
