import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const epubPath = process.argv[2];
const classicTextPath = new URL("../src/data/classicTexts.ts", import.meta.url);
const outputPath = new URL("../research/sources/周易经文-本地对照差异初筛.md", import.meta.url);

if (!epubPath) {
  throw new Error("请提供本地 EPUB 路径：node scripts/audit-classic-vs-epub.mjs /path/to/zhouyi.epub");
}

const characterNormalization = new Map([
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
  // 以下是项目显示参照已经选定的字形；只用于把本地 EPUB 的
  // 同类字形差异从“实质待核”中剔除，不代表这些字在所有传本中唯一正确。
  ["它", "他"],
  ["祐", "佑"],
  ["祇", "祗"],
  ["豮", "豶"],
  ["牗", "牖"],
  ["寘", "置"],
  ["遁", "遯"],
  ["赍", "齎"],
]);

function extractJsonArray(source, declaration, endMarker) {
  const start = source.indexOf(declaration);
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error("无法解析程序经典层。");
  return JSON.parse(source.slice(start + declaration.length, end).trim().replace(/;$/, ""));
}

function stripHtml(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&hellip;/g, "…")
    .trim();
}

function normalize(value) {
  return [...value]
    .map((character) => characterNormalization.get(character) ?? character)
    .join("")
    .replace(/[，。、；：！？!?…“”‘’（）\[\]【】\s]/g, "");
}

async function readEpubChapter(chapterNumber) {
  const entry = `index_split_${String(chapterNumber + 5).padStart(3, "0")}.html`;
  const { stdout } = await execFileAsync("unzip", ["-p", epubPath, entry], { maxBuffer: 1024 * 1024 });
  const paragraphs = [...stdout.matchAll(/<p[^>]*class="calibre_13"[^>]*>([\s\S]*?)<\/p>/g)].map((match) => stripHtml(match[1]));
  const result = new Map();

  for (const paragraph of paragraphs) {
    const matched = paragraph.match(/^(乾|坤|屯|蒙|需|讼|师|比|小畜|履|泰|否|同人|大有|谦|豫|随|蛊|临|观|噬嗑|贲|剥|复|无妄|大畜|颐|大过|坎|离|咸|恒|遁|大壮|晋|明夷|家人|睽|蹇|解|损|益|夬|姤|萃|升|困|井|革|鼎|震|艮|渐|归妹|丰|旅|巽|兑|涣|节|中孚|小过|既济|未济|初九|初六|九二|六二|九三|六三|九四|六四|九五|六五|上九|上六|用九|用六)：(.+)$/);
    if (matched) result.set(matched[1], matched[2]);
  }

  return result;
}

const programSource = await readFile(classicTextPath, "utf8");
const hexagrams = extractJsonArray(
  programSource,
  "export const classicHexagramTexts: ClassicHexagramText[] = ",
  "\n\nconst classicTextByNumber",
);
const sourceNames = [
  "乾", "坤", "屯", "蒙", "需", "讼", "师", "比", "小畜", "履", "泰", "否", "同人", "大有", "谦", "豫", "随", "蛊", "临", "观", "噬嗑", "贲", "剥", "复", "无妄", "大畜", "颐", "大过", "坎", "离", "咸", "恒", "遁", "大壮", "晋", "明夷", "家人", "睽", "蹇", "解", "损", "益", "夬", "姤", "萃", "升", "困", "井", "革", "鼎", "震", "艮", "渐", "归妹", "丰", "旅", "巽", "兑", "涣", "节", "中孚", "小过", "既济", "未济",
];

const rows = [];
for (const item of hexagrams) {
  const epub = await readEpubChapter(item.number);
  const entries = [{ label: "卦辞", current: item.judgment, reference: epub.get(sourceNames[item.number - 1]) }].concat(
    item.lineTexts.map((line) => ({ label: line.label, current: line.text, reference: epub.get(line.label) })),
  );

  for (const entry of entries) {
    const status = !entry.reference ? "未提取" : normalize(entry.current) === normalize(entry.reference) ? "一致（规范化后）" : "差异待核";
    rows.push({ hexagram: item, ...entry, status });
  }
}

const differences = rows.filter((row) => row.status !== "一致（规范化后）");
const body = differences
  .map(
    (row) =>
      `| 第${String(row.hexagram.number).padStart(2, "0")}卦 ${row.hexagram.name} | ${row.label} | \`${row.current}\` | \`${row.reference ?? "〔未提取〕"}\` | ${row.status} |`,
  )
  .join("\n");

const report = `---
type: source-comparison-screening
title: 周易经文本地对照差异初筛
status: screening-only
generated_at: 2026-08-11
---

# 周易经文｜本地对照差异初筛

## 作用与边界

本报告把程序当前的卦辞与384爻辞，同用户提供的 EPUB 内的经典层逐项比较，用于**发现疑点**。该 EPUB 的发行与授权链不适合作为正式公开底本，因此“差异待核”绝不等于自动改字；任何改动仍须回到公开参照或影印资源核实。

## 初筛结果

- 比较条目：${rows.length}（64卦辞＋384爻辞）
- 规范化后暂时一致：${rows.length - differences.length}
- 需进一步核对：${differences.length}
- 规范化仅忽略已列明的繁简、项目已选定字形与标点差异，不吞掉实质文字差异。

## 需进一步核对的条目

| 卦 | 位置 | 程序当前 | EPUB 对照 | 状态 |
|---|---|---|---|---|
${body || "| — | — | — | — | 无 |"}

## 下一步

1. 对表中每项以公开文本或影印资源复核。
2. 确属乱码或误字的，写入《公开参照校勘记录》后再改程序。
3. 属于异文、通假、简繁或标点选择的，暂不改，等待项目底本与繁简规范确定。
`;

await writeFile(outputPath, report, "utf8");
console.log(`已写入 ${outputPath.pathname}；比较${rows.length}项，待核${differences.length}项。`);
