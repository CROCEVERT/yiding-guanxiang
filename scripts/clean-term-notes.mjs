import { readFile, readdir, writeFile } from "node:fs/promises";

const reviewDirectory = new URL("../research/reviews/", import.meta.url);
const files = (await readdir(reviewDirectory))
  .filter((name) => name.endsWith("逐句说明-待验收.md"))
  .sort();

const boundaryTail = /[，；]\s*(?:不是|不等于|不构成|不作|不代表|不提供|不要求|不保证|不评价|不用于|不能|不可|不鼓励|不美化|不替代|不对应|绝不)[^；。]*/g;

function cleanTermNotes(text) {
  return text
    .replace(boundaryTail, "")
    .replace(/；\s*；/g, "；")
    .replace(/，\s*；/g, "；")
    .replace(/[；，\s]+$/, "")
    .replace(/[。；]$/, "")
    .concat("。");
}

let count = 0;
for (const file of files) {
  const path = new URL(file, reviewDirectory);
  const source = await readFile(path, "utf8");
  const output = source.replace(/^\*\*词语对照：\*\*\s*(.+)$/gm, (full, body) => {
    const cleaned = cleanTermNotes(body);
    if (cleaned !== body) count += 1;
    return `**词语对照：** ${cleaned}`;
  });
  if (output !== source) await writeFile(path, output, "utf8");
}

console.log(`已清理 ${count} 条词语对照中的现代边界／辩护尾句。`);
