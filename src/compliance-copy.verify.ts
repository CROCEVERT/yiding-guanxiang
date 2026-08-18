/// <reference types="node" />

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const assert = (condition: boolean, message: string) => {
  console.assert(condition, message);
  if (!condition) {
    throw new Error(message);
  }
};

const root = process.cwd();
const sourceRoot = join(root, "src");
const forbiddenWords = [
  ["卜", "卦"],
  ["算", "命"],
  ["预", "测"],
  ["运", "势"],
  ["转", "运"],
  ["灵", "验"],
  ["大", "师"],
  ["天", "机"],
  ["必", "成"],
  ["必", "败"],
].map((parts) => parts.join(""));

const readSourceFiles = (directory: string): string[] =>
  readdirSync(directory).flatMap((name: string) => {
    const fullPath = join(directory, name);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      return readSourceFiles(fullPath);
    }

    return /\.(tsx?|css)$/.test(name) &&
      !name.includes(".verify.") &&
      !name.includes("classicTexts") &&
      !name.includes("hexagramClassics")
      ? [fullPath]
      : [];
  });

const sourceText = readSourceFiles(sourceRoot)
  .map((file) => readFileSync(file, "utf8"))
  .join("\n");

assert(sourceText.includes("易定观象"), "产品名应更新为易定观象");
assert(sourceText.includes("以象明理 · 以问自省"), "首页副标题应体现传统文化参照定位");
assert(sourceText.includes("仅作传统文化学习与问题参照"), "首页副文案应体现文化学习与问题参照定位");
assert(sourceText.includes("开始互动"), "主按钮应更新为开始互动");
assert(sourceText.includes("观象参照"), "结果与揭示页应弱化为观象参照");
assert(sourceText.includes("经典原文"), "经典文本应明确标注为经典原文");
assert(sourceText.includes("《易经》经典原文用语"), "经典原文中的吉凶等字应明确标注为经典用语");
assert(sourceText.includes("不代表现实结果判断"), "经典原文中的吉凶等字不应被解释为现实结果判断");
assert(sourceText.includes("传统象义") && sourceText.includes("审慎判断"), "文化参照应提醒用户回到现实中审慎判断");
assert(sourceText.includes("进退尺度"), "结果页应展示更克制的行动参照表达");
assert(sourceText.includes("复盘问题"), "结果页应展示复盘问题");
assert(
  sourceText.includes("本内容仅作传统文化学习与问题参照，不构成现实结论，也不替代法律、医疗、投资、心理咨询等专业意见。"),
  "免责声明应更新",
);
const removedPositioningPhrase = ["决策", "复盘"].join("");
assert(!sourceText.includes(removedPositioningPhrase), "源码中不应再出现已移除的旧定位词组");

for (const word of forbiddenWords) {
  assert(!sourceText.includes(word), `源码中不应出现高风险词：${word}`);
}

console.info("观象合规文案验证通过");
