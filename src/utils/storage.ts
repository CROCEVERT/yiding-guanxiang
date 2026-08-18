import type { HistoryEntry, LinePolarity, LineRecord, LineValue, Trigram } from "../types";
import { getBaseLines, getChangedLines, getHexagramResult } from "./insight.ts";

const STORAGE_KEY = "xuangui-insight-history";
export const MAX_HISTORY_ENTRIES = 50;

type RawHistoryEntry = Partial<HistoryEntry> & {
  lines?: LineRecord[];
};

const fallbackTrigram: Trigram = {
  key: "fallback",
  name: "未定",
  symbol: "",
  nature: "参照",
  lines: ["yang", "yang", "yang"],
};

const isLineValue = (value: unknown): value is LineValue => value === 6 || value === 7 || value === 8 || value === 9;

const isPolarity = (value: unknown): value is LinePolarity => value === "yin" || value === "yang";

const normalizePolarityLines = (value: unknown): LinePolarity[] =>
  Array.isArray(value) && value.every(isPolarity) ? value : [];

const normalizeSums = (value: unknown): LineValue[] =>
  Array.isArray(value) && value.every(isLineValue) ? value : [];

const normalizeMovingLines = (value: unknown): number[] =>
  Array.isArray(value) ? value.filter((item): item is number => Number.isInteger(item) && item >= 1 && item <= 6) : [];

const normalizeRounds = (entry: RawHistoryEntry): LineRecord[] => {
  if (Array.isArray(entry.rounds)) {
    return entry.rounds;
  }

  if (Array.isArray(entry.lines)) {
    return entry.lines;
  }

  return [];
};

const createSafeHexagramResult = (entry: RawHistoryEntry, rounds: LineRecord[], movingLines: number[]) => {
  if (entry.result?.hexagramResult) {
    return entry.result.hexagramResult;
  }

  try {
    return getHexagramResult(rounds);
  } catch {
    const baseHexagramName = entry.baseHexagramName || "未定";
    const changedHexagramName = entry.changedHexagramName || baseHexagramName;

    return {
      baseHexagramName,
      changedHexagramName,
      movingLines,
      upperTrigram: fallbackTrigram,
      lowerTrigram: fallbackTrigram,
    };
  }
};

const normalizeHistoryEntry = (entry: RawHistoryEntry): HistoryEntry | undefined => {
  const rounds = normalizeRounds(entry);

  if (!entry.id || !entry.question || !entry.createdAt || !entry.result || rounds.length === 0) {
    return undefined;
  }

  const sums = normalizeSums(entry.sums);
  const fallbackSums = normalizeSums(rounds.map((round) => round.total));
  const safeSums = sums.length > 0 ? sums : fallbackSums;
  const baseLines = normalizePolarityLines(entry.baseLines);
  const changedLines = normalizePolarityLines(entry.changedLines);
  const movingLines =
    normalizeMovingLines(entry.movingLines).length > 0
      ? normalizeMovingLines(entry.movingLines)
      : normalizeMovingLines(entry.result.hexagramResult?.movingLines ?? entry.result.changingLines);
  const hexagramResult = createSafeHexagramResult(entry, rounds, movingLines);
  const normalizedResult = {
    ...entry.result,
    hexagramResult: hexagramResult,
  };

  return {
    id: entry.id,
    question: entry.question,
    category: entry.category?.trim() || "其他",
    createdAt: entry.createdAt,
    rounds,
    sums: safeSums,
    baseLines: baseLines.length > 0 ? baseLines : getBaseLines(safeSums),
    changedLines: changedLines.length > 0 ? changedLines : getChangedLines(safeSums),
    movingLines,
    baseHexagramName: entry.baseHexagramName || hexagramResult.baseHexagramName || "未定",
    changedHexagramName: entry.changedHexagramName || hexagramResult.changedHexagramName || "未定",
    summary: entry.summary || entry.result.summary || `${hexagramResult.baseHexagramName}的本次观象记录。`,
    result: normalizedResult,
  };
};

export const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as RawHistoryEntry[]) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized = parsed
      .map((entry) => normalizeHistoryEntry(entry))
      .filter((entry): entry is HistoryEntry => Boolean(entry));

    if (raw && JSON.stringify(normalized) !== raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    return [];
  }
};

export const saveHistoryEntry = (entry: HistoryEntry): HistoryEntry[] => {
  const next = [entry, ...loadHistory().filter((item) => item.id !== entry.id)].slice(0, MAX_HISTORY_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const deleteHistoryEntry = (id: string): HistoryEntry[] => {
  const next = loadHistory().filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const clearHistoryEntries = (): HistoryEntry[] => {
  localStorage.removeItem(STORAGE_KEY);
  return [];
};
