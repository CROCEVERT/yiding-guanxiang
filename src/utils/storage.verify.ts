import type { HistoryEntry, InsightResult, LineRecord } from "../types";
import {
  clearHistoryEntries,
  deleteHistoryEntry,
  loadHistory,
  saveHistoryEntry,
} from "./storage.ts";

const assert = (condition: boolean, message: string) => {
  console.assert(condition, message);
  if (!condition) {
    throw new Error(message);
  }
};

const store = new Map<string, string>();

globalThis.localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => {
    store.set(key, value);
  },
  removeItem: (key: string) => {
    store.delete(key);
  },
  clear: () => {
    store.clear();
  },
  key: (index: number) => Array.from(store.keys())[index] ?? null,
  get length() {
    return store.size;
  },
} as Storage;

const rounds = [
  { round: 1, total: 6, coins: [], kind: "old-yin", isChanging: true },
  { round: 2, total: 7, coins: [], kind: "young-yang", isChanging: false },
  { round: 3, total: 8, coins: [], kind: "young-yin", isChanging: false },
  { round: 4, total: 9, coins: [], kind: "old-yang", isChanging: true },
  { round: 5, total: 7, coins: [], kind: "young-yang", isChanging: false },
  { round: 6, total: 8, coins: [], kind: "young-yin", isChanging: false },
] as LineRecord[];

const result = {
  primary: {
    id: "test",
    name: "测试",
    symbol: "test",
    theme: "整理结构",
    currentState: "当前状态",
    tension: "核心矛盾",
    risk: "风险提醒",
    advice: "行动启发",
    reflection: "复盘问题",
  },
  changingLines: [1, 4],
  hexagramResult: {
    baseHexagramName: "地天泰",
    changedHexagramName: "山风蛊",
    movingLines: [1, 4],
    upperTrigram: { key: "kun", name: "坤", symbol: "☷", nature: "地", lines: ["yin", "yin", "yin"] },
    lowerTrigram: { key: "qian", name: "乾", symbol: "☰", nature: "天", lines: ["yang", "yang", "yang"] },
  },
  summary: "一句话复盘摘要",
} satisfies InsightResult;

const entry: HistoryEntry = {
  id: "history-1",
  question: "我是否适合接受这份工作机会？",
  category: "事业选择",
  createdAt: "2026-06-09T09:00:00.000Z",
  rounds,
  sums: [6, 7, 8, 9, 7, 8],
  baseLines: ["yin", "yang", "yin", "yang", "yang", "yin"],
  changedLines: ["yang", "yang", "yin", "yin", "yang", "yin"],
  movingLines: [1, 4],
  baseHexagramName: "地天泰",
  changedHexagramName: "山风蛊",
  summary: "一句话复盘摘要",
  result,
};

saveHistoryEntry(entry);
const saved = loadHistory();
assert(saved.length === 1, "保存后能读取一条复盘记录");
assert(saved[0].category === "事业选择", "保存 category");
assert(saved[0].sums.join(",") === "6,7,8,9,7,8", "保存六次总和");
assert(saved[0].baseHexagramName === "地天泰", "保存当前易象");

deleteHistoryEntry(entry.id);
assert(loadHistory().length === 0, "支持删除单条");

saveHistoryEntry(entry);
clearHistoryEntries();
assert(loadHistory().length === 0, "支持清空全部");

clearHistoryEntries();
Array.from({ length: 51 }, (_, index) => index + 1).forEach((index) => {
  saveHistoryEntry({
    ...entry,
    id: `history-limit-${index}`,
    createdAt: `2026-06-09T09:${String(index).padStart(2, "0")}:00.000Z`,
  });
});
const limited = loadHistory();
assert(limited.length === 50, "history keeps at most fifty entries");
assert(limited[0].id === "history-limit-51", "history keeps newest entry first");
assert(limited[49].id === "history-limit-2", "history drops the oldest overflow entry");

store.set(
  "xuangui-insight-history",
  JSON.stringify([
    {
      id: "legacy-history",
      question: "我是否适合接受这份工作机会？",
      createdAt: "2026-06-08T09:00:00.000Z",
      lines: rounds,
      result,
    },
  ]),
);

const migrated = loadHistory();
assert(migrated.length === 1, "兼容旧版复盘记录");
assert(migrated[0].category === "其他", "旧版记录补齐默认分类");
assert(migrated[0].rounds.length === 6, "旧版 lines 迁移为 rounds");
assert(migrated[0].sums.join(",") === "6,7,8,9,7,8", "旧版记录补齐六次总和");
assert(migrated[0].baseHexagramName === "地天泰", "旧版记录补齐当前易象名称");
assert(migrated[0].movingLines.join(",") === "1,4", "旧版记录补齐变化爻");

console.info("复盘记录 storage 验证通过");
