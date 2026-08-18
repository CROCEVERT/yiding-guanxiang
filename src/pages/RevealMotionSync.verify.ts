import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync(new URL("./RevealPage.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

assert.match(pageSource, /onAnimationEnd=/, "卡片应由动画完成事件触发定格");
assert.doesNotMatch(pageSource, /setSettled\(true\)[\s\S]{0,80}\}, 3000\)/, "不应让 3000ms 定时器与 CSS 动画同时抢占定格状态");
assert.match(
  cssSource,
  /\.reveal-card-arrive\s*\{[^}]*transform-origin:\s*center center/s,
  "卡片应从屏幕内部以自身中心为原点显现",
);
assert.match(
  cssSource,
  /@keyframes reveal-card-arrive\s*\{[\s\S]*?0%\s*\{[^}]*transform:\s*translate\(0,\s*-0\.45rem\)\s*scale\(0\.82\)/s,
  "卡片起始位置不应横向偏出屏幕",
);
assert.doesNotMatch(
  cssSource,
  /@keyframes reveal-card-arrive\s*\{[\s\S]*?transform:\s*translate\(\s*5\.4rem/,
  "卡片不应再从右侧画外入场",
);
assert.doesNotMatch(
  cssSource,
  /@keyframes reveal-card-arrive\s*\{[\s\S]*?76%\s*\{/,
  "卡片不应提前在 76% 到达并停留于最终位置附近",
);

console.log("Reveal motion synchronization checks passed.");
