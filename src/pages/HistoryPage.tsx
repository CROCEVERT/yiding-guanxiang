import type { HistoryEntry, PageKey } from "../types";
import { MAX_HISTORY_ENTRIES } from "../utils/storage";

type HistoryPageProps = {
  entries: HistoryEntry[];
  onClear: () => void;
  onDelete: (id: string) => void;
  onNavigate: (page: PageKey) => void;
  onView: (entry: HistoryEntry) => void;
};

const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
const formatMovingLines = (movingLines: number[]) => {
  if (movingLines.length === 0) {
    return "无";
  }

  return movingLines.map((lineNumber) => lineNames[lineNumber - 1]).join("、");
};

export function HistoryPage({ entries, onClear, onDelete, onNavigate, onView }: HistoryPageProps) {
  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.22em] text-bronze">观象记录</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-parchment">复盘轨迹</h2>
          <p className="mt-3 text-sm font-medium leading-7 text-parchment/68">
            自动保存在当前设备，最多保留 {MAX_HISTORY_ENTRIES} 份；可逐条删除或清空全部。
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-parchment/48">如使用共享设备，请在离开前删除记录；清除站点数据或卸载应用也可能移除本地记录。</p>
        </div>
        {entries.length > 0 ? (
          <button className="outline-button shrink-0 border border-bronze/30 px-3 py-2 text-xs font-semibold text-bronze active:translate-y-px" onClick={onClear} type="button">
            清空全部
          </button>
        ) : null}
      </section>

      {entries.length === 0 ? (
        <section className="ritual-panel p-6 text-center">
          <p className="text-sm font-medium leading-7 text-parchment/64">还没有保存记录。</p>
          <button className="bronze-button mt-5 px-5 py-3 text-sm font-bold text-ink" onClick={() => onNavigate("question")} type="button">
            开始互动
          </button>
        </section>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <article className="ritual-panel space-y-3 p-4" key={entry.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="rounded-[6px] border border-bronze/24 px-2 py-1 text-[11px] font-bold text-bronze">
                      第 {index + 1} / {MAX_HISTORY_ENTRIES} 份
                    </p>
                    <p className="text-xs font-medium text-bronze/76">{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-2 inline-flex rounded-[6px] border border-bronze/20 px-2 py-1 text-[11px] font-semibold text-parchment/58">
                    {entry.category}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold leading-6 text-parchment/84">{entry.question}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 rounded-[8px] border border-bronze/16 bg-ink/50 p-3 text-xs font-medium leading-6">
                <div className="flex justify-between gap-3">
                  <span className="text-parchment/48">当前参照</span>
                  <span className="text-parchment/86">{entry.baseHexagramName}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-parchment/48">变化爻</span>
                  <span className="text-parchment/86">{formatMovingLines(entry.movingLines)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-parchment/48">变化参照</span>
                  <span className="text-parchment/86">{entry.changedHexagramName}</span>
                </div>
              </div>

              <p className="text-sm font-medium leading-7 text-parchment/68">{entry.summary}</p>

              <div className="grid grid-cols-2 gap-3">
                <button className="bronze-button px-4 py-3 text-sm font-bold text-ink active:translate-y-px" onClick={() => onView(entry)} type="button">
                  查看详情
                </button>
                <button
                  className="outline-button border border-bronze/30 px-4 py-3 text-sm font-semibold text-bronze active:translate-y-px"
                  onClick={() => onDelete(entry.id)}
                  type="button"
                >
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
