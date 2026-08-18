import { useState } from "react";

type QuestionPageProps = {
  category: string;
  question: string;
  onCategoryChange: (category: string) => void;
  onQuestionChange: (question: string) => void;
  onOpenNotice: () => void;
  onStart: () => void;
};

const categories = ["事业选择", "关系沟通", "项目判断", "学习成长", "人际协作", "情绪整理", "其他"];

export function QuestionPage({ category, question, onCategoryChange, onQuestionChange, onOpenNotice, onStart }: QuestionPageProps) {
  const [touched, setTouched] = useState(false);
  const trimmedQuestion = question.trim();
  const validationMessage = !trimmedQuestion
    ? "问题不能为空"
    : trimmedQuestion.length < 5
      ? "请不少于5个字，方便生成更清晰的参照。"
      : "";

  const handleStart = () => {
    setTouched(true);
    if (validationMessage) {
      return;
    }
    onStart();
  };

  return (
    <div className="space-y-4">
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-bronze/82">问题分类</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-parchment">选择一个参照方向</h1>
          </div>
          <span className="shrink-0 text-xs font-semibold text-parchment/48">可选</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((item) => {
            const selected = category === item;
            return (
              <button
                className={`rounded-[12px] border px-3 py-3 text-sm font-semibold active:translate-y-px ${
                  selected
                    ? "border-bronze bg-bronze text-ink shadow-lg shadow-bronze/15"
                    : "border-bronze/22 bg-ink/50 text-parchment/72"
                }`}
                key={item}
                onClick={() => onCategoryChange(item)}
                type="button"
              >
                {item}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-bronze/82">写下问题</p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-bronze/90">
            不少于5个字 · {question.length}/120
          </span>
        </div>
        <textarea
          className="min-h-36 w-full resize-none rounded-[14px] border border-bronze/26 bg-ink/60 p-4 text-base font-semibold leading-7 text-parchment outline-none placeholder:text-parchment/38 focus:border-bronze"
          maxLength={120}
          onBlur={() => setTouched(true)}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="例如：我是否适合接受这份工作机会？"
          value={question}
        />

        <div className="rounded-[10px] border border-bronze/24 bg-ink/56 px-3 py-3 text-xs font-semibold leading-5 text-parchment/68">
          <p className="font-bold text-bronze">填写前请注意隐私</p>
          <p className="mt-1">问题只作为本地观象记录的标题，不构成对现实问题的占断或结论。</p>
          <p className="mt-1">完成六爻后会自动保存在当前设备，最多保留 50 条。请勿填写姓名、联系方式、健康、财务、单位机密或他人隐私。</p>
          <button className="mt-2 font-bold text-bronze underline decoration-bronze/45 underline-offset-4" onClick={onOpenNotice} type="button">
            查看完整使用与隐私说明
          </button>
        </div>

        <div className="min-h-5 text-xs font-medium leading-5">
          {touched && validationMessage ? <span className="text-bronze">{validationMessage}</span> : null}
        </div>
      </section>

      <button className="w-full rounded-[14px] bg-bronze px-5 py-4 font-bold text-ink shadow-lg shadow-bronze/20 active:translate-y-px" onClick={handleStart} type="button">
        开始互动
      </button>
    </div>
  );
}
