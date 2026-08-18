import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const read = (path: string) => readFileSync(join(root, path), "utf8");
const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const previewPath = "src/pages/SamplePreviewPage.tsx";
assert(existsSync(join(root, previewPath)), "SamplePreviewPage.tsx should exist");

const preview = read(previewPath);
const app = read("src/App.tsx");
const home = read("src/pages/HomePage.tsx");
const types = read("src/types.ts");

["山天大畜", "天泽履", "泽水困", "风泽中孚", "地泽临", "风地观", "风雷益"].forEach((name) => {
  assert(preview.includes(name), `preview should include sample: ${name}`);
});

assert(preview.includes("<ResultPage"), "preview should reuse ResultPage for visible sample output");
assert(types.includes('"preview"'), "PageKey should include preview");
assert(app.includes("SamplePreviewPage"), "App should render SamplePreviewPage");
assert(home.includes("样板预览"), "HomePage should expose a visible preview entry");

console.info("样板预览页源码结构验证通过。");
