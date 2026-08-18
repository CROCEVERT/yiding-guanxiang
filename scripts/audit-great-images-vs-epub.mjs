import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const epubPath = process.argv[2];
const classicsPath = new URL("../src/data/hexagramClassics.ts", import.meta.url);
const outputPath = new URL("../research/sources/周易大象-本地对照差异初筛.md", import.meta.url);

if (!epubPath) {
  throw new Error("请提供本地 EPUB 路径：node scripts/audit-great-images-vs-epub.mjs /path/to/zhouyi.epub");
}

const normalization = new Map([
  ["於", "于"],
  ["牀", "床"],
  ["幾", "几"],
  ["說", "说"],
  ["脫", "脱"],
  ["無", "无"],
  ["爲", "为"],
  ["與", "与"],
  ["來", "来"],
  ["終", "终"],
  ["貞", "贞"],
]);

function stripHtml(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .trim();
}

function normalize(value) {
  return [...value]
    .map((character) => normalization.get(character) ?? character)
    .join("")
    .replace(/[，。、；：！？!?…“”‘’（）\[\]【】\s]/g, "");
}

async function getEpubGreatImage(hexagramNumber) {
  const entry = `index_split_${String(hexagramNumber + 5).padStart(3, "0")}.html`;
  const { stdout } = await execFileAsync("unzip", ["-p", epubPath, entry], { maxBuffer: 1024 * 1024 });
  // EPUB 在后半部将大象改排为 calibre_13；只筛 calibre_ 会漏掉它，
  // 随后错误抓到第一条小象。因此读取本章全部段落，再取首条《象》。
  const paragraphs = [...stdout.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((match) => stripHtml(match[1]));
  // 用户提供的 EPUB 在不同章节混用“《象》曰”和“《象》：”。
  // 只取每卦首次出现的象传，以避开后续六爻的小象。
  const image = paragraphs.find((paragraph) => /^《象》(曰)?[：:]/.test(paragraph));
  return image?.replace(/^《象》(曰)?[：:]/, "").trim();
}

const source = await readFile(classicsPath, "utf8");
const classics = [...source.matchAll(/\{ number: (\d+), name: "([^"]+)", imageText: "([^"]+)" \}/g)].map(([, number, name, imageText]) => ({
  number: Number(number),
  name,
  imageText,
}));

if (classics.length !== 64 || new Set(classics.map((item) => item.number)).size !== 64) {
  throw new Error("大象审计前检查失败：正式大象数据必须完整覆盖 64 卦。");
}

const rows = await Promise.all(
  classics.map(async (classic) => {
    const reference = await getEpubGreatImage(classic.number);
    return {
      ...classic,
      reference,
      status: !reference ? "未提取" : normalize(classic.imageText) === normalize(reference) ? "一致（规范化后）" : "差异待核",
    };
  }),
);

const differences = rows.filter((row) => row.status !== "一致（规范化后）");
const body = differences
  .map(
    (row) =>
      `| 第${String(row.number).padStart(2, "0")}卦 ${row.name} | \`${row.imageText}\` | \`${row.reference ?? "〔未提取〕"}\` | ${row.status} |`,
  )
  .join("\n");

const report = `---
type: source-comparison-screening
title: 周易大象本地对照差异初筛
status: screening-only
generated_at: 2026-08-11
---

# 周易大象｜本地对照差异初筛

## 作用与边界

本报告仅把程序正式大象数据（\`src/data/hexagramClassics.ts\`）与用户提供 EPUB 中每卦出现的首条“《象》曰”进行机械对照，用来发现漏字、误字或版本差异。该 EPUB 不是正式底本，**任何差异不得自动覆盖程序**。

## 初筛结果

- 比较条目：${rows.length}
- 规范化后暂时一致：${rows.length - differences.length}
- 需进一步核对：${differences.length}
- 程序正式大象数据：64 条，卦序无重复。

## 需进一步核对的条目

| 卦 | 程序当前 | EPUB 对照 | 状态 |
|---|---|---|---|
${body || "| — | — | — | 无 |"}

## 下一步

1. 对差异逐项回看公开文本或影印资源。
2. 明确乱码、漏字、错字才进入公开校勘记录并改程序。
3. 简繁、异体、句读和不同传本保留处置说明，不机械统一。
`;

await writeFile(outputPath, report, "utf8");
console.log(`已写入 ${outputPath.pathname}；比较${rows.length}项，待核${differences.length}项。`);
