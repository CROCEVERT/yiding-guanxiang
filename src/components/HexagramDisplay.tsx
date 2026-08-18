import type { Hexagram } from "../types";

type HexagramDisplayProps = {
  hexagram: Hexagram;
  label: string;
};

export function HexagramDisplay({ hexagram, label }: HexagramDisplayProps) {
  return (
    <div className="ritual-panel p-4">
      <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-bronze/82">{label}</p>
      <div className="flex items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-[2px] border border-bronze/35 bg-ink font-display text-4xl font-bold text-bronze">
          {hexagram.symbol}
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold text-parchment">{hexagram.name}</h3>
          <p className="text-sm font-medium text-parchment/62">{hexagram.theme}</p>
        </div>
      </div>
    </div>
  );
}
