import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const classicTextPath = new URL("../src/data/classicTexts.ts", import.meta.url);
const classicImagePath = new URL("../src/data/hexagramClassics.ts", import.meta.url);
const outputPath = new URL("../research/sources/周易经文-64卦384爻-校勘工作稿.md", import.meta.url);

function extractJsonArray(source, declaration, endMarker) {
  const start = source.indexOf(declaration);
  const end = source.indexOf(endMarker, start);

  if (start < 0 || end < 0) {
    throw new Error(`无法从源文件中定位 ${declaration}`);
  }

  const raw = source.slice(start + declaration.length, end).trim().replace(/;$/, "");
  return JSON.parse(raw);
}

function extractImageTexts(source) {
  return new Map(
    [...source.matchAll(/\{ number: (\d+), name: "([^"]+)", imageText: "([^"]+)" \}/g)].map(([, number, name, imageText]) => [
      Number(number),
      { name, imageText },
    ]),
  );
}

function renderHexagram(item, image) {
  const imageBlock = image ? `\n- **大象**：${image.imageText}` : "\n- **大象**：〔待补；不得据此文件擅自补写〕";
  const lineBlock = item.lineTexts.map(({ label, text }) => `- **${label}**：${text}`).join("\n");

  return `## 第${String(item.number).padStart(2, "0")}卦｜${item.name}\n\n- **卦辞**：${item.judgment}${imageBlock}\n\n### 爻辞\n\n${lineBlock}`;
}

const [classicSource, imageSource] = await Promise.all([readFile(classicTextPath, "utf8"), readFile(classicImagePath, "utf8")]);
const hexagrams = extractJsonArray(
  classicSource,
  "export const classicHexagramTexts: ClassicHexagramText[] = ",
  "\n\nconst classicTextByNumber",
);
const imageByNumber = extractImageTexts(imageSource);

if (hexagrams.length !== 64 || hexagrams.some((item) => item.lineTexts.length !== 6) || imageByNumber.size !== 64) {
  throw new Error("经文导出前检查失败：需要64卦、每卦6爻、64条大象。请先核对源数据。");
}

const lineCount = hexagrams.reduce((count, item) => count + item.lineTexts.length, 0);
const renderedHexagrams = hexagrams.map((item) => renderHexagram(item, imageByNumber.get(item.number))).join("\n\n---\n\n");

const output = `---
type: source-audit-draft
title: 周易经文（64卦、384爻与大象）校勘工作稿
status: source-indexed-not-fully-collated
generated_at: 2026-08-11
scope: 卦辞、384爻辞、大象
---

# 周易经文｜64卦、384爻与大象（校勘工作稿）

## 使用说明

这是一份便于逐条验收的 Markdown 工作稿：从程序当前的经典层机械导出，共 **64 卦、384 条爻辞、64 条大象**。它**不等于**从某一个公开网站下载并逐字复刻的“正式底本”，也不含彖传、小象、文言、系辞、说卦、序卦或杂卦。

当前显示参照为 [《周易正义》阮元校刻《十三经注疏》本](https://ctext.org/library.pl?collection=127&if=gb&remap=gb)。它用于统一项目的显示字形与异文处理，不代表本项目自行形成独立学术校勘本。现代白话、行动提示、课程笔记均不在本文件中。

## 校勘参照与规则

1. **显示参照**：[《周易正义》阮元校刻《十三经注疏》本](https://ctext.org/library.pl?collection=127&if=gb&remap=gb)。
2. **交叉复核**：[Chinese Text Project｜Book of Changes](https://ctext.org/book-of-changes/ens) 与可回看的公开影印／其他公开版本；网页转录可能含 OCR 自动匹配，不能单独作为终稿。
3. 处理异文时，记录“原文字串、候选字串、对应版本、影印页或稳定链接、决定理由、复核日期”；不凭语感静默改字。
4. 本文件的卦名采用程序显示名，可能与古籍标题的单字卦名不同；这不是异文。

## 本轮导出自检

- 卦数：${hexagrams.length}
- 爻辞数：${lineCount}
- 大象数：${imageByNumber.size}
- 程序源：\`src/data/classicTexts.ts\`、\`src/data/hexagramClassics.ts\`

---

${renderedHexagrams}

---

## 变更记录

- 2026-08-11：首次从程序经典层导出为 Markdown，并将《周易正义》阮元校刻《十三经注疏》本设为显示参照；异文仍保留逐条记录和交叉复核。
`;

await writeFile(outputPath, output, "utf8");
console.log(`已写入 ${fileURLToPath(outputPath)}（${hexagrams.length}卦／${lineCount}爻／${imageByNumber.size}大象）`);
