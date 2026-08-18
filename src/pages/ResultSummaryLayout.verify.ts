import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { LineRecord } from "../types.ts";
import { getHexagramClassic, hexagramClassics } from "../data/hexagramClassics.ts";
import {
  getHexagramMotionLabel,
  getHexagramStateLabel,
  getMovingLineNames,
  getTraditionalLineName,
  isStaticHexagram,
} from "./resultPresentation.ts";

const totals = [9, 8, 7, 8, 7, 6] as const;
const expectedNames = ["初九", "六二", "九三", "六四", "九五", "上六"];
const makeLine = (total: 6 | 7 | 8 | 9, isChanging: boolean, round = 1): LineRecord => ({
  round,
  coins: [],
  total,
  kind: total === 6 ? "old-yin" : total === 7 ? "young-yang" : total === 8 ? "young-yin" : "old-yang",
  isChanging,
});

assert.deepEqual(
  totals.map((total, index) => getTraditionalLineName(index, total)),
  expectedNames,
  "六爻名称应同时体现位置与阴阳",
);
assert.equal(getHexagramMotionLabel([]), "[静卦]", "没有变化爻时应显示静卦");
assert.equal(getHexagramMotionLabel([{ isChanging: false }, { isChanging: true }]), "[动卦]", "存在变化爻时应显示动卦");
assert.equal(isStaticHexagram([{ isChanging: false }, { isChanging: false }]), true, "六爻全部不变时应判定为静卦");
assert.equal(isStaticHexagram([{ isChanging: false }, { isChanging: true }]), false, "至少一个动爻时应判定为变卦");
assert.equal(getHexagramStateLabel([], "乾为天"), "静卦", "无动爻时状态标签应为静卦");
assert.equal(
  getHexagramStateLabel(Array.from({ length: 6 }, (_, index) => makeLine(9, true, index + 1)), "乾为天"),
  "六爻皆动 · 用九",
  "乾卦六爻皆动应补充用九",
);
assert.equal(
  getHexagramStateLabel(Array.from({ length: 6 }, (_, index) => makeLine(6, true, index + 1)), "坤为地"),
  "六爻皆动 · 用六",
  "坤卦六爻皆动应补充用六",
);
assert.deepEqual(
  getMovingLineNames([makeLine(9, true, 1), makeLine(8, false, 2), makeLine(6, true, 3)]),
  ["初九", "六三"],
  "动爻列表应显示传统爻位名",
);
assert.deepEqual(
  getHexagramClassic("火泽睽"),
  {
    number: 38,
    name: "火泽睽",
    imageText: "上火下泽，睽；君子以同而异。",
  },
  "火泽睽应展示第 38 卦及象传原文",
);
assert.equal(getHexagramClassic("乾")?.number, 1, "旧记录中的乾应兼容乾为天");
assert.equal(hexagramClassics.length, 64, "象传原文应完整覆盖六十四卦");
assert.deepEqual(
  hexagramClassics.map(({ number }) => number),
  Array.from({ length: 64 }, (_, index) => index + 1),
  "六十四卦序号应从 1 连续排列到 64",
);
assert.equal(new Set(hexagramClassics.map(({ name }) => name)).size, 64, "六十四卦名称不应重复");

const resultPageSource = readFileSync(new URL("./ResultPage.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

assert.match(resultPageSource, /data-testid="result-question"/, "顶部主卡片应展示本次复盘问题");
assert.match(resultPageSource, /data-testid="result-hexagram-lines"/, "顶部主卡片应展示完整六爻图");
assert.match(
  resultPageSource,
  /result-summary-motion-label-stable/,
  "本卦六爻标题后的静卦标签应拆分为独立高亮样式",
);
assert.match(resultPageSource, /第\{hexagramClassic\.number\}卦/, "卦名后应展示卦序");
assert.match(
  resultPageSource,
  /staticMode \?[\s\S]*?title="卦辞"[\s\S]*?title="彖曰"[\s\S]*?title="象曰"[\s\S]*?title="卦辞说明"[\s\S]*?title="完整六爻爻辞（经典学习）"/,
  "静卦结果页应按卦辞、彖曰、象曰、直白说明与完整六爻顺序展示",
);
assert.match(
  resultPageSource,
  /moving-reading-section[\s\S]*?MovingLineFocus[\s\S]*?result-reference-stack[\s\S]*?ChangedHexagramReference[\s\S]*?result-base-reference[\s\S]*?title="完整卦辞与爻辞注释（经典学习）"/,
  "变卦结果页应以动爻主卡为主，之卦与本卦说明应收为辅助卡片",
);
assert.match(resultPageSource, /getCoreImageText\(hexagramClassic\?\.imageText\)/, "象曰区块应展示六十四卦象传原文");
assert.match(resultPageSource, /getTraditionalLineName\(index, line\.total\)/, "六爻完整爻辞与注释应展示每一爻的传统爻位名");
assert.match(
  resultPageSource,
  /getLineInterpretation\(baseHexagramName, lineName\)/,
  "完整六爻爻辞应读取逐条审核后的本卦爻辞文案",
);
assert.doesNotMatch(resultPageSource, new RegExp(`>${"当前"}之象<`), "不应保留旧版重复区块");
assert.doesNotMatch(resultPageSource, />变化爻</, "结果页不应保留独立的变化爻卡片");
assert.doesNotMatch(resultPageSource, />变化参照</, "结果页不应保留独立的变化参照卡片");
assert.match(
  resultPageSource,
  /<div className="result-summary-grid">[\s\S]*?<div className="result-summary-context">[\s\S]*?易象复盘报告[\s\S]*?<CompactHexagramChart lines=\{lines\} \/>/,
  "报告标题与本卦六爻应位于同一摘要网格并从顶部对齐",
);
assert.match(resultPageSource, /className="result-page space-y-5"/, "结果页应提供独立的紧凑布局定位类");
assert.match(resultPageSource, /className="ritual-panel result-reading-panel p-4"/, "结果页下方内容应合并为一个紧凑报告栏");
assert.match(resultPageSource, /<article className="result-reading-section">/, "结果页下方各段应是同一报告栏内的分节");
assert.match(resultPageSource, /function CollapsibleClassicNotes/, "完整经典内容应使用折叠入口组件，降低第一屏阅读负担");
assert.match(
  resultPageSource,
  /<details className="result-full-notes" onToggle=\{\(event\) => setOpen\(event\.currentTarget\.open\)\} open=\{open\}>/,
  "完整经典内容应支持按阅读优先级决定是否默认展开",
);
assert.match(resultPageSource, /\{open \? "收起" : "展开查阅"\}/, "折叠入口应准确反映当前展开状态");
assert.match(resultPageSource, /<CollapsibleClassicNotes defaultOpen title="完整六爻爻辞（经典学习）">/, "静卦完整六爻应默认展开，避免静卦只剩摘要");
assert.match(
  resultPageSource,
  /result-base-reference[\s\S]*?本卦背景[\s\S]*?查看本卦卦辞与象曰/,
  "动卦应提供本卦背景和可展开的卦辞、象曰资料",
);
assert.match(resultPageSource, /<summary>/, "完整经典内容折叠入口应提供可点击标题");
assert.doesNotMatch(resultPageSource, /<section className="ritual-panel p-4">/, "结果页下方内容不应再拆成多个独立卡片");
assert.match(
  cssSource,
  /\.result-reading-panel\s*\{[\s\S]*?gap:\s*0/s,
  "结果页下方合并报告栏应缩小内部分段间距",
);
assert.match(
  cssSource,
  /\.result-reading-body\s*\{[\s\S]*?line-height:\s*1\.72/s,
  "结果页报告正文应使用更紧凑的行距",
);
assert.match(
  cssSource,
  /\.result-reading-section h2\s*\{[\s\S]*?display:\s*flex[\s\S]*?width:\s*100%[\s\S]*?background:\s*linear-gradient\(/s,
  "Result reading section headings should have a dark block background for stronger hierarchy",
);
assert.match(
  cssSource,
  /\.result-reading-section h2\s*\{[\s\S]*?margin-left:\s*0/s,
  "Result reading section headings should align with the reading copy",
);
assert.match(
  cssSource,
  /\.result-reading-section h2\s*\{[\s\S]*?font-size:\s*1\.16rem/s,
  "Result reading section headings should be more visible",
);
assert.match(
  cssSource,
  /\.result-reading-section h2\s*\{[\s\S]*?border-radius:\s*6px/s,
  "Result reading section heading blocks should use a small radius",
);
assert.match(
  cssSource,
  /\.result-reading-body\s*\{[\s\S]*?margin-top:\s*0\.28rem/s,
  "Result reading copy should sit closer to its heading",
);
assert.match(
  cssSource,
  /\.result-reading-body\s*\{[\s\S]*?color:\s*rgba\(246,\s*238,\s*220,\s*0\.88\)/s,
  "Result reading body text should be brighter for readability",
);
assert.match(
  cssSource,
  /\.result-full-notes\s*\{[\s\S]*?border:\s*1px solid rgba\(184,\s*137,\s*74,\s*0\.22\)/s,
  "完整经典内容折叠入口应有低调边界，避免和正文混在一起",
);
assert.match(
  cssSource,
  /\.result-page\s*\{[^}]*margin-top:\s*-0\.75rem/s,
  "结果页首卡应整体上移 12px，收紧标题栏下方留白",
);
assert.match(
  cssSource,
  /\.result-summary-card\s*\{[^}]*padding-top:\s*1rem/s,
  "结果摘要卡顶部内边距应收紧",
);
assert.match(
  cssSource,
  /\.result-summary-grid\s*\{[^}]*align-items:\s*start[^}]*margin-top:\s*0/s,
  "摘要左右两列应从顶部对齐并去掉额外顶距",
);
assert.match(
  cssSource,
  /\.result-summary-hexagram\s*\{[^}]*align-self:\s*start/s,
  "本卦六爻应贴近摘要卡顶部",
);
assert.match(
  cssSource,
  /\.result-summary-line-solid,\s*\.result-summary-line-broken span,\s*\.result-summary-line-empty\s*\{[^}]*height:\s*0\.62rem/s,
  "结果页六爻线条应加粗，增强符号力量感",
);

console.log("Result summary layout checks passed.");
