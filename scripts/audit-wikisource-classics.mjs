import { readFile } from "node:fs/promises";

const sourcePath = new URL("../src/data/classicTexts.ts", import.meta.url);
const dataPath = new URL("../src/data/reviewedCopies.public.ts", import.meta.url);

const sourceTitles = [
  "乾", "坤", "屯", "蒙", "需", "訟", "師", "比", "小畜", "履", "泰", "否", "同人", "大有", "謙", "豫",
  "隨", "蠱", "臨", "觀", "噬嗑", "賁", "剝", "復", "无妄", "大畜", "頤", "大過", "坎", "離", "咸", "恒",
  "遯", "大壯", "晉", "明夷", "家人", "睽", "蹇", "解", "損", "益", "夬", "姤", "萃", "升", "困", "井",
  "革", "鼎", "震", "艮", "漸", "歸妹", "豐", "旅", "巽", "兌", "渙", "節", "中孚", "小過", "既濟", "未濟",
];

function parseExport(source, declaration, terminator = ";") {
  const start = source.indexOf(declaration);
  if (start < 0) throw new Error(`未找到数据声明：${declaration}`);
  const end = source.indexOf(terminator, start + declaration.length);
  if (end < 0) throw new Error(`未找到数据结束位置：${declaration}`);
  const payload = source.slice(start + declaration.length, end).trim();
  return JSON.parse(terminator.startsWith("]") ? `${payload}]` : payload);
}

function decodeXml(text) {
  return text.replace(/&(?:amp|lt|gt|quot|apos);/g, (entity) => ({
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'",
  })[entity]);
}

function parseXmlExport(xml) {
  return [...xml.matchAll(/<page>\s*<title>([^<]+)<\/title>[\s\S]*?<text[^>]*>([\s\S]*?)<\/text>[\s\S]*?<\/page>/g)]
    .map((match) => ({ title: decodeXml(match[1]), text: decodeXml(match[2]) }));
}

async function fetchExport(batch) {
  const pages = batch.map((title) => `周易/${title}`).join("\n");
  const params = new URLSearchParams({ pages, curonly: "1" });
  const url = `https://zh.wikisource.org/w/index.php?title=Special:Export&${params}`;
  const response = await fetch(url, { headers: { "user-agent": "YidingGuanxiang-SourceAudit/1.0 (local verification)" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseXmlExport(await response.text());
}

const classicSource = await readFile(sourcePath, "utf8");
const copySource = await readFile(dataPath, "utf8");
const classics = parseExport(classicSource, "export const classicHexagramTexts: ClassicHexagramText[] = ", "];\n\nconst classicTextByNumber");
const copies = parseExport(copySource, "export const reviewedCopyByName: Record<string, ReviewedHexagramCopy> = ");

if (classics.length !== 64 || sourceTitles.length !== 64 || Object.keys(copies).length !== 64) {
  throw new Error(`数据覆盖异常：经典层 ${classics.length}，公开页映射 ${sourceTitles.length}，现代说明 ${Object.keys(copies).length}`);
}

const pages = [];
const batchSize = 16;
for (let start = 0; start < sourceTitles.length; start += batchSize) {
  const titles = sourceTitles.slice(start, start + batchSize);
  try {
    const records = await fetchExport(titles);
    for (const [offset, title] of titles.entries()) {
      const record = records.find((item) => item.title === `周易/${title}`);
      pages.push(record
        ? { index: start + offset, title, url: `https://zh.wikisource.org/wiki/${encodeURIComponent(`周易/${title}`)}`, text: record.text }
        : { index: start + offset, title, error: `${title}：导出结果未包含该页` });
    }
  } catch (error) {
    for (const [offset, title] of titles.entries()) {
      pages.push({ index: start + offset, title, error: `${title}：${error instanceof Error ? error.message : String(error)}` });
    }
  }
}

const sourceFailures = pages.filter((page) => page.error);
const referenceableRows = classics.flatMap((classic, index) => {
  const page = pages[index];
  const rows = [
    { id: `${classic.name}・卦辞`, original: classic.judgment },
    ...classic.lineTexts.map((line) => ({ id: `${classic.name}・${line.label}`, original: line.text })),
  ];
  return rows.map((row) => ({ ...row, sourceTitle: page.title, sourceUrl: page.url, sourceAvailable: Boolean(page.text) }));
});

const modernRows = Object.entries(copies).flatMap(([hexagram, copy]) => [
  { id: `${hexagram}・卦辞`, modernReading: copy.modernReading },
  ...Object.entries(copy.lines).map(([label, line]) => ({ id: `${hexagram}・${label}`, modernReading: line.modernReading })),
]);
// “不一定”这类否定表达不应误判。这里只拦截把文本包装成实际占断、
// 医疗/投资建议或改运服务的直接措辞；它是安全筛查，不替代义理判断。
const highRiskPattern = /注定|保证(?:会|能|得到|成功)|命运(?:会|将)|发财|改运|择日|开光|化解|投资(?:会|能)|婚姻(?:会|将)|官司(?:会|能)|疾病(?:会|能)|生死(?:会|能)/;
const highRiskModern = modernRows.filter((row) => highRiskPattern.test(row.modernReading));

console.log(JSON.stringify({
  audit: "维基文库《周易》公开页面—程序经典层机械对照",
  scope: {
    publicPagesExpected: 64,
    publicPagesFetched: pages.length - sourceFailures.length,
    classicRowsExpected: 448,
    classicRowsWithPublicReference: referenceableRows.filter((row) => row.sourceAvailable).length,
    modernReadingsScreened: modernRows.length,
  },
  sourceFailures,
  note: "本脚本只验证 64 个公开原文页可访问，并将 448 条程序经文逐条挂接到对应来源页；不以简繁、异体字、维基标记造成的机械字串差异冒充经义错误。现代说明的义理核验另以人工逐条审读记录完成。",
  highRiskModern,
  sourceUrls: pages.filter((page) => page.url).map((page) => ({ number: page.index + 1, page: page.title, url: page.url })),
}, null, 2));
