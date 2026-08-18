import type { LineRecord } from "../types";
import { lineKindLabel } from "../utils/insight";

type LineDisplayProps = {
  lines: LineRecord[];
};

const isYang = (line: LineRecord) => line.total === 7 || line.total === 9;
const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];

function LineShape({ line }: { line: LineRecord }) {
  if (isYang(line)) {
    return <div className="h-3 flex-1 rounded-none bg-bronze shadow-[0_0_14px_rgba(211,157,83,0.34)]" />;
  }

  return (
    <div className="flex flex-1 gap-4">
      <div className="h-3 flex-1 rounded-none bg-bronze/90 shadow-[0_0_14px_rgba(211,157,83,0.28)]" />
      <div className="h-3 flex-1 rounded-none bg-bronze/90 shadow-[0_0_14px_rgba(211,157,83,0.28)]" />
    </div>
  );
}

export function LineDisplay({ lines }: LineDisplayProps) {
  const slots = Array.from({ length: 6 }, (_, index) => lines[index]);

  return (
    <div className="ritual-panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-parchment">六爻生成区</h2>
        <span className="rounded-[6px] border border-bronze/26 px-3 py-1 text-xs font-bold text-bronze">{lines.length}/6</span>
      </div>
      <div className="flex flex-col-reverse gap-3">
        {slots.map((line, index) => (
          <div className="flex min-h-8 items-center gap-3" key={lineNames[index]}>
            <span className="w-9 text-sm font-semibold text-parchment/62">{lineNames[index]}</span>
            {line ? (
              <div className="line-pop flex flex-1 items-center gap-3">
                <LineShape line={line} />
                <span className="w-24 text-right text-xs font-semibold text-parchment/78">{lineKindLabel[line.kind]}</span>
              </div>
            ) : (
              <div className="h-3 flex-1 rounded-none bg-parchment/14" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
