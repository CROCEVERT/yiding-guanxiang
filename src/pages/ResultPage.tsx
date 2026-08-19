import { type ReactNode, useState } from "react";
import { ShareCard } from "../components/ShareCard";
import { classicTextEditorialPolicy, getClassicHexagramText, type ClassicLineText } from "../data/classicTexts";
import { getHexagramClassic } from "../data/hexagramClassics";
import {
  getHexagramInterpretation,
  getLineInterpretation,
} from "../data/hexagramInterpretations";
import type { InsightResult, LineRecord, PageKey, Trigram } from "../types";
import { getHexagramResult } from "../utils/insight";
import {
  buildStaticOverallNote,
  getCoreImageText,
  getHexagramMotionLabel,
  getMovingLineNames,
  getTraditionalLineName,
  getTuanText,
  isStaticHexagram,
} from "./resultPresentation";

type ResultPageProps = {
  question: string;
  result?: InsightResult;
  lines: LineRecord[];
  onNavigate: (page: PageKey) => void;
  onSave: () => void;
  saved: boolean;
};

const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

const fallbackTrigram: Trigram = {
  key: "fallback",
  name: "未定",
  symbol: "",
  nature: "参照",
  lines: ["yang", "yang", "yang"],
};

const isYangLine = (line: LineRecord) => line.total === 7 || line.total === 9;

const CLASSIC_TERM_NOTE =
  "注：本段如出现“吉”“凶”等字，均为《易经》经典原文用语，仅供文本学习，不代表现实结果判断。";

function hasClassicOutcomeTerm(text?: string) {
  return Boolean(text && /[吉凶]/.test(text));
}

function ClassicTermNote({ text }: { text?: string }) {
  if (!hasClassicOutcomeTerm(text)) {
    return null;
  }

  return <p className="classic-source-note">{CLASSIC_TERM_NOTE}</p>;
}

function ClassicTextDisclosure() {
  return (
    <aside className="interpretation-source interpretation-source-static" aria-label="经文与现代说明">
      <p className="interpretation-source-title">经文与现代说明</p>
      <p>
        经文按{classicTextEditorialPolicy.sourceTitle}{classicTextEditorialPolicy.sourceEdition}整理；
        {classicTextEditorialPolicy.status}。现代说明是为当代读者写的阅读参照，不是经文原话、唯一解释或现实结果判断。
      </p>
    </aside>
  );
}

function ChangedHexagramReference({
  name,
  number,
  judgment,
  imageText,
}: {
  name: string;
  number?: number;
  judgment?: string;
  imageText?: string;
}) {
  return (
    <article className="result-reference-card result-changed-reference">
      <div className="result-reference-heading">
        <p className="result-reference-kicker">之卦参照</p>
        <h2 className="font-display">{name}{number ? <span>第{number}卦</span> : null}</h2>
      </div>
      <p className="result-reference-intro">
        动爻变化后，对照的是另一组经典文本，用来帮助比较，不是对现实结果的预告。
      </p>
      {judgment || imageText ? (
        <details className="interpretation-source">
          <summary>查看卦辞与象曰</summary>
          {judgment ? <p>卦辞：{judgment}</p> : null}
          {imageText ? <p>象曰：{imageText}</p> : null}
          <ClassicTermNote text={`${judgment ?? ""}${imageText ?? ""}`} />
        </details>
      ) : null}
    </article>
  );
}

function ResultSection({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <article className="result-reading-section">
      <h2 className="font-display text-xl font-bold text-bronze">{title}</h2>
      <div className="result-reading-body">{children}</div>
      {note ? <p className="result-section-note">{note}</p> : null}
    </article>
  );
}

function CollapsibleClassicNotes({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details className="result-full-notes" onToggle={(event) => setOpen(event.currentTarget.open)} open={open}>
      <summary>
        <span>{title}</span>
        <span className="result-full-notes-action">{open ? "收起" : "展开查阅"}</span>
      </summary>
      <div className="result-full-notes-body">{children}</div>
    </details>
  );
}

function getSafeHexagramResult(result: InsightResult, lines: LineRecord[]) {
  const runtimeResult = result as InsightResult & { hexagramResult?: InsightResult["hexagramResult"] };

  if (runtimeResult.hexagramResult) {
    return runtimeResult.hexagramResult;
  }

  try {
    return getHexagramResult(lines);
  } catch {
    return {
      baseHexagramName: "未定",
      changedHexagramName: "未定",
      movingLines: result.changingLines ?? [],
      upperTrigram: fallbackTrigram,
      lowerTrigram: fallbackTrigram,
    };
  }
}

type ShareImagePayload = {
  baseHexagramName: string;
  baseHexagramNumber?: number;
  changedHexagramName: string;
  changedHexagramNumber?: number;
  judgment?: string;
  question: string;
  reading?: string;
  lines: LineRecord[];
};

const escapeSvgText = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function wrapShareText(value: string, maxLength: number, maxLines = 4) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const lines: string[] = [];
  let current = "";

  for (const character of Array.from(normalized)) {
    current += character;
    if (current.length >= maxLength) {
      lines.push(current);
      current = "";
      if (lines.length === maxLines) break;
    }
  }

  if (current && lines.length < maxLines) lines.push(current);
  if (lines.join("").length < normalized.length && lines.length) lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, -1)}…`;
  return lines.length ? lines : ["未填写问题"];
}

function getShareLineLabel(line: LineRecord) {
  const polarity = line.total === 7 || line.total === 9 ? "九" : "六";
  const positions = ["初", "二", "三", "四", "五", "上"];
  return `${positions[line.round - 1] ?? `第${line.round}`}${polarity}`;
}

function buildShareCardSvg(payload: ShareImagePayload) {
  const movingLines = payload.lines.filter((line) => line.isChanging).map(getShareLineLabel);
  const hasChange = movingLines.length > 0 && payload.changedHexagramName !== payload.baseHexagramName;
  const path = hasChange
    ? `${payload.baseHexagramName} → ${movingLines.join("、")}动 → ${payload.changedHexagramName}`
    : `${payload.baseHexagramName} · 六爻皆静`;
  const questionLines = wrapShareText(payload.question, 19);
  const readingLines = payload.reading ? wrapShareText(payload.reading, 21, 3) : [];
  const displayLines = payload.lines.slice(0, 6).reverse();
  const hexagramLines = displayLines
    .map((line, index) => {
      const y = 474 + index * 48;
      const fill = line.isChanging ? "url(#movingGold)" : "url(#bronzeGold)";
      const glow = line.isChanging ? ' filter="url(#glow)"' : "";
      if (line.total === 7 || line.total === 9) {
        return `<rect x="270" y="${y}" width="540" height="20" rx="2" fill="${fill}"${glow} />`;
      }
      return `<rect x="270" y="${y}" width="238" height="20" rx="2" fill="${fill}"${glow} /><rect x="572" y="${y}" width="238" height="20" rx="2" fill="${fill}"${glow} />`;
    })
    .join("");
  const readingSvg = readingLines
    .map((line, index) => `<text x="112" y="${1066 + index * 36}" class="reading">${escapeSvgText(line)}</text>`)
    .join("");
  const questionY = 1128 + readingLines.length * 36;
  const questionSvg = questionLines
    .map((line, index) => `<text x="112" y="${questionY + 78 + index * 40}" class="question">${escapeSvgText(line)}</text>`)
    .join("");
  const height = Math.max(1450, questionY + 130 + questionLines.length * 40);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#392713"/><stop offset="0.52" stop-color="#0c0906"/><stop offset="1" stop-color="#1c1209"/></linearGradient>
    <radialGradient id="halo" cx="50%" cy="3%" r="64%"><stop stop-color="#dbac5f" stop-opacity=".28"/><stop offset="1" stop-color="#0c0906" stop-opacity="0"/></radialGradient>
    <linearGradient id="bronzeGold" x1="0" x2="1"><stop stop-color="#b77d36"/><stop offset=".5" stop-color="#e5b966"/><stop offset="1" stop-color="#b77d36"/></linearGradient>
    <linearGradient id="movingGold" x1="0" x2="1"><stop stop-color="#d7a54e"/><stop offset=".5" stop-color="#ffe2a0"/><stop offset="1" stop-color="#d7a54e"/></linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="10" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <style>.title{font-family:'Noto Serif SC','Songti SC',serif;fill:#f1e6d2;font-weight:800}.label{font-family:'Noto Serif SC','Songti SC',serif;fill:#c99e62;font-weight:700}.body{font-family:'Noto Serif SC','Songti SC',serif;fill:#eadfca;font-weight:600}.muted{font-family:'Noto Serif SC','Songti SC',serif;fill:#bfb3a0;font-weight:600}.reading{font-family:'Noto Serif SC','Songti SC',serif;fill:#eadfca;font-size:27px;font-weight:600}.question{font-family:'Noto Serif SC','Songti SC',serif;fill:#f1e6d2;font-size:31px;font-weight:700}</style>
  </defs>
  <rect width="1080" height="${height}" fill="#090806"/><rect width="1080" height="${height}" fill="url(#background)"/><rect width="1080" height="740" fill="url(#halo)"/>
  <rect x="58" y="58" width="964" height="${height - 116}" rx="22" fill="none" stroke="#b8894a" stroke-opacity=".48" stroke-width="2"/>
  <rect x="86" y="86" width="908" height="${height - 172}" rx="12" fill="none" stroke="#b8894a" stroke-opacity=".27" stroke-width="2"/>
  <text x="540" y="145" text-anchor="middle" class="muted" font-size="22" letter-spacing="5">易定观象 · 传统文化互动体验</text>
  <text x="540" y="245" text-anchor="middle" class="title" font-size="76" letter-spacing="7">${escapeSvgText(payload.baseHexagramName)}</text>
  ${payload.baseHexagramNumber ? `<text x="540" y="285" text-anchor="middle" class="label" font-size="25">第${payload.baseHexagramNumber}卦</text>` : ""}
  ${payload.judgment ? `<text x="540" y="350" text-anchor="middle" class="body" font-size="30">卦辞：${escapeSvgText(payload.judgment)}</text>` : ""}
  ${hexagramLines}
  <line x1="86" y1="790" x2="994" y2="790" stroke="#b8894a" stroke-opacity=".28" stroke-width="2"/>
  <text x="112" y="856" class="muted" font-size="24" letter-spacing="4">观象参照</text>
  <rect x="112" y="885" width="190" height="54" rx="12" fill="#503719"/><text x="207" y="921" text-anchor="middle" class="label" font-size="25">${hasChange ? "本次为变卦" : "本次为静卦"}</text>
  <text x="112" y="993" class="body" font-size="35">${escapeSvgText(path)}</text>
  ${hasChange && payload.changedHexagramNumber ? `<text x="112" y="1030" class="label" font-size="23">之卦 · 第${payload.changedHexagramNumber}卦</text>` : ""}
  ${readingLines.length ? `<text x="112" y="${1040}" class="muted" font-size="22" letter-spacing="3">一句话参照</text>${readingSvg}` : ""}
  <line x1="112" y1="${questionY + 25}" x2="968" y2="${questionY + 25}" stroke="#b8894a" stroke-opacity=".25" stroke-width="2"/>
  <text x="112" y="${questionY + 64}" class="muted" font-size="22" letter-spacing="3">本次问题</text>
  ${questionSvg}
  <text x="540" y="${height - 74}" text-anchor="middle" class="muted" font-size="20">仅作传统文化学习与问题参照，慎断是非。</text>
  <text x="540" y="${height - 40}" text-anchor="middle" class="label" font-size="19" letter-spacing="2">免费传统文化学习工具 · 本卡片含你主动选择分享的问题</text>
</svg>`;
}

async function saveShareCardImage(payload: ShareImagePayload) {
  const svg = buildShareCardSvg(payload);
  const svgUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("图片生成失败"));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.width * 2;
    canvas.height = image.height * 2;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("当前浏览器无法生成图片");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const downloadUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `易定观象-${payload.baseHexagramName}-分享卡.png`;
    link.click();
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function CompactHexagramChart({ lines }: { lines: LineRecord[] }) {
  const slots = Array.from({ length: 6 }, (_, index) => lines[index]);
  const motionLabel = getHexagramMotionLabel(lines);

  return (
    <div className="result-summary-hexagram" data-testid="result-hexagram-lines">
      <p className="result-summary-hexagram-title">
        本卦六爻
        <span className={motionLabel === "[静卦]" ? "result-summary-motion-label-stable" : "result-summary-motion-label"}>
          {motionLabel}
        </span>
      </p>
      <div className="result-summary-line-list">
        {slots.map((line, index) => (
          <div className="result-summary-line" key={lineNames[index]}>
            <span className="result-summary-line-name">
              {line ? getTraditionalLineName(index, line.total) : lineNames[index]}
            </span>
            {line ? (
              <div className={line.isChanging ? "result-summary-line-shape is-moving" : "result-summary-line-shape"}>
                {isYangLine(line) ? (
                  <div className="result-summary-line-solid" />
                ) : (
                  <div className="result-summary-line-broken">
                    <span />
                    <span />
                  </div>
                )}
                <span className="result-summary-line-change">{line.isChanging ? "变" : ""}</span>
              </div>
            ) : (
              <div className="result-summary-line-empty" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getClassicLineText(lineTexts: ClassicLineText[] | undefined, line: LineRecord | undefined) {
  if (!line) {
    return undefined;
  }

  return lineTexts?.[line.round - 1];
}

function ClassicOriginalWithTranslation({ text }: { text?: string }) {
  if (!text) {
    return null;
  }

  return (
    <>
      <p className="classic-line-text"><span className="classic-inline-label">经典原文：</span>{text}</p>
      <ClassicTermNote text={text} />
    </>
  );
}

function ModernReadingLayers({
  directTranslation,
  modernReading,
  termNotes,
}: {
  directTranslation: string;
  modernReading: string;
  termNotes: string;
}) {
  return (
    <div className="modern-reading-layers">
      <p className="modern-reading-row">
        <span className="modern-reading-label">直译</span>
        <span className="modern-reading-copy">
          {directTranslation}
          <span className="reading-inline-disclaimer">仅作经文含义参照，不作为现实结论，慎断是非。</span>
        </span>
      </p>
      <p className="modern-reading-row modern-reading-today">
        <span className="modern-reading-label">用今天的话说</span>
        <span className="modern-reading-copy">
          {modernReading}
          <span className="reading-inline-disclaimer">仅作现代阅读参照，不代表现实结果，慎断是非。</span>
        </span>
      </p>
      <p className="modern-reading-row modern-term-notes">
        <span className="modern-reading-label">词语对照</span>
        <span className="modern-reading-copy">{termNotes}</span>
      </p>
    </div>
  );
}

function CompleteLineNotes({
  baseHexagramName,
  lines,
  lineTexts,
}: {
  baseHexagramName: string;
  lines: LineRecord[];
  lineTexts?: ClassicLineText[];
}) {
  return (
    <div className="result-line-notes">
      {lines.map((line, index) => {
        const classicLine = getClassicLineText(lineTexts, line);
        const lineName = getTraditionalLineName(index, line.total);
        const lineInterpretation = getLineInterpretation(baseHexagramName, lineName);

        return (
          <div className="result-line-note" key={`${line.round}-${line.total}`}>
            <p className="font-display text-base font-bold text-parchment">
              {lineName}
              <span className="ml-2 text-xs font-bold text-bronze/78">{line.isChanging ? "动爻" : "静爻"}</span>
            </p>
            {lineInterpretation ? (
              <>
                <p className="classic-line-text">
                  <span className="classic-inline-label">经典原文｜{lineInterpretation.label}：</span>{lineInterpretation.original}
                </p>
                <ModernReadingLayers
                  directTranslation={lineInterpretation.directTranslation}
                  modernReading={lineInterpretation.modernReading}
                  termNotes={lineInterpretation.termNotes}
                />
                <ClassicTermNote text={lineInterpretation.original} />
              </>
            ) : classicLine ? (
              <>
                <p className="classic-line-text">
                  <span className="classic-inline-label">经典原文｜{classicLine.label}：</span>{classicLine.text}
                </p>
                <ClassicTermNote text={classicLine.text} />
              </>
            ) : null}
            {!lineInterpretation ? <p className="mt-1 text-parchment/76">本条经文尚待补充对应的阅读说明。</p> : null}
          </div>
        );
      })}
    </div>
  );
}

function MovingLineFocus({
  movingLines,
  movingNames,
  lineTexts,
  selectedMovingIndex,
  onSelect,
  baseHexagramName,
}: {
  movingLines: LineRecord[];
  movingNames: string[];
  lineTexts?: ClassicLineText[];
  selectedMovingIndex: number;
  onSelect: (index: number) => void;
  baseHexagramName: string;
}) {
  const selectedLine = movingLines[selectedMovingIndex] ?? movingLines[0];
  const selectedName = movingNames[selectedMovingIndex] ?? movingNames[0];
  const selectedClassicLine = getClassicLineText(lineTexts, selectedLine);
  const selectedInterpretation = getLineInterpretation(baseHexagramName, selectedName);

  if (!selectedLine) {
    return <p>本次没有动爻，可直接阅读本卦整体含义。</p>;
  }

  return (
    <div className="moving-line-focus">
      {movingLines.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {movingLines.map((line, index) => (
            <button
              className={index === selectedMovingIndex ? "moving-line-tab active" : "moving-line-tab"}
              key={`${line.round}-${line.total}`}
              onClick={() => onSelect(index)}
              type="button"
            >
              {movingNames[index]}
            </button>
          ))}
        </div>
      ) : null}
      <div className="moving-line-reading">
        <p className="moving-reading-title"><span>{selectedName}</span>动爻参照</p>
        {selectedInterpretation ? (
          <>
            <p className="classic-line-text">
              <span className="classic-inline-label">经典原文｜{selectedInterpretation.label}：</span>{selectedInterpretation.original}
            </p>
            <ModernReadingLayers
              directTranslation={selectedInterpretation.directTranslation}
              modernReading={selectedInterpretation.modernReading}
              termNotes={selectedInterpretation.termNotes}
            />
            <ClassicTermNote text={selectedInterpretation.original} />
          </>
        ) : selectedClassicLine ? (
          <>
            <p className="classic-line-text">
              <span className="classic-inline-label">经典原文｜{selectedClassicLine.label}：</span>{selectedClassicLine.text}
            </p>
            <ClassicTermNote text={selectedClassicLine.text} />
          </>
        ) : null}
        {!selectedInterpretation ? <p className="mt-2 text-parchment/76">本条经文尚待补充对应的阅读说明。</p> : null}
        <p className="moving-reading-boundary">
          阅读提醒：本页内容仅供传统文化学习与问题整理参考，不构成对现实情况、结果或行动的判断。涉及安全、健康、法律、投资或重大决定，请以事实与专业意见为准。
        </p>
      </div>
    </div>
  );
}

export function ResultPage({ question, result, lines, onNavigate, onSave, saved }: ResultPageProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareSaveState, setShareSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [selectedMovingIndex, setSelectedMovingIndex] = useState(0);

  if (!result) {
    return (
      <div className="space-y-5 text-center">
        <h2 className="font-display text-3xl font-bold text-parchment">还没有生成记录</h2>
        <button className="bronze-button px-5 py-3 font-bold text-ink" onClick={() => onNavigate("question")} type="button">
          重新问策
        </button>
      </div>
    );
  }

  const hexagramResult = getSafeHexagramResult(result, lines);
  const hexagramClassic = getHexagramClassic(hexagramResult.baseHexagramName);
  const classicText = getClassicHexagramText(hexagramClassic?.number);
  const changedClassic = getHexagramClassic(hexagramResult.changedHexagramName);
  const staticMode = isStaticHexagram(lines);
  const movingNames = getMovingLineNames(lines);
  const movingLines = lines.filter((line) => line.isChanging);
  const changedClassicText = getClassicHexagramText(changedClassic?.number);
  const baseInterpretation = getHexagramInterpretation(hexagramResult.baseHexagramName);
  const changedInterpretation = getHexagramInterpretation(hexagramResult.changedHexagramName);
  const firstMovingLine = lines.find((line) => line.isChanging);
  const firstMovingReading = firstMovingLine
    ? getLineInterpretation(hexagramResult.baseHexagramName, getTraditionalLineName(firstMovingLine.round - 1, firstMovingLine.total))?.modernReading
    : undefined;
  const shareReading = staticMode ? baseInterpretation?.modernReading : firstMovingReading ?? baseInterpretation?.modernReading;
  const shareImagePayload: ShareImagePayload = {
    baseHexagramName: hexagramResult.baseHexagramName,
    baseHexagramNumber: hexagramClassic?.number,
    changedHexagramName: hexagramResult.changedHexagramName,
    changedHexagramNumber: changedClassic?.number,
    judgment: classicText?.judgment,
    question,
    reading: shareReading,
    lines,
  };

  const handleShareSave = async () => {
    setShareSaveState("saving");
    try {
      await saveShareCardImage(shareImagePayload);
      setShareSaveState("saved");
    } catch {
      setShareSaveState("error");
    }
  };
  return (
    <div className="result-page space-y-5">
      <section className="ritual-panel result-summary-card p-5">
        <div className="result-summary-grid">
          <div className="result-summary-context">
            <div className="result-summary-heading">
              <p className="text-xs font-semibold tracking-[0.22em] text-bronze/82">易象复盘报告</p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-parchment">
                {hexagramResult.baseHexagramName}
                {hexagramClassic ? (
                  <span className="ml-2 align-middle text-sm font-bold text-bronze/82">第{hexagramClassic.number}卦</span>
                ) : null}
              </h1>
            </div>

            <div className="result-summary-question" data-testid="result-question">
              <p className="result-summary-label">本次复盘问题</p>
              <p className="result-summary-question-text">{question}</p>
            </div>

            <div className="result-summary-trigrams">
              <div>
                <p className="result-summary-label">上象</p>
                <p className="result-summary-trigram-value">
                  {hexagramResult.upperTrigram.name} / {hexagramResult.upperTrigram.nature}
                </p>
              </div>
              <div>
                <p className="result-summary-label">下象</p>
                <p className="result-summary-trigram-value">
                  {hexagramResult.lowerTrigram.name} / {hexagramResult.lowerTrigram.nature}
                </p>
              </div>
            </div>
          </div>

          <CompactHexagramChart lines={lines} />
        </div>
      </section>

      <section className="ritual-panel result-reading-panel p-4">
        {staticMode ? (
          <>
            <ResultSection title="卦辞">
              <ClassicOriginalWithTranslation text={classicText?.judgment} />
            </ResultSection>

            {getTuanText() ? (
              <ResultSection title="彖曰">
                <p>{getTuanText()}</p>
              </ResultSection>
            ) : null}

            {getCoreImageText(hexagramClassic?.imageText) ? (
              <ResultSection title="象曰">
                <p className="font-display text-base font-bold leading-7 text-parchment/90">
                  {getCoreImageText(hexagramClassic?.imageText)}
                </p>
              </ResultSection>
            ) : null}

            <ResultSection title="卦辞说明">
              {baseInterpretation ? (
                <ModernReadingLayers
                  directTranslation={baseInterpretation.directTranslation}
                  modernReading={baseInterpretation.modernReading}
                  termNotes={baseInterpretation.termNotes}
                />
              ) : (
                <p>
                  {buildStaticOverallNote({
                    baseHexagramName: hexagramResult.baseHexagramName,
                    judgment: classicText?.judgment,
                    imageText: hexagramClassic?.imageText,
                  })}
                </p>
              )}
            </ResultSection>

            {baseInterpretation ? (
              <ResultSection title="六爻连起来看">
                <p>{baseInterpretation.overview}</p>
              </ResultSection>
            ) : null}

            <CollapsibleClassicNotes defaultOpen title="完整六爻爻辞（经典学习）">
              <CompleteLineNotes
                baseHexagramName={hexagramResult.baseHexagramName}
                lines={lines}
                lineTexts={classicText?.lineTexts}
              />
            </CollapsibleClassicNotes>
          </>
        ) : (
          <>
            <section className="moving-reading-section" aria-label="当前动爻参照">
              <MovingLineFocus
                lineTexts={classicText?.lineTexts}
                movingLines={movingLines}
                movingNames={movingNames}
                selectedMovingIndex={selectedMovingIndex}
                onSelect={setSelectedMovingIndex}
                baseHexagramName={hexagramResult.baseHexagramName}
              />
            </section>

            <div className="result-reference-stack" aria-label="辅助阅读">
              <ChangedHexagramReference
                imageText={changedClassic?.imageText ?? changedInterpretation?.xiangYue}
                judgment={changedClassicText?.judgment ?? changedInterpretation?.guaCi}
                name={hexagramResult.changedHexagramName}
                number={changedClassic?.number ?? changedInterpretation?.number}
              />
              <article className="result-reference-card result-base-reference">
                <div className="result-reference-heading">
                  <p className="result-reference-kicker">本卦背景</p>
                  <h2 className="font-display">{hexagramResult.baseHexagramName}</h2>
                </div>
                <p className="result-reference-intro">
                {baseInterpretation?.overview ??
                  buildStaticOverallNote({
                    baseHexagramName: hexagramResult.baseHexagramName,
                    judgment: classicText?.judgment,
                    imageText: hexagramClassic?.imageText,
                  })}
                </p>
                <details className="interpretation-source">
                  <summary>查看本卦卦辞与象曰</summary>
                  <ClassicOriginalWithTranslation text={classicText?.judgment} />
                  {getCoreImageText(hexagramClassic?.imageText) ? <p>象曰：{getCoreImageText(hexagramClassic?.imageText)}</p> : null}
                </details>
              </article>
            </div>

            <CollapsibleClassicNotes title="完整卦辞与爻辞注释（经典学习）">
              <div className="result-compact-stack">
                <div>
                  <p className="font-display text-base font-bold text-parchment">本卦卦辞</p>
                  <ClassicOriginalWithTranslation text={classicText?.judgment} />
                </div>
                {getCoreImageText(hexagramClassic?.imageText) ? (
                  <div>
                    <p className="font-display text-base font-bold text-parchment">象曰</p>
                    <p className="mt-1 text-parchment/76">{getCoreImageText(hexagramClassic?.imageText)}</p>
                  </div>
                ) : null}
                <CompleteLineNotes
                  baseHexagramName={hexagramResult.baseHexagramName}
                  lines={lines}
                  lineTexts={classicText?.lineTexts}
                />
              </div>
            </CollapsibleClassicNotes>
          </>
        )}
        <ClassicTextDisclosure />
      </section>

      <section className="rounded-[10px] border border-bronze/22 bg-ink/48 p-4 text-xs font-medium leading-6 text-parchment/62">
        <p className="font-bold tracking-[0.08em] text-bronze">阅读边界</p>
        <p className="mt-1">本内容仅作传统文化学习与问题参照，不构成现实结论，也不替代法律、医疗、投资、心理咨询等专业意见。</p>
        <p className="mt-1">涉及安全、疾病、法律、投资或重大财务安排，请以事实、正式程序和专业意见为准。当前版本免费使用，不提供付费讲解、咨询、代看或代操作服务。</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button className="bronze-button px-4 py-3 text-sm font-bold text-ink" onClick={onSave} type="button">
          {saved ? "已自动保存" : "保存本次参照"}
        </button>
        <button
          className="outline-button border border-bronze/40 px-4 py-3 text-sm font-semibold text-bronze"
          onClick={() => setShareOpen(true)}
          type="button"
        >
          生成分享卡片
        </button>
        <button
          className="outline-button border border-bronze/40 px-4 py-3 text-sm font-semibold text-bronze"
          onClick={() => onNavigate("history")}
          type="button"
        >
          查看记录
        </button>
        <button
          className="outline-button border border-bronze/40 px-4 py-3 text-sm font-semibold text-bronze"
          onClick={() => onNavigate("question")}
          type="button"
        >
          再次问策
        </button>
        <button
          className="outline-button col-span-2 border border-bronze/28 px-4 py-3 text-sm font-semibold text-parchment/74"
          onClick={() => onNavigate("home")}
          type="button"
        >
          返回首页
        </button>
      </section>

      {shareOpen ? (
        <div aria-label="分享卡片预览" aria-modal="true" className="share-preview-overlay" role="dialog">
          <div className="share-preview-dialog">
            <div className="share-preview-header">
              <p>分享卡片预览</p>
              <button
                className="share-preview-close"
                onClick={() => setShareOpen(false)}
                type="button"
              >
                关闭
              </button>
            </div>
            <ShareCard {...shareImagePayload} />
            <div className="share-preview-actions">
              <button className="share-preview-save" disabled={shareSaveState === "saving"} onClick={handleShareSave} type="button">
                {shareSaveState === "saving" ? "正在生成图片…" : shareSaveState === "saved" ? "已保存到本地" : "保存到本地"}
              </button>
            </div>
            <p className="share-preview-note">
              本卡片会包含你主动填写的“本次问题”，但不会自动上传或发送。分享前请确认其中没有不想公开的个人信息。
            </p>
            {shareSaveState === "error" ? <p className="share-preview-error">图片生成失败，请重新点击“保存到本地”。</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
