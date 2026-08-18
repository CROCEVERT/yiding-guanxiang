import assert from "node:assert/strict";
import { hexagramClassics } from "./hexagramClassics.ts";

assert.equal(hexagramClassics.length, 64, "大象必须完整覆盖六十四卦");
assert.deepEqual(
  hexagramClassics.map(({ number }) => number),
  Array.from({ length: 64 }, (_, index) => index + 1),
  "大象卦序必须连续且不重复",
);
assert.equal(new Set(hexagramClassics.map(({ name }) => name)).size, 64, "大象卦名不可重复");
assert.equal(new Set(hexagramClassics.map(({ imageText }) => imageText)).size, 64, "大象文本不可意外重复");

for (const classic of hexagramClassics) {
  assert.match(classic.imageText, /以/, `${classic.name} 大象应保留取法句`);
  assert.doesNotMatch(classic.imageText, /[□�]/, `${classic.name} 大象不能含乱码或占位符`);
}

assert.equal(
  hexagramClassics[38]?.imageText,
  "山上有水，蹇；君子以反身修德。",
  "蹇卦大象应保留“君子”，不能被 EPUB 误字“君予”覆盖",
);

console.log("Hexagram classics integrity checks passed.");
