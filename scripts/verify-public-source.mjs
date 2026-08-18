import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const excludedDirectories = new Set([".git", "dist", "node_modules", "release"]);
const excludedFiles = new Set([
  "scripts/verify-public-source.mjs",
  "scripts/verify-public-bundle.mjs",
  "scripts/audit-runtime-content.mjs",
]);
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

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      return excludedDirectories.has(entry.name) ? [] : walk(absolutePath);
    }
    return [absolutePath];
  }));
  return files.flat();
}

const hits = [];
for (const absolutePath of await walk(projectRoot)) {
  const path = relative(projectRoot, absolutePath);
  if (excludedFiles.has(path)) continue;
  const content = await readFile(absolutePath, "utf8").catch(() => "");
  if (privateMarkers.some((pattern) => pattern.test(content))) {
    hits.push(path);
  }
}

if (hits.length > 0) {
  throw new Error(`公开源码检查失败：以下文件仍含私有研究标记：\n${hits.join("\n")}`);
}

console.log("公开源码边界验证通过：未检出私有研究标记。");
