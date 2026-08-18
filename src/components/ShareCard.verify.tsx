import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { ShareCard } from "./ShareCard";

void React;

const assert = (condition: boolean, message: string) => {
  console.assert(condition, message);
  if (!condition) {
    throw new Error(message);
  }
};

const privateQuestion = "我是否适合接受这份工作机会？这是用户完整问题，不应出现在分享卡片中。";
const forbiddenWords = [
  ["算", "命"],
  ["占", "卜"],
  ["卜", "卦"],
  ["预", "测"],
  ["运", "势"],
  ["吉", "凶"],
  ["财", "运"],
  ["姻", "缘"],
  ["改", "运"],
  ["转", "运"],
  ["必", "准"],
].map((parts) => parts.join(""));

const html = renderToStaticMarkup(<ShareCard baseHexagramName="风火家人" changedHexagramName="山泽损" />);

assert(html.includes("易定观象"), "分享卡片展示产品名");
assert(html.includes("一次国风易象复盘"), "分享卡片展示副标题");
assert(html.includes("当前易象"), "分享卡片展示当前易象标签");
assert(html.includes("风火家人"), "分享卡片展示当前易象名称");
assert(html.includes("变化参照"), "分享卡片展示变化参照标签");
assert(html.includes("山泽损"), "分享卡片展示变化参照名称");
assert(html.includes("以古老符号照见当下选择，看清局势，再定下一步。"), "分享卡片展示固定一句话");
assert(html.includes("免费传统文化学习工具｜不展示个人问题"), "分享卡片展示底部提示");
assert(!html.includes(privateQuestion), "分享卡片不展示用户完整问题");

for (const word of forbiddenWords) {
  assert(!html.includes(word), `分享卡片不出现禁用词：${word}`);
}

console.info("分享卡片 SSR 验证通过");
