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

const html = renderToStaticMarkup(
  <ShareCard
    baseHexagramName="风火家人"
    baseHexagramNumber={37}
    changedHexagramName="山泽损"
    changedHexagramNumber={41}
    judgment="利女贞。"
    question={privateQuestion}
    reading="先把家里的分工和说话方式理顺，事情才容易稳住。"
    lines={[
      { round: 1, coins: [], total: 9, kind: "old-yang", isChanging: true },
      { round: 2, coins: [], total: 8, kind: "young-yin", isChanging: false },
      { round: 3, coins: [], total: 7, kind: "young-yang", isChanging: false },
      { round: 4, coins: [], total: 8, kind: "young-yin", isChanging: false },
      { round: 5, coins: [], total: 7, kind: "young-yang", isChanging: false },
      { round: 6, coins: [], total: 8, kind: "young-yin", isChanging: false },
    ]}
  />,
);

assert(html.includes("易定观象"), "分享卡片展示产品名");
assert(html.includes("传统文化互动体验"), "分享卡片展示产品定位");
assert(html.includes("第37卦"), "分享卡片展示本卦序号");
assert(html.includes("利女贞。"), "分享卡片展示本卦卦辞");
assert(html.includes("观象参照"), "分享卡片展示观象参照标签");
assert(html.includes("风火家人"), "分享卡片展示当前易象名称");
assert(html.includes("山泽损"), "分享卡片展示变化参照名称");
assert(html.includes("初六动"), "分享卡片展示动爻位置");
assert(html.includes("本次为变卦"), "分享卡片展示动静状态");
assert(html.includes("慎断是非"), "分享卡片展示阅读边界");
assert(html.includes("本次问题"), "分享卡片展示本次问题标签");
assert(html.includes(privateQuestion), "分享卡片展示用户选择分享的问题");
assert(html.includes("免费传统文化学习工具｜不展示个人问题"), "分享卡片展示底部提示");
for (const word of forbiddenWords) {
  assert(!html.includes(word), `分享卡片不出现禁用词：${word}`);
}

console.info("分享卡片 SSR 验证通过");
