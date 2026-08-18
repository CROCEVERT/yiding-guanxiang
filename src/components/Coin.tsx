import type { SyntheticEvent } from "react";
import type { CoinSide } from "../types";
import coinBackFallbackImage from "../assets/images/coin-back-ritual.png";
import coinBackImage from "../assets/images/coin-back-new.png";
import coinFrontImage from "../assets/images/coin-front-ritual.png";

type CoinProps = {
  side?: CoinSide;
  spinning?: boolean;
  settled?: boolean;
};

export function Coin({ side = "front", spinning = false, settled = false }: CoinProps) {
  const sideLabel = side === "front" ? "铜钱正面" : "铜钱反面";
  const coinImage = side === "front" ? coinFrontImage : coinBackImage;

  const recoverCoinImage = (event: SyntheticEvent<HTMLImageElement>) => {
    const fallbackImage = side === "back" ? coinBackFallbackImage : coinFrontImage;
    if (event.currentTarget.src !== fallbackImage) {
      event.currentTarget.src = fallbackImage;
    }
  };

  return (
    <div aria-label={spinning ? "旋转铜钱" : sideLabel} className={`coin-stage ${settled ? "coin-settle" : ""}`} role="img">
      {spinning ? (
        <div className="coin-static-face coin-static-front coin-idle-face">
          <img alt="" draggable={false} onError={recoverCoinImage} src={coinFrontImage} />
        </div>
      ) : (
        <div className={`coin-static-face coin-static-${side}`}>
          <img alt="" draggable={false} onError={recoverCoinImage} src={coinImage} />
        </div>
      )}
      <div className="coin-ground-glow" />
    </div>
  );
}
