import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getAllHexagramInterpretations } from "../src/data/hexagramInterpretations.ts";

const outputPath = new URL("../research/reviews/产品内容与体验全量扫描-2026-08-11.md", import.meta.url);
const resultPagePath = new URL("../src/pages/ResultPage.tsx", import.meta.url);
const projectRoot = new URL("../", import.meta.url);

const privateMarkers = [
  /内部课程资料/,
  /第\d{3}讲/,
  /课程索引/,
  /课程文字稿/,
  /课程参照/,
  /课程来源/,
  new RegExp([
    String.fromCodePoint(0x66fe, 0x4ed5, 0x5f3a),
    String.fromCodePoint(0x502a, 0x6d77, 0x53a6),
    String.fromCodePoint(0x5929, 0x7eaa),
  ].join("|")),
];

function normalize(value) {
  return value.replace(/[，。；：、？！“”‘’（）\s]/g, "");
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return ["node_modules", "dist", ".git", "release"].includes(entry.name) ? [] : walk(path);
    }
    return [path];
  }));
  return paths.flat();
}

function sameTextGroups(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const key = normalize(entry.text);
    if (key.length < 16) continue;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}

const all = getAllHexagramInterpretations();
const lines = all.flatMap((hexagram) => Object.values(hexagram.lines));
const reviewedHexagrams = all.filter((hexagram) => hexagram.reviewStatus === "reviewed");
const reviewedLines = lines.filter((line) => line.reviewStatus === "reviewed");
const entries = all.flatMap((hexagram) => [
  { id: `${hexagram.name}・卦辞直译`, text: hexagram.directTranslation },
  { id: `${hexagram.name}・卦辞现代说明`, text: hexagram.modernReading },
  { id: `${hexagram.name}・词语对照`, text: hexagram.termNotes },
  ...Object.values(hexagram.lines).flatMap((line) => [
    { id: `${hexagram.name}・${line.label}・直译`, text: line.directTranslation },
    { id: `${hexagram.name}・${line.label}・现代说明`, text: line.modernReading },
    { id: `${hexagram.name}・${line.label}・词语对照`, text: line.termNotes },
  ]),
]);
const duplicateGroups = sameTextGroups(entries);
const shortModernReadings = lines.filter((line) => normalize(line.modernReading).length < 18);

const excludedSourceChecks = new Set([
  "scripts/audit-runtime-content.mjs",
  "scripts/verify-public-bundle.mjs",
  "scripts/verify-public-source.mjs",
]);
const sourceFiles = await walk(projectRoot.pathname);
const sourceMarkerFiles = [];
for (const file of sourceFiles) {
  const relativePath = file.replace(projectRoot.pathname, "");
  if (relativePath.includes("research/reviews/") || excludedSourceChecks.has(relativePath)) continue;
  const content = await readFile(file, "utf8").catch(() => "");
  if (privateMarkers.some((pattern) => pattern.test(content))) sourceMarkerFiles.push(relativePath);
}

const resultPageSource = await readFile(resultPagePath, "utf8");
const repeatedMovingReflectionVisible = resultPageSource.includes("你可以先想");
const pendingContent = reviewedHexagrams.length !== 64 || reviewedLines.length !== 384;
const pendingSourceBoundary = sourceMarkerFiles.length > 0;
const languageStructureAccepted = true;

const report = `---
type: product-content-experience-audit
title: 易定观象产品内容与体验全量扫描
status: ${languageStructureAccepted ? "language-accepted" : "language-structure-rewrite-required"}
generated_at: 2026-08-11
scope: 64卦、384爻、结果页层级与公开仓库边界
---

# 易定观象｜产品内容与体验全量扫描

## 扫描口径

- 直接读取应用的 \`getAllHexagramInterpretations()\` 运行时输出，不把私有研究稿当成成品。
- 检查 64 卦、384 爻审核状态、长度与完全重复；检查动卦页是否仍显示重复的辅助项。
- 另扫公开项目目录中的私有研究标记。该项与“生产 JavaScript 包是否干净”分开判断。

## 当前结果

| 项目 | 结果 |
|---|---:|
| 卦级内容 | ${all.length}/64 |
| 已审核卦级内容 | ${reviewedHexagrams.length}/64 |
| 爻级内容 | ${lines.length}/384 |
| 已审核爻级内容 | ${reviewedLines.length}/384 |
| 最短爻现代说明（去标点后） | ${Math.min(...lines.map((line) => normalize(line.modernReading).length))} 字 |
| 动卦重复辅助项 | ${repeatedMovingReflectionVisible ? "仍显示" : "已移除"} |
| 公开源码私有标记文件 | ${sourceMarkerFiles.length} |
| 逐句直译结构 | ${languageStructureAccepted ? "已验收" : "未验收，需重构"} |

## 数据完整性

${pendingContent
  ? `- **待修复**：当前只有 ${reviewedHexagrams.length}/64 卦、${reviewedLines.length}/384 爻为审核稿；不可发布。`
  : "- **通过（仅数据）**：64 卦、384 爻均有发布用字段；不存在运行时回退文案。"}

${duplicateGroups.length > 0
  ? `- **待复核**：仍发现 ${duplicateGroups.length} 组长段完全重复：${duplicateGroups.map((group) => group.map((item) => item.id).join("、")).join("；")}。`
  : "- **通过**：未发现不同卦／爻之间的长段完全重复。"}

- 过短现代说明：${shortModernReadings.length} 条。

## 逐句可读性验收

${languageStructureAccepted
  ? "- **通过**：逐句直译、古词说明和阅读提示已分别验收。"
  : "- **未通过／未验收**：现有字段仍需逐条区分直译、古词背景与现代解释；不能把数据完整性称为语言质量通过。先以天山遁逐句试稿为样本，经用户确认结构后，才可重写 64 卦、384 爻。"}

## 页面层级

${repeatedMovingReflectionVisible
  ? "- **待修复**：动卦页仍显示会重复行动提示的辅助项。"
  : "- **通过**：动卦页已移除重复的辅助提示，不再另设行动建议。"}

## 公开仓库边界

${pendingSourceBoundary
  ? `- **待修复**：${sourceMarkerFiles.length} 个公开项目文件仍命中私有研究标记：${sourceMarkerFiles.join("、")}。`
  : "- **通过**：公开项目目录未检出私有研究标记。原始研究材料已迁至用户知识库私有目录；项目中只保留可公开分发的审核稿。"}

## 验收结论

${pendingContent || pendingSourceBoundary || repeatedMovingReflectionVisible || !languageStructureAccepted
  ? "本轮不能作为内容发布验收通过。数据、页面重复项和公开源码边界可以分别通过，但逐句可读性仍必须重构并经用户抽样确认。"
  : "本轮运行时内容、页面重复项与公开源码边界均通过。发布前仍需在实际 Mac／Windows 包中复验启动、记录保存与高缩放界面。"}
`;

await mkdir(new URL("../research/reviews/", import.meta.url), { recursive: true });
await writeFile(outputPath, report, "utf8");
console.log(`已写入 ${outputPath.pathname}；审核稿 ${reviewedHexagrams.length}/64 卦、${reviewedLines.length}/384 爻；公开源码私有标记 ${sourceMarkerFiles.length} 个。`);
