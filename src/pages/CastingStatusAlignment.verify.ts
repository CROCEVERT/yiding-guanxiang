import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

assert.match(
  css,
  /\.casting-status-pill\s*\{[^}]*margin-left:\s*-0\.375rem/s,
  "本次符号状态标签应轻微左移",
);

console.log("Casting status alignment checks passed.");
