import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../src/data/reviewedCopies.public.ts", import.meta.url);
const outputPath = new URL("../research/reviews/四层文案可读性与词语对照分层审计-2026-08-12.md", import.meta.url);

const source = await readFile(sourcePath, "utf8");
const declaration = "export const reviewedCopyByName: Record<string, ReviewedHexagramCopy> = ";
const start = source.indexOf(declaration);
if (start < 0) throw new Error("未找到公开文案数据声明");
const copies = JSON.parse(source.slice(start + declaration.length).trim().replace(/;$/, ""));

const rows = Object.entries(copies).flatMap(([hexagram, copy]) => [
  { id: `${hexagram}・卦辞`, type: "卦辞", ...copy },
  ...Object.entries(copy.lines).map(([line, lineCopy]) => ({ id: `${hexagram}・${line}`, type: "爻辞", ...lineCopy })),
]);

const boundaryInTerms = /不是|不等于|不构成|不作|不代表|不提供|不要求|不保证|不评价|不用于/;
const abstractInModern = /处境|语境|机制|框架|维度|脉络|秩序|校准|可持续|承接|风险|资源|责任|条件|原则|分寸|进退/;
const longModern = (text) => text.replace(/[，。；、：！？“”‘’（）\s]/g, "").length > 76;
const nestedModern = (text) => (text.match(/[；，]/g) ?? []).length >= 4;

const termFindings = rows.filter((row) => boundaryInTerms.test(row.termNotes));
const modernFindings = rows.filter((row) => longModern(row.modernReading) || nestedModern(row.modernReading) || abstractInModern.test(row.modernReading));
const plainModernFindings = rows.filter((row) => longModern(row.modernReading) || nestedModern(row.modernReading));

const list = (items, field) => items.map((row) => `- **${row.id}**：${row[field]}`).join("\n");

const report = `---
type: product-copy-audit
status: pending-rewrite
created_at: 2026-08-12
scope: 64卦、384爻的“用今天的话说”与“词语对照”
---

# 四层文案可读性与词语对照分层审计

## 审计问题

用户指出两类问题：

1. “词语对照”有时没有解释原文词，而是在解释或限制现代转述；
2. “用今天的话说”仍有书面腔、句子过长，普通读者不容易一下读明白。

这不是排版问题，而是字段职责混淆：**词语对照只能回答“原文中的哪个词是什么意思、属于什么历史语境”；现代阅读才解释这句话放到今天可以怎样理解。**

## 检查口径

- 全量读取运行时公开数据：${rows.length} 个阅读段（64 卦辞 + 384 爻辞）。
- 词语对照命中“不是／不等于／不构成／不作／不代表／不提供／不要求／不保证／不评价／不用于”等现代边界或辩护式句法时，列为**必须改写**；这类句子可另放全局免责声明，不能留在词义字段。
- “用今天的话说”若去标点后超过 76 字，或逗号、分号达到 4 个以上，列为**优先压缩**；出现抽象词仅作人工复读线索，不自动判错。

## 结果

| 项目 | 数量 | 结论 |
|---|---:|---|
| 阅读段总数 | ${rows.length} | 全量扫描 |
| 词语对照混入现代边界／辩护 | ${termFindings.length} | 必须逐条改为原词释义 |
| 现代说明过长或嵌套过多 | ${plainModernFindings.length} | 优先改为短句、人话 |
| 现代说明含抽象词或过长／嵌套 | ${modernFindings.length} | 人工复读池，不代表每条都错 |

## 必须改写：词语对照字段

${list(termFindings, "termNotes") || "- 无"}

## 优先复读：用今天的话说

${list(plainModernFindings, "modernReading") || "- 无"}

## 示例：用户截图对应问题

- 原文：九四“可贞，无咎”。
- 现有词语对照：“可贞是可以守正；不是叫人固执不听新事实。”
- 错点：后半句在解释现代读者不该怎样做，已经越出原词释义。
- 重写规则：词语对照仅留“可贞：可以守正、守住正道”；现代层若需解释“守正”不等于固执，应写进“用今天的话说”，但仍要改成读者一眼能懂的短句。

## 改写前的固定验收

1. **直译**：逐句转成现代汉语，不加入现实建议；
2. **用今天的话说**：只说一个清楚的人话意思，优先两句内，不堆“先／再／同时／而且”的步骤；
3. **词语对照**：只列原文实际出现的词、古代身份或历史画面，不解释现代层，不放“不代表／不构成／不是要你”的边界话；
4. **边界**：保留页面现有的逐层免责声明，不在每一个词语释义中重复辩护；
5. 逐条改后重新跑本审计，目标是词语对照命中数为 0；现代说明优先池由人工抽读确认，不以机械字数作为最终判断。
`;

await writeFile(outputPath, report, "utf8");
console.log(`已审计 ${rows.length} 段：词语对照必须改写 ${termFindings.length} 条；现代说明优先复读 ${plainModernFindings.length} 条。`);
