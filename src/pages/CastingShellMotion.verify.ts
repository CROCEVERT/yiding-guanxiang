import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

const shellShake = css.match(/@keyframes shell-shake\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

assert.match(shellShake, /translateX\(5\.4rem\)/);
assert.match(shellShake, /88%\s*\{[\s\S]*translateX\(5\.4rem\)/);
assert.match(shellShake, /100%\s*\{[\s\S]*translateX\(0\)\s+rotate\(0deg\)/);
assert.doesNotMatch(shellShake, /scale\(/);
assert.match(css, /\.shell-shake\s*\{[^}]*animation:\s*shell-shake 760ms/s);

console.log("Casting shell motion checks passed.");
