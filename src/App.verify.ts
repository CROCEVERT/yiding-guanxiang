import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
const resultPageSource = readFileSync(new URL("./pages/ResultPage.tsx", import.meta.url), "utf8");
const usageNoticeSource = readFileSync(new URL("./components/UsageNoticeDialog.tsx", import.meta.url), "utf8");

assert.match(appSource, /const saveEntry = \(insightResult: InsightResult\)/, "应集中创建记录，避免手动和自动保存字段不一致");
assert.match(appSource, /if \(lines\.length !== 6 \|\| saved\) \{[\s\S]*?return;/, "保存前应要求六爻完整且防止同一轮重复写入");
assert.match(
  appSource,
  /const revealResult = \(\) => \{[\s\S]*?const insightResult = result \?\? buildInsightResult\(lines\);[\s\S]*?saveEntry\(insightResult\);[\s\S]*?setCurrentPage\("reveal"\);/,
  "进入揭示页时应自动写入本地记录",
);
assert.match(resultPageSource, /已自动保存/, "结果页应清楚说明记录已自动保存");
assert.match(appSource, /NOTICE_STORAGE_KEY/, "首次说明的已读状态应保存在当前设备");
assert.match(appSource, /<UsageNoticeDialog/, "首次使用与之后查看应共用同一份说明");
assert.match(usageNoticeSource, /当前版本免费使用/, "使用说明应明确免费使用边界");
assert.match(usageNoticeSource, /不设云同步或应用内数据上传/, "使用说明应如实说明当前版本不做云同步或应用内上传");
assert.match(usageNoticeSource, /共享设备请及时删除记录/, "使用说明应提醒共享设备的隐私风险");
assert.match(usageNoticeSource, /页面内容不是对现实结果的预言/, "使用说明应明确不作现实预言");
assert.match(usageNoticeSource, /专业意见为准/, "使用说明应明确重要事项应以专业意见为准");

console.info("自动保存记录流程验证通过");
