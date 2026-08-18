import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { classicHexagramTexts } from "../src/data/classicTexts.ts";
import { hexagramClassics } from "../src/data/hexagramClassics.ts";

const reviewDirectory = new URL("../research/reviews/", import.meta.url);
const outputPath = new URL("../src/data/reviewedCopies.public.ts", import.meta.url);
const hexagramNames = new Set(hexagramClassics.map(({ name }) => name));

function plain(markdown) {
  return markdown
    .replace(/^>\s*/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\n+/g, "；")
    .replace(/；+/g, "；")
    .trim()
    .replace(/；$/, "");
}

function assertPublicCopy(text, description) {
  const prohibited = new RegExp([
    "\\u8bfe\\u7a0b",
    "\\u66fe\\u4ed5\\u5f3a",
    "\\u502a\\u6d77\\u53a6",
    "\\u7b2c\\d{3}\\u8bb2",
    "\\u4f60\\u73b0\\u5728\\u5148\\u600e\\u4e48\\u505a",
    "\\u884c\\u52a8\\u5efa\\u8bae",
  ].join("|"));
  if (prohibited.test(text)) throw new Error(`${description}含不应公开的课程或行动建议文字`);
  return text;
}

function requiredMatch(source, pattern, description) {
  const match = source.match(pattern);
  if (!match?.[1]) throw new Error(`缺少${description}`);
  return assertPublicCopy(plain(match[1]), description);
}

function compactFields(source, description) {
  return {
    original: requiredMatch(source, /^\*\*原文：\*\*\s*(.+)$/m, `${description}原文`),
    directTranslation: requiredMatch(source, /^\*\*直译：\*\*\s*(.+)$/m, `${description}直译`),
    modernReading: requiredMatch(source, /^\*\*用今天的话说：\*\*\s*(.+)$/m, `${description}现代说明`),
    termNotes: requiredMatch(source, /^\*\*词语对照：\*\*\s*(.+)$/m, `${description}词语对照`),
  };
}

function detailedField(source, field, description) {
  return requiredMatch(
    source,
    new RegExp(`^### ${field}\\n\\n([\\s\\S]*?)(?=^### |^## |(?![\\s\\S]))`, "m"),
    `${description}${field}`,
  );
}

function detailedFields(source, description) {
  return {
    original: detailedField(source, "原文", description),
    directTranslation: detailedField(source, "直译", description),
    modernReading: detailedField(source, "用今天的话说", description),
    termNotes: detailedField(source, "词语对照", description),
  };
}

function sectionAfterHeading(document, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.match(new RegExp(`^# ${escaped}(?:｜[^\\n]+)?\\n([\\s\\S]*)`, "m"));
  return match?.[1];
}

function subsection(source, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`^## ${escaped}(?:｜[^\\n]+)?\\n([\\s\\S]*?)(?=^## |^# |^---|(?![\\s\\S]))`, "m"));
  return match?.[1];
}

function overview(source, name) {
  const compact = source.match(/^## .*?连起来看\n\n([\s\S]*?)(?=^---|(?![\s\S]))/m);
  if (compact?.[1]) return assertPublicCopy(plain(compact[1]), `${name}整体说明`);
  const detailed = source.match(/^## 六爻连起来的总提示\n\n([\s\S]*?)(?=^---|(?![\s\S]))/m);
  if (detailed?.[1]) return assertPublicCopy(plain(detailed[1]), `${name}整体说明`);
  throw new Error(`缺少${name}整体说明`);
}

const files = (await readdir(reviewDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith("逐句说明-待验收.md"))
  .map((entry) => entry.name)
  .sort();
const documents = await Promise.all(files.map(async (file) => ({ file, text: await readFile(new URL(file, reviewDirectory), "utf8") })));

function findDocument(name) {
  const direct = documents.find(({ text }) => Boolean(sectionAfterHeading(text, name)));
  if (direct) return { document: direct, section: sectionAfterHeading(direct.text, name) };
  const single = documents.find(({ text }) => new RegExp(`^# ${name}｜`, "m").test(text));
  if (single) return { document: single, section: single.text };
  throw new Error(`找不到${name}的验收稿`);
}

const packages = {};
for (const classic of hexagramClassics) {
  const { section } = findDocument(classic.name);
  const lineSource = classicHexagramTexts.find(({ number }) => number === classic.number);
  if (!lineSource) throw new Error(`找不到${classic.name}的经典爻辞`);

  const guaSection = subsection(section, "卦辞");
  if (!guaSection) throw new Error(`缺少${classic.name}卦辞段`);
  const detailed = /^### 原文$/m.test(guaSection);
  const gua = detailed ? detailedFields(guaSection, `${classic.name}卦辞`) : compactFields(guaSection, `${classic.name}卦辞`);
  const lines = {};

  for (const { label } of lineSource.lineTexts) {
    const lineSection = subsection(section, label);
    if (!lineSection) throw new Error(`缺少${classic.name}${label}段`);
    lines[label] = detailed ? detailedFields(lineSection, `${classic.name}${label}`) : compactFields(lineSection, `${classic.name}${label}`);
  }

  packages[classic.name] = {
    directTranslation: gua.directTranslation,
    modernReading: gua.modernReading,
    termNotes: gua.termNotes,
    overview: overview(section, classic.name),
    lines: Object.fromEntries(Object.entries(lines).map(([label, line]) => [label, {
      directTranslation: line.directTranslation,
      modernReading: line.modernReading,
      termNotes: line.termNotes,
    }])),
  };
}

const output = `// 由 research/reviews/*逐句说明-待验收.md 自动导入。\n// 对外内容只含经文的直译、现代说明与词语对照。\n\nexport type ReviewedLineCopy = {\n  directTranslation: string;\n  modernReading: string;\n  termNotes: string;\n};\n\nexport type ReviewedHexagramCopy = {\n  directTranslation: string;\n  modernReading: string;\n  termNotes: string;\n  overview: string;\n  lines: Record<string, ReviewedLineCopy>;\n};\n\nexport const reviewedCopyByName: Record<string, ReviewedHexagramCopy> = ${JSON.stringify(packages, null, 2)};\n`;

await writeFile(outputPath, output, "utf8");
console.log(`已导入 ${Object.keys(packages).length} 卦、${Object.values(packages).reduce((sum, item) => sum + Object.keys(item.lines).length, 0)} 爻。`);
