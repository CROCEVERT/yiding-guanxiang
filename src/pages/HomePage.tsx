import { TortoiseShell } from "../components/TortoiseShell";
import coinFrontImage from "../assets/images/coin-front-ritual.png";
import type { PageKey } from "../types";

type HomePageProps = {
  onNavigate: (page: PageKey) => void;
  onOpenNotice: () => void;
};

const homeCoins = [0, 1, 2];

export function HomePage({ onNavigate, onOpenNotice }: HomePageProps) {
  return (
    <div className="space-y-5">
      <section className="relative min-h-[31.5rem] overflow-hidden bg-ink/54 px-6 py-7 shadow-[0_18px_60px_rgba(0,0,0,0.3)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_42%,rgba(220,167,83,0.16),transparent_34%),linear-gradient(180deg,rgba(236,222,190,0.05),transparent_68%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-60 bg-[radial-gradient(circle_at_50%_100%,rgba(189,135,62,0.18),transparent_66%)]" />
        <div className="pointer-events-none absolute left-6 top-7 h-16 w-px bg-gradient-to-b from-bronze/70 to-transparent" />
        <div className="pointer-events-none absolute bottom-7 right-6 h-px w-28 bg-gradient-to-l from-bronze/50 to-transparent" />

        <div className="pointer-events-none absolute -right-5 bottom-[7.2rem] z-0 w-52 opacity-[0.16] blur-[0.15px]">
          <TortoiseShell />
        </div>

        <div className="relative z-10 flex min-h-[28.5rem] flex-col">
          <p className="mt-2 text-sm font-bold tracking-[0.22em] text-bronze/88">
            经典文本 · 象义整理 · 自我审视
          </p>

          <p className="mt-6 text-sm font-bold tracking-[0.24em] text-bronze/86">
            以象明理 · 以问自省
          </p>

          <h1 className="mt-3 font-display text-[4.85rem] font-bold leading-[0.9] tracking-[0.04em] text-parchment drop-shadow-[0_14px_28px_rgba(0,0,0,0.66)]">
            易定
            <br />
            观象
          </h1>

          <div className="mt-7 max-w-[21rem] border-l-2 border-bronze/55 bg-black/28 px-5 py-4 shadow-[inset_18px_0_36px_rgba(0,0,0,0.3)]">
            <p className="text-lg font-bold leading-8 text-parchment">
              展示《易经》经典文本、传统象义与六爻符号。
            </p>
            <p className="mt-2 text-sm font-semibold leading-7 text-parchment/74">
              写下问题，从文本与象义中获得一个用于自我审视的观察角度。
            </p>
            <div className="mt-5 flex items-center gap-5 opacity-70">
              {homeCoins.map((coin, index) => (
                <img
                  alt=""
                  aria-hidden="true"
                  className="home-coin-still h-14 w-14 object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.62)]"
                  draggable={false}
                  key={coin}
                  src={coinFrontImage}
                  style={{ animationDelay: `${index * 180}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[14px] border border-bronze/28 bg-ink/58 p-5 shadow-[inset_0_1px_0_rgba(255,232,175,0.08)]">
        <h2 className="font-display text-[2rem] font-bold tracking-[0.06em] text-parchment">传统文化互动体验</h2>
        <p className="mt-4 text-sm font-medium leading-7 text-parchment/72">
          它呈现《易经》文本、六爻符号与现代阅读参照，帮助你整理问题；重要判断仍应回到事实、当事人意愿与专业意见。
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-[9px] border border-bronze/20 bg-black/20 px-3 py-3">
            <p className="text-base font-bold text-bronze">当前版本免费使用</p>
            <p className="mt-1 text-xs font-medium leading-5 text-parchment/56">无付费讲解、咨询、代看或代操作</p>
          </div>
          <div className="rounded-[9px] border border-bronze/20 bg-black/20 px-3 py-3">
            <p className="text-base font-bold text-parchment">本地保存</p>
            <p className="mt-1 text-xs font-medium leading-5 text-parchment/56">无需登录，不设云同步或应用内上传</p>
          </div>
        </div>
        <button className="mt-4 text-sm font-bold text-bronze underline decoration-bronze/45 underline-offset-4" onClick={onOpenNotice} type="button">
          查看使用、隐私与免费说明
        </button>
      </section>

      <button
        className="w-full rounded-[12px] bg-bronze px-5 py-4 text-lg font-bold text-ink shadow-lg shadow-bronze/20 active:translate-y-px"
        onClick={() => onNavigate("question")}
        type="button"
      >
        开始互动
      </button>

      <button
        className="outline-button w-full border border-bronze/34 px-5 py-3 text-base font-bold text-bronze active:translate-y-px"
        onClick={() => onNavigate("preview")}
        type="button"
      >
        样板预览
      </button>

      <p className="mx-auto max-w-sm text-center text-sm font-semibold leading-6 text-parchment/68">仅作传统文化学习与问题参照，不构成现实结果判断。</p>
    </div>
  );
}
