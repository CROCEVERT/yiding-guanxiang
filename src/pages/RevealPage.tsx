import { useCallback, useEffect, useRef, useState } from "react";
import { getHexagramClassic } from "../data/hexagramClassics";
import { getClassicHexagramText } from "../data/classicTexts";
import type { InsightResult, LineRecord } from "../types";
import { getHexagramResult } from "../utils/insight";
import {
  getCoreImageText,
  getGuaCiText,
  getHexagramStateLabel,
  getMovingLineNames,
  getTraditionalLineName,
  isStaticHexagram,
} from "./resultPresentation";

type RevealPageProps = {
  lines: LineRecord[];
  result?: InsightResult;
  onContinue: () => void;
};

const isYangLine = (line: LineRecord) => line.total === 7 || line.total === 9;

function RevealHexagramLine({ line, highlight = false }: { line?: LineRecord; highlight?: boolean }) {
  if (!line) {
    return <div className="reveal-hexagram-line reveal-hexagram-line-empty" />;
  }

  const className = highlight ? "reveal-hexagram-line-moving" : "";

  if (isYangLine(line)) {
    return <div className={`reveal-hexagram-line reveal-hexagram-line-yang ${className}`} />;
  }

  return (
    <div className={`reveal-hexagram-line-yin ${className}`}>
      <span />
      <span />
    </div>
  );
}

function RevealHexagramPlate({
  lines,
  name,
  settled,
  judgment,
  classicText,
}: {
  lines: LineRecord[];
  name: string;
  settled: boolean;
  judgment?: string;
  classicText?: { judgment: string };
}) {
  const slots = Array.from({ length: 6 }, (_, index) => lines[index]);
  const staticMode = isStaticHexagram(lines);

  return (
    <div className={`reveal-hexagram-plate ${settled ? "reveal-hexagram-settled" : ""}`}>
      <div className="reveal-name-block" aria-live="polite">
        <h2 className="reveal-name-direct">{name}</h2>
        {judgment ? <p className="reveal-top-classic">卦辞经典原文：{classicText?.judgment ?? judgment}</p> : null}
      </div>

      <div className="reveal-hexagram-lines" aria-label={`${name}六爻`}>
        {slots
          .map((line, index) => ({ line, index }))
          .reverse()
          .map(({ line, index }) => (
            <div className="reveal-hexagram-row" key={index}>
              <span>{line ? getTraditionalLineName(index, line.total) : ["初", "二", "三", "四", "五", "上"][index]}</span>
              <RevealHexagramLine line={line} highlight={!staticMode && Boolean(line?.isChanging)} />
            </div>
          ))}
      </div>
    </div>
  );
}

export function RevealPage({ lines, result, onContinue }: RevealPageProps) {
  const computedHexagramResult = (() => {
    try {
      return getHexagramResult(lines);
    } catch {
      return undefined;
    }
  })();
  const targetName = result?.hexagramResult?.baseHexagramName ?? computedHexagramResult?.baseHexagramName ?? "易象归位";
  const changedName = result?.hexagramResult?.changedHexagramName ?? computedHexagramResult?.changedHexagramName ?? targetName;
  const [settled, setSettled] = useState(false);
  const [selectedMovingIndex, setSelectedMovingIndex] = useState(0);
  const fallbackRef = useRef<number | null>(null);

  const hexagramClassic = getHexagramClassic(targetName);
  const staticMode = isStaticHexagram(lines);
  const stateLabel = getHexagramStateLabel(lines, targetName);
  const movingNames = getMovingLineNames(lines);
  const movingLines = lines.filter((line) => line.isChanging);
  const selectedMovingLine = movingLines[selectedMovingIndex] ?? movingLines[0];
  const movingSummary = movingNames.length === 6 ? "六爻皆动" : `${movingNames.join("、")}动`;
  const hexagramNumber = hexagramClassic ? `第${hexagramClassic.number}卦` : "";
  const classicText = getClassicHexagramText(hexagramClassic?.number);
  const selectedClassicLineText = selectedMovingLine ? classicText?.lineTexts[selectedMovingLine.round - 1] : undefined;
  const coreImageText = getCoreImageText(hexagramClassic?.imageText);
  const topJudgment = classicText?.judgment ?? getGuaCiText(targetName);

  const finishReveal = useCallback(() => {
    if (fallbackRef.current !== null) {
      window.clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }

    setSettled(true);
  }, []);

  useEffect(() => {
    if (!result) {
      return;
    }

    const fallbackDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 50 : 1850;
    fallbackRef.current = window.setTimeout(finishReveal, fallbackDelay);

    return () => {
      if (fallbackRef.current !== null) {
        window.clearTimeout(fallbackRef.current);
        fallbackRef.current = null;
      }
    };
  }, [finishReveal, result]);

  return (
    <div className="compact-reveal text-center">
      <section className="reveal-stage">
        <div
          className="reveal-card-arrive"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && event.animationName === "reveal-card-arrive") {
              finishReveal();
            }
          }}
        >
          <div className="reveal-result-card">
            <RevealHexagramPlate
              classicText={classicText}
              judgment={topJudgment}
              lines={lines}
              name={targetName}
              settled={settled}
            />

            <div className="reveal-mode-panel">
              <p className="reveal-mode-eyebrow">观象参照</p>
              <span className={staticMode ? "reveal-mode-tag reveal-mode-tag-static" : "reveal-mode-tag"}>
                {staticMode ? "本次为静卦" : `本次为${stateLabel}`}
              </span>
              <h3>
                {targetName}
                {hexagramNumber ? <small>{hexagramNumber}</small> : null}
              </h3>

              {staticMode ? (
                <div className="reveal-mode-copy">
                  <p className="reveal-mode-relation">本卦无动爻，本次呈现本卦的卦辞、象曰与六爻原文。</p>
                </div>
              ) : (
                <div className="reveal-mode-copy">
                  <p className="reveal-mode-relation">
                    {targetName} <span>→</span> {movingSummary} <span>→</span> {changedName}
                  </p>
                  {movingNames.length === 1 ? (
                    <p className="reveal-mode-classic">
                <strong>{movingNames[0]}爻辞经典原文</strong>
                      {selectedClassicLineText?.text ?? "该爻原文待补充。"}
                    </p>
                  ) : (
                    <div className="reveal-moving-list" aria-label="动爻列表">
                      {movingLines.map((line, index) => (
                        <button
                          className={index === selectedMovingIndex ? "reveal-moving-chip active" : "reveal-moving-chip"}
                          key={`${line.round}-${line.total}`}
                          onClick={() => setSelectedMovingIndex(index)}
                          type="button"
                        >
                          {movingNames[index]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="reveal-core-image">{coreImageText}</p>
              <button
                className="bronze-button reveal-continue-button w-full px-5 py-4 font-bold text-ink disabled:cursor-not-allowed disabled:bg-parchment/18 disabled:text-parchment/40"
                disabled={!settled || !result}
                onClick={onContinue}
                type="button"
              >
                查看参照
              </button>
              <p className="reveal-rational-hint reveal-rational-hint-inline">仅作传统文化体验与问题参照，请回到现实处境中审慎判断。</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
