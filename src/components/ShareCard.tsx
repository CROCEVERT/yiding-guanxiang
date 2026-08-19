import React from "react";
import type { LineRecord } from "../types";

void React;

type ShareCardProps = {
  baseHexagramName: string;
  baseHexagramNumber?: number;
  changedHexagramName: string;
  changedHexagramNumber?: number;
  judgment?: string;
  question: string;
  reading?: string;
  lines: LineRecord[];
};

function getShareLineLabel(line: LineRecord) {
  const polarity = line.total === 7 || line.total === 9 ? "九" : "六";
  const positions = ["初", "二", "三", "四", "五", "上"];
  return `${positions[line.round - 1] ?? `第${line.round}`}${polarity}`;
}

function ShareHexagramDiagram({ lines }: { lines: LineRecord[] }) {
  const displayLines = lines.slice(0, 6).reverse();

  return (
    <div aria-label="本卦六爻图" className="share-hexagram-diagram">
      {displayLines.map((line, index) => {
        const isYang = line.total === 7 || line.total === 9;
        const isMoving = line.isChanging;
        return (
          <div className={isMoving ? "share-hexagram-line is-moving" : "share-hexagram-line"} key={`${line.round}-${index}`}>
            {isYang ? (
              <span className="share-hexagram-solid" />
            ) : (
              <span className="share-hexagram-broken">
                <i />
                <i />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ShareCard({
  baseHexagramName,
  baseHexagramNumber,
  changedHexagramName,
  question,
  reading,
  lines,
}: ShareCardProps) {
  const movingLineNames = lines
    .filter((line) => line.isChanging)
    .map(getShareLineLabel);
  const hasChange = movingLineNames.length > 0 && changedHexagramName !== baseHexagramName;
  const referencePath = hasChange
    ? `${baseHexagramName} → ${movingLineNames.join("、")}动 → ${changedHexagramName}`
    : `${baseHexagramName} · 六爻皆静`;

  return (
    <article className="share-card" aria-label="易定观象分享卡片">
      <div className="share-card-frame">
        <header className="share-card-hero">
          <p className="share-card-brand">易定观象 · 传统文化互动体验</p>
          <div className="share-card-title-row">
            <h2>{baseHexagramName}</h2>
            {baseHexagramNumber ? <span>第{baseHexagramNumber}卦</span> : null}
          </div>
          <ShareHexagramDiagram lines={lines} />
        </header>

        <section className="share-card-reading">
          <div className="share-card-question">
            <p>本次问题</p>
            <p>{question}</p>
          </div>
          <div className="share-card-reference">
            <p className="share-card-status">{hasChange ? "本次为变卦" : "本次为静卦"}</p>
            <p className="share-card-path">{referencePath}</p>
          </div>
          {reading ? (
            <div className="share-card-reading-note">
              <p><span>一句话参照：</span>{reading}</p>
            </div>
          ) : null}
        </section>

        <footer className="share-card-footer">
          <p>仅作传统文化学习与问题参照，慎断是非。</p>
        </footer>
      </div>
    </article>
  );
}
