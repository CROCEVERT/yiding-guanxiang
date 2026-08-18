import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const assetsDirectory = new URL("../dist/assets/", import.meta.url);
const forbiddenMarkers = [
  { label: "内部课程资料", pattern: /内部课程资料/ },
  { label: "三位讲次编号", pattern: /第\d{3}讲/ },
  {
    label: "内部来源姓名",
    pattern: new RegExp([
      String.fromCodePoint(0x66fe, 0x4ed5, 0x5f3a),
      String.fromCodePoint(0x502a, 0x6d77, 0x53a6),
      String.fromCodePoint(0x5929, 0x7eaa),
    ].join("|")),
  },
];

const assetFiles = (await readdir(assetsDirectory)).filter((name) => name.endsWith(".js"));
if (assetFiles.length === 0) {
  throw new Error("未找到生产 JavaScript 文件；请先运行构建。 ");
}

const bundle = (await Promise.all(assetFiles.map((fileName) => readFile(new URL(fileName, assetsDirectory), "utf8")))).join("\n");
for (const { label, pattern } of forbiddenMarkers) {
  if (pattern.test(bundle)) {
    throw new Error(`发布包包含不应对外分发的内容：${label}`);
  }
}

console.log(`发布包边界验证通过：${fileURLToPath(assetsDirectory)} 内 ${assetFiles.length} 个 JS 文件未检出内部研究标记。`);
