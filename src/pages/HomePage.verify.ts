import { readFileSync } from "node:fs";

const assert = (condition: boolean, message: string) => {
  console.assert(condition, message);
  if (!condition) {
    throw new Error(message);
  }
};

const source = readFileSync(new URL("./HomePage.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

const stillCoinCount = (source.match(/home-coin-still/g) ?? []).length;

assert(!source.includes("<video"), "Home hero should not render video coins.");
assert(!source.includes(".webm"), "Home hero should not depend on WebM alpha transparency.");
assert(source.includes("coin-front-ritual.png"), "Home hero should use the front coin PNG.");
assert(stillCoinCount >= 1, "Home hero should render static floating coin images.");
assert(/\.home-coin-still\s*\{[^}]*animation:\s*home-coin-still-float/s.test(css), "Home coin PNGs should keep a gentle floating animation.");

console.info("HomePage static coin verification passed");
