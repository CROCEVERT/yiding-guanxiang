import turtleShellImage from "../assets/images/turtle-shell-cutout-mobile.png";

type TortoiseShellProps = {
  focused?: boolean;
  reveal?: boolean;
};

const trigramSymbols = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];

export function TortoiseShell({ focused = false, reveal = false }: TortoiseShellProps) {
  const ringDistance = focused ? "-9.1rem" : "-7.25rem";

  return (
    <div
      aria-label="龟壳与八卦纹"
      className={`ritual-float relative mx-auto aspect-[0.92/1] ${focused ? "w-80 max-w-full" : "w-64 max-w-full"}`}
      role="img"
    >
      <div className="shell-warm-aura pointer-events-none absolute inset-[7%] rounded-full" />
      <div className="pointer-events-none absolute inset-[6%] rounded-full border border-dashed border-bronze/20" />

      <div className={`${reveal ? "reveal-ring" : "slow-turn"} pointer-events-none absolute inset-[2%] rounded-full`}>
        {trigramSymbols.map((symbol, index) => (
          <span
            className="absolute left-1/2 top-1/2 font-display text-[11px] font-bold text-bronze/70"
            key={symbol}
            style={{
              transform: `rotate(${index * 45}deg) translateY(${ringDistance}) rotate(-${index * 45}deg)`,
              transformOrigin: "0 0",
            }}
          >
            {symbol}
          </span>
        ))}
      </div>

      <img
        alt=""
        className={`turtle-artifact relative z-[1] h-full w-full object-contain ${focused ? "scale-[1.03]" : ""}`}
        draggable={false}
        src={turtleShellImage}
      />

      <div
        className={`shell-inner-light pointer-events-none absolute left-1/2 top-[46%] z-[2] h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full ${
          reveal ? "shell-inner-reveal" : ""
        }`}
      />
    </div>
  );
}
