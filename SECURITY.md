# 易定观象｜安全说明

更新日期：2026-08-13

## 当前版本的安全边界

- 没有 OpenAI 或其他人工智能 API 调用；
- 没有 API 密钥、支付、登录、云端数据库、广告或分析 SDK；
- 没有运行时网络请求；
- 桌面端仅加载随应用打包的本地页面，关闭 Node.js 注入，启用上下文隔离和沙箱；
- 桌面端默认拒绝摄像头、麦克风、定位、通知等权限请求，拒绝应用内导航与新窗口。

因此，下载或使用当前版本不会消耗项目维护者的 API 额度。未来若增加在线服务，绝不应把服务端密钥放进桌面客户端、网页源码或公开仓库；应使用受控服务端代理、用户鉴权、单用户限额、速率限制、审计与可关闭的费用上限。

## 发布前仍需完成

- macOS：使用 Apple Developer ID 签名并完成公证；
- Windows：使用可信代码签名证书签名安装包与可执行文件；
- 每次发布前更新 Electron 和依赖，并执行依赖漏洞审计；
- 在 GitHub Release 中发布校验和（SHA-256）和版本说明；
- 公开维护邮箱或 GitHub Security Advisory 联系路径。

## 已配置的正式发布防呆

- `.github/workflows/desktop-release.yml` 只读仓库，不会自动创建 Release、推送提交或写入仓库；
- 手动构建可用于验收；推送 `v*` 标签则会强制要求 macOS 签名/公证与 Windows 签名；
- 缺少证书、密码或 Apple 公证凭据时，正式构建会失败，不能悄悄产出未签名“正式版”；
- Windows 成品会用 Authenticode 再验签；macOS 成品会验签、Gatekeeper 评估并验证已装订的公证票据；
- 证书、私钥、`.env` 和 Apple API 密钥已被 `.gitignore` 排除，只能进入本机受控凭据或 GitHub Actions Secrets。

当前检查结果：本机没有有效代码签名身份，项目也还没有 GitHub 远端。因此上述流程已经准备好，但尚不能执行真正的签名、公证或发布。具体准备清单见 [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)。

## 报告安全问题

请勿在公开 Issue 中披露可被立即利用的漏洞、密钥、记录内容或个人数据。

首次公开仓库前，维护者应在 GitHub 的 `Settings → Advanced Security` 启用 **Private vulnerability reporting**。启用后，请通过仓库 `Security` 页的 “Report a vulnerability” 私密提交；普通功能建议与公开 Bug 可使用 Issue。若该私密入口尚未启用，请不要公开漏洞细节，等待维护者补充安全联系渠道后再提交。
