import type { Hexagram } from "../types";

export const hexagrams: Hexagram[] = [
  {
    id: "qian",
    name: "乾",
    symbol: "☰",
    theme: "主动推进",
    currentState: "事情处在需要主动梳理和持续推进的阶段，关键是保持清晰节奏。",
    tension: "目标感较强，但也容易忽略外部反馈，需要在行动和校准之间取得平衡。",
    risk: "避免只凭热情快速推进，先确认资源、时间和协作条件是否匹配。",
    advice: "把下一步拆成一个可验证的小动作，并给自己设置复盘节点。",
    reflection: "我现在最需要主动推进的，是目标本身，还是沟通与资源准备？",
  },
  {
    id: "kun",
    name: "坤",
    symbol: "☷",
    theme: "承接蓄力",
    currentState: "当前更适合承接信息、整理资源和等待条件成熟。",
    tension: "想要快速看见结果，但现实更需要耐心、配合和稳定积累。",
    risk: "避免因为节奏慢而否定方向，也要防止过度被动。",
    advice: "列出已有资源和缺口，先补齐最影响行动的一项。",
    reflection: "我是在稳步准备，还是因为不确定而拖延？",
  },
  {
    id: "tun",
    name: "屯",
    symbol: "䷂",
    theme: "起步阻力",
    currentState: "问题处在初始生长期，阻力和混乱是阶段性现象。",
    tension: "方向已经出现，但路径还不够稳定，需要建立基本秩序。",
    risk: "避免同时启动太多动作，导致精力分散、判断失真。",
    advice: "先确定一个最小可行步骤，完成后再决定是否扩大投入。",
    reflection: "眼前的阻力来自外部条件，还是来自我对优先级的不清楚？",
  },
  {
    id: "meng",
    name: "蒙",
    symbol: "䷃",
    theme: "澄清认知",
    currentState: "当前重点是学习、确认事实和减少误解。",
    tension: "信息不足时容易急着下判断，需要先把问题问得更准确。",
    risk: "避免把模糊感当成结论，也不要把单一意见当作全部事实。",
    advice: "写下三个关键未知，并为每个未知找到一个验证来源。",
    reflection: "我现在缺少的是信息、经验，还是一个更好的提问方式？",
  },
  {
    id: "xu",
    name: "需",
    symbol: "䷄",
    theme: "等待时机",
    currentState: "事情需要等待更清楚的条件，过早行动可能增加成本。",
    tension: "内在期待和外部节奏不一致，需要管理焦虑和行动冲动。",
    risk: "避免在证据不足时做大决定，也避免把等待变成停滞。",
    advice: "设定观察期限，并明确到期后依据哪些信息做选择。",
    reflection: "等待期间，我能准备什么，让之后的行动更稳？",
  },
  {
    id: "song",
    name: "讼",
    symbol: "䷅",
    theme: "分歧校准",
    currentState: "当前存在立场、预期或沟通方式上的拉扯。",
    tension: "如果只强调自己的判断，容易让问题进入对抗状态。",
    risk: "避免把分歧升级为输赢，先确认双方真实关注点。",
    advice: "把争议点写成事实、感受、需求三栏，再决定沟通顺序。",
    reflection: "我真正要解决的是事情本身，还是被理解和被尊重的需求？",
  },
];

export const getHexagramByIndex = (index: number): Hexagram => {
  return hexagrams[Math.abs(index) % hexagrams.length];
};
