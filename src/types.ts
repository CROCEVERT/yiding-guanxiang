export type PageKey = "home" | "question" | "casting" | "reveal" | "result" | "history" | "preview";

export type CoinSide = "front" | "back";

export type CoinResult = {
  id: string;
  side: CoinSide;
  value: 2 | 3;
};

export type LineValue = 6 | 7 | 8 | 9;

export type LineKind = "old-yin" | "young-yang" | "young-yin" | "old-yang";

export type LinePolarity = "yin" | "yang";

export type Trigram = {
  key: string;
  name: string;
  symbol: string;
  nature: string;
  lines: readonly [LinePolarity, LinePolarity, LinePolarity];
};

export type LineRecord = {
  round: number;
  coins: CoinResult[];
  total: LineValue;
  kind: LineKind;
  isChanging: boolean;
};

export type Hexagram = {
  id: string;
  name: string;
  symbol: string;
  theme: string;
  currentState: string;
  tension: string;
  risk: string;
  advice: string;
  reflection: string;
};

export type InsightResult = {
  /**
   * 旧版仅有六个样例卦时留下的字段。新结果不得再写入，也不能作为
   * 卦象判断的来源；保留为可选项只为读取早期本地记录。
   */
  primary?: Hexagram;
  changed?: Hexagram;
  changingLines: number[];
  hexagramResult: {
    baseHexagramName: string;
    changedHexagramName: string;
    movingLines: number[];
    upperTrigram: Trigram;
    lowerTrigram: Trigram;
  };
  summary: string;
};

export type HistoryEntry = {
  id: string;
  question: string;
  category: string;
  createdAt: string;
  rounds: LineRecord[];
  sums: LineValue[];
  baseLines: LinePolarity[];
  changedLines: LinePolarity[];
  movingLines: number[];
  baseHexagramName: string;
  changedHexagramName: string;
  summary: string;
  result: InsightResult;
};
