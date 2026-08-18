import { readFile } from "node:fs/promises";

const sourcePath = new URL("../src/data/reviewedCopies.public.ts", import.meta.url);
const source = await readFile(sourcePath, "utf8");
const declaration = "export const reviewedCopyByName: Record<string, ReviewedHexagramCopy> = ";
const start = source.indexOf(declaration);

if (start < 0) throw new Error("未找到公开文案数据声明");

const copies = JSON.parse(source.slice(start + declaration.length).trim().replace(/;$/, ""));
const rows = Object.entries(copies).flatMap(([hexagram, copy]) => [
  { id: `${hexagram}・卦辞`, ...copy },
  ...Object.entries(copy.lines).map(([line, value]) => ({ id: `${hexagram}・${line}`, ...value })),
]);

// 词语对照只释原文词义。裸的“不可／不能”可能正是原文词义，不能误报；
// 这里只拦截把现代免责声明或应用边界塞回词语栏的写法。
const termBoundary = /不是|不等于|不构成|不作|不代表|不提供|不要求|不保证|不评价|不用于|不鼓励|不美化|不替代|不对应|这里(?:只|不)|今天(?:只|不)|本应用/;
const conceptPile = /(?:[、，][^。；：]{1,8}){3,}[。；：]/;
const explanatoryAside = /(?:这里|今天)(?:不是|只|也|可|不)|现代(?:人|语境)|经文(?:用|的)|原文(?:用|的)|课程(?:里|中)|不代表现实|不构成/;
const densePunctuation = (text) => (text.match(/[，、；：]/g) ?? []).length >= 4;
const tooLong = (text) => text.replace(/[，。；、：！？“”‘’（）\s]/g, "").length > 58;

const failures = rows.flatMap((row) => {
  const found = [];
  if (termBoundary.test(row.termNotes)) found.push(["词语越界", row.termNotes]);
  if (conceptPile.test(row.modernReading) || densePunctuation(row.modernReading) || tooLong(row.modernReading) || explanatoryAside.test(row.modernReading)) {
    found.push(["现代层复读", row.modernReading]);
  }
  return found.map(([kind, text]) => ({ id: row.id, kind, text }));
});

const grouped = Object.groupBy(failures, ({ kind }) => kind);
for (const [kind, items] of Object.entries(grouped)) {
  console.log(`\n${kind}：${items.length} 条`);
  for (const { id, text } of items) console.log(`- ${id}：${text}`);
}

if (failures.length > 0) {
  console.error(`\n大白话审计未通过：${failures.length} 个字段待改。`);
  process.exitCode = 1;
} else {
  console.log("\n大白话审计通过：词语字段无边界辩护，现代层均符合当前长度与表达门槛。");
}
