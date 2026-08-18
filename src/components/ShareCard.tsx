import React from "react";

void React;

type ShareCardProps = {
  baseHexagramName: string;
  changedHexagramName: string;
};

export function ShareCard({ baseHexagramName, changedHexagramName }: ShareCardProps) {
  return (
    <article className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-[12px] border border-bronze/45 bg-[#0b0805] p-5 text-parchment shadow-[0_28px_90px_rgba(0,0,0,0.72)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(201,160,99,0.24),transparent_34%),linear-gradient(180deg,rgba(255,230,180,0.08),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-3 rounded-[6px] border border-bronze/18" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-bronze/80">易定观象</p>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-parchment">一次《易经》文化参照</h2>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] border border-bronze/35 bg-bronze/10 font-display text-2xl font-bold text-bronze">
            象
          </div>
        </div>

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-bronze/36 to-transparent" />

        <div className="space-y-3">
          <section className="rounded-[8px] border border-bronze/24 bg-parchment/[0.04] p-4">
            <p className="text-xs font-semibold text-parchment/52">当前参照</p>
            <p className="mt-1 font-display text-2xl font-bold text-parchment">{baseHexagramName}</p>
          </section>
          <section className="rounded-[8px] border border-bronze/24 bg-parchment/[0.04] p-4">
            <p className="text-xs font-semibold text-parchment/52">变化参照</p>
            <p className="mt-1 font-display text-2xl font-bold text-parchment">{changedHexagramName}</p>
          </section>
        </div>

        <p className="mt-6 text-sm font-semibold leading-7 text-parchment/78">
          基于经典文本与传统象义整理，仅供文化学习与问题参照。
        </p>

        <div className="mt-6 border-t border-bronze/18 pt-4 text-center text-xs font-semibold tracking-[0.12em] text-bronze/82">
          免费传统文化学习工具｜不展示个人问题
        </div>
      </div>
    </article>
  );
}
