import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shellSource = readFileSync(new URL("../components/Shell.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

assert.doesNotMatch(shellSource, /className="app-shell /, "应用外层不应强制接管用户鼠标");
assert.doesNotMatch(
  cssSource,
  /\.app-shell,\s*\.app-shell \*\s*\{[^}]*cursor:\s*none\s*!important/s,
  "用户鼠标应保持浏览器默认显示与交互行为",
);

console.log("Pointer visibility checks passed.");
