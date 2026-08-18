import type { PageKey } from "../types";
import type { ReactNode } from "react";
import ritualBackground from "../assets/images/ritual-background.jpg";

type ShellProps = {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  onOpenNotice: () => void;
  children: ReactNode;
};

const navItems: { key: PageKey; label: string }[] = [
  { key: "home", label: "\u9996\u9875" },
  { key: "question", label: "\u4e92\u52a8" },
  { key: "history", label: "\u8bb0\u5f55" },
];

export function Shell({ currentPage, onNavigate, onOpenNotice, children }: ShellProps) {
  return (
    <div className="min-h-screen bg-ink text-parchment">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden border-x border-bronze/10 bg-lacquer/95 shadow-ritual">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.2] blur-[0.5px] saturate-75"
          style={{ backgroundImage: `url(${ritualBackground})` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/52 via-lacquer/86 to-ink/96" />
        <header className="sticky top-0 z-10 border-b border-bronze/15 bg-ink/86 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-bronze/82">{"\u4f20\u7edf\u6587\u5316\u4f53\u9a8c \u00b7 \u95ee\u9898\u53c2\u7167"}</p>
              <h1 className="font-display text-xl font-bold text-parchment">{"\u6613\u5b9a\u89c2\u8c61"}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button className="rounded-[10px] border border-bronze/26 px-2.5 py-1.5 text-xs font-semibold text-parchment/72" onClick={onOpenNotice} type="button">
                说明
              </button>
              <button
                className="rounded-[10px] border border-bronze/40 px-3 py-1.5 text-xs font-semibold text-bronze"
                onClick={() => onNavigate("history")}
                type="button"
              >
                {"\u8bb0\u5f55"}
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-[1] flex-1 px-5 pb-24 pt-5">
          <div className="soft-enter" key={currentPage}>
            {children}
          </div>
        </main>

        <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-md -translate-x-1/2 grid-cols-3 border-t border-bronze/15 bg-ink/92 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_40px_rgba(0,0,0,0.45)] backdrop-blur">
          {navItems.map((item) => (
            <button
              className={`rounded-[10px] px-3 py-2 text-sm font-semibold transition ${
                currentPage === item.key
                  ? "bg-bronze text-ink"
                  : "text-parchment/70 hover:bg-bronze/10 hover:text-parchment"
              }`}
              key={item.key}
              onClick={() => onNavigate(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
