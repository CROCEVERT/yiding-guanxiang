import { useMemo, useState } from "react";
import type { CoinResult, LineRecord, LineValue, PageKey } from "../types";
import { buildInsightResult, getLineInfo } from "../utils/insight";
import { ResultPage } from "./ResultPage";

type SampleScenario = {
  id: string;
  title: string;
  label: string;
  question: string;
  sums: LineValue[];
  note: string;
};

const samples: SampleScenario[] = [
  {
    id: "daxu-static",
    title: "山天大畜",
    label: "静卦样板",
    question: "我现在是否应该继续积累能力再行动？",
    sums: [7, 7, 7, 8, 8, 7],
    note: "用于检查静卦：只看本卦整体、卦辞、上下卦关系和完整六爻延伸阅读。",
  },
  {
    id: "lv-one-moving",
    title: "天泽履",
    label: "一爻动样板",
    question: "我是否应该在边界不清时继续推进沟通？",
    sums: [7, 7, 8, 9, 7, 7],
    note: "用于检查一爻动：突出唯一动爻爻辞，之卦只作为动爻变化后的结构对照。",
  },
  {
    id: "kun-three-moving",
    title: "泽水困",
    label: "三爻动样板",
    question: "当前资源不足时，我应该先守住什么？",
    sums: [6, 7, 8, 9, 7, 6],
    note: "用于检查多爻动：动爻列表、动爻切换，以及本卦与之卦的对照是否清晰。",
  },
  {
    id: "zhongfu-static",
    title: "风泽中孚",
    label: "内容样板",
    question: "这次合作是否建立在可验证的信任上？",
    sums: [7, 7, 8, 8, 7, 7],
    note: "用于检查具体卦义文案：避免空泛模板，观察原文、象义与现代释义是否连贯。",
  },
  {
    id: "lin-one-moving",
    title: "地泽临",
    label: "新释义样板",
    question: "我该怎样更真实地了解眼前的情况？",
    sums: [7, 9, 8, 8, 8, 8],
    note: "用于验收新写的临卦：动爻白话是否清楚，来源与边界能否展开核对。",
  },
  {
    id: "guan-one-moving",
    title: "风地观",
    label: "新释义样板",
    question: "在行动前，我还缺少哪些真实观察？",
    sums: [8, 8, 8, 8, 9, 7],
    note: "用于验收新写的观卦：是否能区分事实、局部视角、反馈与现实结论。",
  },
  {
    id: "yi-two-moving",
    title: "风雷益",
    label: "截图复验",
    question: "遇到紧急情况时，我能否破格处理？",
    sums: [7, 8, 6, 8, 7, 9],
    note: "复验风雷益六三、上九两爻动：检查逐句说明是否清楚，以及重复的动爻说明是否已删除。",
  },
];

const coinPatterns: Record<LineValue, Array<"front" | "back">> = {
  6: ["back", "back", "back"],
  7: ["front", "back", "back"],
  8: ["front", "front", "back"],
  9: ["front", "front", "front"],
};

function createPreviewLines(sums: LineValue[]): LineRecord[] {
  return sums.map((total, index) => {
    const info = getLineInfo(total);
    const round = index + 1;

    return {
      round,
      total,
      kind: info.kind,
      isChanging: info.isChanging,
      coins: coinPatterns[total].map<CoinResult>((side, coinIndex) => ({
        id: `preview-${round}-${coinIndex}`,
        side,
        value: side === "front" ? 3 : 2,
      })),
    };
  });
}

export function SamplePreviewPage({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const [selectedId, setSelectedId] = useState(samples[0].id);
  const selected = samples.find((sample) => sample.id === selectedId) ?? samples[0];
  const lines = useMemo(() => createPreviewLines(selected.sums), [selected.sums]);
  const result = useMemo(() => buildInsightResult(lines), [lines]);

  return (
    <div className="space-y-5">
      <section className="ritual-panel no-panel-corners p-5">
        <p className="text-xs font-semibold tracking-[0.22em] text-bronze/80">本地验收 · 内容样板</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-parchment">样板预览</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-parchment/72">
          这里用固定六爻展示结果页效果，方便你直接检查静卦、动卦、动爻逐句说明和页面层级。
        </p>
      </section>

      <section className="sample-preview-grid" aria-label="样板列表">
        {samples.map((sample) => (
          <button
            className={sample.id === selected.id ? "sample-preview-card active" : "sample-preview-card"}
            key={sample.id}
            onClick={() => setSelectedId(sample.id)}
            type="button"
          >
            <span>{sample.label}</span>
            <strong>{sample.title}</strong>
            <small>{sample.note}</small>
          </button>
        ))}
      </section>

      <ResultPage
        lines={lines}
        onNavigate={onNavigate}
        onSave={() => undefined}
        question={selected.question}
        result={result}
        saved={false}
      />
    </div>
  );
}
