import { readFileSync } from "node:fs";

const assert = (condition: boolean, message: string) => {
  console.assert(condition, message);
  if (!condition) {
    throw new Error(message);
  }
};

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const questionPage = read("./QuestionPage.tsx");
const lineDisplay = read("../components/LineDisplay.tsx");
const revealPage = read("./RevealPage.tsx");
const resultPage = read("./ResultPage.tsx");
const historyPage = read("./HistoryPage.tsx");
const storage = read("../utils/storage.ts");

assert(!questionPage.includes("问策之前"), "问题页应移除顶部说明卡片");
assert(questionPage.includes("问题只作为本地观象记录的标题"), "问题页应说明问题仅为本地记录标题");
assert(questionPage.includes("完成六爻后会自动保存在当前设备"), "问题页应说明自动本地保存");
assert(lineDisplay.includes("h-3"), "六爻生成区爻线应加粗到 h-3");
assert(lineDisplay.includes("bg-bronze/80") || lineDisplay.includes("bg-bronze"), "阴爻应使用可见铜金色");
assert(revealPage.includes("compact-reveal"), "揭示页应使用更紧凑的布局标记");
assert(resultPage.includes("setShareOpen(true)") && resultPage.includes("<ShareCard"), "结果页应能打开分享卡片");
assert(resultPage.includes("不会自动上传、发送或包含你的原始问题"), "分享卡应说明不上传且不含问题");
assert(historyPage.includes("查看详情"), "记录页应保留查看详情按钮");
assert(historyPage.includes("MAX_HISTORY_ENTRIES"), "记录页的容量提示应读取统一的记录上限");
assert(historyPage.includes("自动保存在当前设备"), "记录页应说明本地保存和删除方式");
assert(storage.includes("hexagramResult:"), "历史记录应补齐详情页需要的 hexagramResult");
assert(storage.includes("MAX_HISTORY_ENTRIES = 50"), "记录应最多保留五十条");

console.info("当前 UI 修复验证通过");
