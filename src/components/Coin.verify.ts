import { readFileSync } from "node:fs";

const assert = (condition: boolean, message: string) => {
  console.assert(condition, message);
  if (!condition) {
    throw new Error(message);
  }
};

const source = readFileSync(new URL("./Coin.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const castingSource = readFileSync(new URL("../pages/CastingPage.tsx", import.meta.url), "utf8");

assert(source.includes("coin-front-ritual.png"), "Coin should use the current front PNG asset.");
assert(source.includes("coin-back-new.png"), "Coin should use the current back PNG asset.");
assert(source.includes("coin-back-ritual.png"), "Coin should keep a back PNG fallback asset.");
assert(source.includes("onError={recoverCoinImage}"), "Coin images should recover from a failed asset request.");
assert(source.includes("spinning ?"), "Coin should keep a distinct spinning state.");
assert(source.includes("coin-static-face coin-static-front coin-idle-face"), "Spinning coins should render the front PNG without WebM alpha dependency.");
assert(source.includes("coin-static-${side}"), "Settled coins should switch between front and back PNG states.");
assert(source.includes("coin-ground-glow"), "Coins should keep the ground glow layer.");
assert(!source.includes(".webm"), "Coin component should not depend on transparent WebM video.");
assert(!source.includes("coin-face-front"), "Settled coins should not render legacy 3D front face layers.");
assert(!source.includes("coin-face-back"), "Settled coins should not render legacy 3D back face layers.");
assert(!/\.coin-static-face::after/s.test(css), "Static coin images should not add extra highlight overlays.");
assert(/\.coin-static-back img\s*\{[^}]*transform:\s*scale\(0\.9\)/s.test(css), "Back coin image should be visually scaled to match the front face.");
assert(castingSource.includes("casting-coin-strip-waiting"), "Initial coins should keep a dedicated waiting layout.");
assert(castingSource.includes("casting-shell-waiting"), "Initial shell should keep a dedicated waiting position.");
assert(castingSource.includes("casting-side-readout-waiting"), "Initial side readout should keep its dedicated position.");
assert(/\.casting-coin-strip-waiting\s*\{[^}]*gap:\s*0\.72rem[^}]*translate\(1\.5rem,\s*-1\.45rem\)/s.test(css), "Initial coin strip should keep the widened, raised spacing.");
assert(/\.casting-shell-waiting\s*\{[^}]*translateX\(-0\.8rem\)[^}]*scale\(0\.92\)/s.test(css), "Initial shell should keep the balanced right-shifted composition.");
assert(/\.casting-side-readout-waiting\s*\{[^}]*translate\(1\.2rem,\s*-50%\)/s.test(css), "Initial coin result column should keep distance from the shell.");

console.info("Coin component verification passed");
