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
        <div className="fixed inset-0 z-[999] grid place-items-center overflow-y-auto bg-black/82 px-5 py-6">
          <div className="w-full max-w-sm rounded-[14px] border border-bronze/32 bg-ink/96 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.78)]">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold tracking-[0.18em] text-bronze">参照卡片预览</p>
              <button
                className="rounded-[8px] border border-bronze/40 px-4 py-2 text-sm font-semibold text-bronze active:translate-y-px"
                onClick={() => setShareOpen(false)}
                type="button"
              >
                关闭
              </button>
            </div>
            <ShareCard baseHexagramName={hexagramResult.baseHexagramName} changedHexagramName={hexagramResult.changedHexagramName} />
            <p className="mt-4 text-xs font-medium leading-5 text-parchment/58">
              此卡片仅在当前设备生成，不会自动上传、发送或包含你的原始问题；分享前请确认卦名与时间线索不会暴露私人处境。
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
