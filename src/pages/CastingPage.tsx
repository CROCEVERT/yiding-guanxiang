import { useEffect, useRef, useState } from "react";
import { Coin } from "../components/Coin";
import { TortoiseShell } from "../components/TortoiseShell";
import type { LineRecord } from "../types";
import { formatCoinSide, lineKindLabel } from "../utils/insight";

type CastingPageProps = {
  lines: LineRecord[];
  onCreateLine: () => void;
  onReveal: () => void;
};

const coinSlots = [0, 1, 2];
const lineNames = ["初", "二", "三", "四", "五", "上"];
const isYangLine = (line: LineRecord) => line.total === 7 || line.total === 9;
const getLineCoreLabel = (line: LineRecord) => lineKindLabel[line.kind].split(" · ")[0];
const formatLinePosition = (line: LineRecord | undefined, index: number) => {
  if (!line) {
    return lineNames[index];
  }

  if (index === 0) {
    return isYangLine(line) ? "初九" : "初六";
  }

  if (index === 5) {
    return isYangLine(line) ? "上九" : "上六";
  }

  return `${isYangLine(line) ? "九" : "六"}${lineNames[index]}`;
};

function HexLine({ line }: { line?: LineRecord }) {
  if (!line) {
    return <div className="h-2.5 flex-1 bg-parchment/10" />;
  }

  if (isYangLine(line)) {
    return <div className="h-2.5 flex-1 bg-bronze shadow-[0_0_14px_rgba(211,157,83,0.36)]" />;
  }

  return (
    <div className="flex flex-1 gap-2.5">
      <div className="h-2.5 flex-1 bg-bronze/95 shadow-[0_0_12px_rgba(211,157,83,0.24)]" />
      <div className="h-2.5 flex-1 bg-bronze/95 shadow-[0_0_12px_rgba(211,157,83,0.24)]" />
    </div>
  );
}

function CompactHexagram({ lines }: { lines: LineRecord[] }) {
  const slots = Array.from({ length: 6 }, (_, index) => lines[index]);

  return (
    <div className="grid flex-1 gap-2">
      {slots
        .map((line, index) => ({ line, index }))
        .reverse()
        .map(({ line, index }) => (
          <div className="flex items-center gap-2.5" key={lineNames[index]}>
            <span className="w-8 text-right text-[11px] font-bold leading-none text-parchment/78">
              {formatLinePosition(line, index)}
            </span>
            <HexLine line={line} />
          </div>
        ))}
    </div>
  );
}

export function CastingPage({ lines, onCreateLine, onReveal }: CastingPageProps) {
  const [coinsEntering, setCoinsEntering] = useState(false);
  const [shellShaking, setShellShaking] = useState(false);
  const [readoutVisible, setReadoutVisible] = useState(true);
  const coinTimerRef = useRef<number | undefined>(undefined);
  const shellTimerRef = useRef<number | undefined>(undefined);
  const readoutTimerRef = useRef<number | undefined>(undefined);
  const latest = lines[lines.length - 1];
  const isComplete = lines.length >= 6;

  useEffect(() => {
    return () => {
      window.clearTimeout(coinTimerRef.current);
      window.clearTimeout(shellTimerRef.current);
      window.clearTimeout(readoutTimerRef.current);
    };
  }, []);

  const clearMotionTimers = () => {
    window.clearTimeout(coinTimerRef.current);
    window.clearTimeout(shellTimerRef.current);
    window.clearTimeout(readoutTimerRef.current);
  };

  const createNextLine = () => {
    if (isComplete) {
      return;
    }

    clearMotionTimers();
    setCoinsEntering(true);
    setShellShaking(true);
    setReadoutVisible(false);
    onCreateLine();
    coinTimerRef.current = window.setTimeout(() => setCoinsEntering(false), 860);
    shellTimerRef.current = window.setTimeout(() => setShellShaking(false), 760);
    readoutTimerRef.current = window.setTimeout(() => setReadoutVisible(true), 1060);
  };

  const handlePrimaryAction = () => {
    if (isComplete) {
      onReveal();
      return;
    }

    createNextLine();
  };

  const buttonLabel = isComplete ? "查看易象" : lines.length === 0 ? "轻触铜盘" : "继续生成";
  const helperText = lines.length === 0 ? "轻触铜盘，生成第 1 次符号" : "轻触铜盘，生成本次符号";

  return (
    <div className="space-y-4">
      <section className="ritual-panel no-panel-corners p-3">
        <div className="flex items-start gap-4">
          <div className="w-[35%] shrink-0 pt-0.5">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold tracking-[0.2em] text-bronze/82">六爻生成</p>
              <span className="font-display text-sm font-bold text-bronze">{lines.length}/6</span>
            </div>
            <h1 className="mt-1 font-display text-4xl font-bold leading-none text-parchment">观象</h1>
            <div className="mt-3 h-[3px] w-full overflow-hidden rounded-none bg-parchment/8">
              <div
                className="h-full rounded-none bg-gradient-to-r from-bronze/60 to-bronze transition-all duration-700"
                style={{ width: `${(lines.length / 6) * 100}%` }}
              />
            </div>
          </div>

          <CompactHexagram lines={lines} />
        </div>
      </section>

      <button
        className="casting-stage block w-full overflow-hidden px-0 pb-0 pt-0 text-center"
        disabled={isComplete}
        onClick={!isComplete ? createNextLine : undefined}
        type="button"
      >
        <div className="relative mx-auto flex min-h-[22.5rem] w-full items-center justify-start overflow-hidden">
          <div
            className={`w-[74%] max-w-[20.5rem] -translate-x-8 scale-[0.92] transition-transform ${
              latest ? "" : "casting-shell-waiting"
            }`}
          >
            <div className={shellShaking ? "shell-shake" : ""}>
              <TortoiseShell focused />
            </div>
          </div>
          <div className={`casting-side-readout ${latest ? "" : "casting-side-readout-waiting"}`}>
            <div className={`casting-reading-card ${readoutVisible && latest ? "readout-visible" : "readout-hidden"}`}>
              {latest ? (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.14em] text-bronze/74">本次符号</p>
                      <p className="mt-1 whitespace-nowrap font-display text-base font-bold leading-none text-parchment">
                        第 {latest.round} 次 · {isYangLine(latest) ? "阳爻" : "阴爻"}
                      </p>
                    </div>
                    <div className="casting-total-value">
                      <strong>{latest.total}</strong>
                    </div>
                  </div>
                  <div className="casting-status-pill">
                    <span>{getLineCoreLabel(latest)}</span>
                    <strong>{latest.isChanging ? "变化爻" : "稳定爻"}</strong>
                  </div>
                </>
              ) : null}
            </div>

            <div className={`casting-coin-strip ${latest ? "" : "casting-coin-strip-waiting"} ${!latest && !coinsEntering ? "casting-coin-strip-floating" : ""}`}>
              {(latest?.coins ?? coinSlots).map((coin) =>
                typeof coin === "number" ? (
                  <div className="casting-coin-row-item" key={`waiting-${coin}`}>
                    <div className={`casting-coin-motion ${coinsEntering ? "coins-enter-shell" : ""}`}>
                      <Coin spinning />
                    </div>
                  </div>
                ) : (
                  <div className="casting-coin-row-item" key={coin.id}>
                    <div className={`casting-coin-motion ${coinsEntering ? "coins-enter-shell" : ""}`}>
                      <Coin settled side={coin.side} />
                    </div>
                    <span className={`casting-coin-value ${readoutVisible ? "readout-visible" : "readout-hidden"}`}>
                      {formatCoinSide(coin.side)}
                      <strong>{coin.value}</strong>
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
        <p className={`casting-helper-text ${readoutVisible ? "readout-visible" : "readout-hidden"}`}>{helperText}</p>
      </button>

      <button className="bronze-button w-full px-5 py-4 font-bold text-ink active:translate-y-px" onClick={handlePrimaryAction} type="button">
        {buttonLabel}
      </button>
    </div>
  );
}
