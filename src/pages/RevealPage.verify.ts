import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync(new URL("./RevealPage.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

assert.match(pageSource, /reveal-card-arrive/);
assert.doesNotMatch(pageSource, /\u516d\u723b\u7f13\u5c55\uff0c\u8bf8\u8c61\u5f52\u4e00/, "Reveal heading should not keep the repeated subtitle");
assert.match(pageSource, /classicText\?\.lineTexts/, "Reveal moving-line section should prefer classic line text");
assert.match(
  pageSource,
  /<p className="reveal-top-classic">卦辞经典原文：\{classicText\?\.judgment/,
  "Judgment text should appear in the top hexagram plate",
);
assert.match(pageSource, /reveal-rational-hint reveal-rational-hint-inline/, "Reveal rational hint should be displayed as one compact line");

assert.match(pageSource, /result\?\.hexagramResult\?\.baseHexagramName/);
assert.doesNotMatch(pageSource, /baguaSymbols|reveal-bagua-orbit/);
assert.doesNotMatch(
  pageSource,
  /<p>\{settled \?/,
  "Reveal hexagram plate should not show an eyebrow above the settled hexagram name",
);
assert.doesNotMatch(pageSource, /<p>易象归位<\/p>/, "呈现页不应保留顶部小标签，避免标题区拥挤");
assert.match(pageSource, /本次为静卦/, "静卦时应展示静卦状态说明");
assert.match(pageSource, /本卦无动爻，本次呈现本卦的卦辞、象曰与六爻原文。/, "静卦应说明无动爻时呈现的经文范围");
assert.match(pageSource, /targetName[\s\S]*movingSummary[\s\S]*changedName/, "变卦时应展示本卦、动爻与之卦路径");
assert.match(pageSource, /六爻皆动|用九|用六/, "六爻皆动时应支持特殊标签");
assert.match(pageSource, /reveal-moving-chip/, "多个动爻时应先显示可选择的动爻列表");
assert.match(cssSource, /@keyframes reveal-card-arrive/);
assert.match(cssSource, /\.compact-reveal\s*\{[^}]*margin-top:\s*-/s);
assert.doesNotMatch(pageSource, /className="reveal-heading"/, "Reveal page should not keep the repeated headline above the result card");
assert.match(
  cssSource,
  /\.reveal-stage\s*\{[^}]*padding:\s*0\.55rem 0 0\.25rem/s,
  "Reveal result card should keep a safe top gap after removing the headline",
);
assert.match(
  cssSource,
  /\.reveal-name-block\s*\{[^}]*min-height:\s*3\.55rem/s,
  "Reveal hexagram name block should be tighter after removing the eyebrow",
);
assert.match(cssSource, /\.reveal-card-arrive\s*\{[^}]*transform-origin:\s*center center/s);
assert.match(cssSource, /\.reveal-hexagram-line-moving/, "动爻应使用暖金色发光样式");
assert.doesNotMatch(
  cssSource,
  /(^|\n)\.reveal-hexagram-line-moving\s*,/,
  "动爻高光不能直接作用到阴爻外层容器，否则会填满阴爻中间断口",
);
assert.match(cssSource, /prefers-reduced-motion[\s\S]*reveal-card-arrive/);

console.log("RevealPage transition checks passed.");
