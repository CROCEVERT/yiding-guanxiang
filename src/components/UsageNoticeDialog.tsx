type UsageNoticeDialogProps = {
  initial: boolean;
  onAccept: () => void;
  onClose: () => void;
};

export function UsageNoticeDialog({ initial, onAccept, onClose }: UsageNoticeDialogProps) {
  const close = initial ? onAccept : onClose;

  return (
    <div className="notice-overlay">
      <section aria-labelledby="notice-title" aria-modal="true" className="notice-dialog" role="dialog">
        <header className="notice-header">
          <p className="notice-kicker">传统文化互动体验 · 使用与隐私说明</p>
          <h2 className="notice-title" id="notice-title">
            {initial ? "使用前请先了解" : "使用与隐私说明"}
          </h2>
          <p className="notice-lead">以《易经》文本与象义为参照，整理问题，回到现实中独立判断。</p>
        </header>

        <div className="notice-copy">
          <section className="notice-section">
            <p className="notice-section-title">这是一款什么工具</p>
            <p>易定观象通过铜钱互动呈现六爻符号、经典文本和传统象义，供传统文化学习、问题整理与自我审视使用。</p>
          </section>

          <section className="notice-section">
            <p className="notice-section-title">它不会替你作决定</p>
            <p>“吉”“凶”等属于经典原文用语。页面内容不是对现实结果的预言，也不会替任何人判断未来、安排时日、改变运气或代替当事人作决定。</p>
            <p className="notice-subtle">涉及安全、疾病、法律、投资、财务或其他重要事项，请以事实、正式程序和专业意见为准。</p>
          </section>

          <section className="notice-section">
            <p className="notice-section-title">问题与记录只留在当前设备</p>
            <p>当前版本无需登录，不设云同步或应用内数据上传。完成六爻后，问题标题、分类、时间和观象记录会自动保存到当前设备，最多 50 条。</p>
            <p className="notice-subtle">请勿填写姓名、联系方式、证件、病历、账户、单位机密或他人隐私。共享设备请及时删除记录；清除站点数据或卸载应用也可能使记录丢失。</p>
          </section>

          <section className="notice-section notice-section-highlight">
            <p className="notice-section-title">费用说明</p>
            <p><strong>当前版本免费使用。</strong>不提供付费讲解、付费咨询、代看或代操作服务；请勿向任何个人或第三方支付相关费用。</p>
          </section>
        </div>

        <footer className="notice-footer">
          <button className="notice-button" onClick={close} type="button">
            {initial ? "我已了解，开始体验" : "关闭说明"}
          </button>
        </footer>
      </section>
    </div>
  );
}
