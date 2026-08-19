# 易定观象｜正式发布准备清单

更新日期：2026-08-18

这份清单只用于把已验收的本地版本变成可公开下载的正式桌面版。当前项目没有后端、账号、支付或 AI API；签名证书也与这些功能无关。签名的目的，是让系统和用户能核验安装包确实来自项目维护者、且发布后未被篡改。

## 先做的事

1. 在 GitHub 新建**空的公开仓库**，建议名称为 `yiding-guanxiang`；创建时不要自动添加 README、License 或 `.gitignore`，以免与本地历史冲突。添加为本地项目的远端后，先推送普通分支，不要推送 `v*` 标签。
2. 仅提交源码和文档，绝不提交 `.p12`、`.pfx`、`.p8`、证书密码或 `.env` 文件。上传前运行 `npm run build` 与公开源码检查。
3. 在 GitHub 仓库设置中开启私密漏洞报告；按 GitHub 当前可用项开启 Secret scanning／push protection，并确认 `SECURITY.md` 可见。
4. 源码公开与桌面安装包发布分开进行：可以先公开源码；若发布未签名安装包，只能作为 GitHub Pre-release 的“未签名体验版”，不得称为正式版、已认证版或安全无提示版，并必须附 SHA-256 与来源提醒。
5. 以普通用户身份分别在一台 Windows 与一台 macOS 上完成完整观象、记录删除、离线使用和卸载测试。

## macOS 直接发布（DMG / ZIP）

需要 Apple Developer Program 的 **Developer ID Application** 证书，以及用于公证的 Apple 凭据。导出带私钥的 `.p12` 后，将其内容和密码只存到 GitHub Actions Secrets：

- `MAC_CSC_LINK`：`.p12` 证书的 base64 内容或受控证书地址；
- `MAC_CSC_KEY_PASSWORD`：该证书的导出密码；
- `APPLE_ID`：用于公证的 Apple ID；
- `APPLE_APP_SPECIFIC_PASSWORD`：该 Apple ID 的 app-specific password；
- `APPLE_TEAM_ID`：Apple Developer Team ID。

工作流会使用 Developer ID 签名、Hardened Runtime、公证并验证已装订的票据。请在公开前检查 Apple 的公证日志和真实下载后的首次启动提示；不能用开发证书或 ad-hoc 签名代替 Developer ID。

## Windows 直接发布（EXE）

需要可信的 Authenticode 代码签名证书（例如经合规 CA 获取的证书，或 Microsoft Azure Trusted Signing）。若使用 `.pfx`，只将下列内容存到 GitHub Actions Secrets：

- `WIN_CSC_LINK`：`.pfx` 证书的 base64 内容或受控证书地址；
- `WIN_CSC_KEY_PASSWORD`：该证书密码。

正式构建会对所有 `.exe` 再执行 Authenticode 验证。未签名版本可作为公开体验包，但只能标为“未签名体验版”；Windows 可能显示未知发布者或 SmartScreen 提示，使用者需自行核对本仓库来源与 SHA-256。

## 构建与发布次序

1. 未签名体验包：手动触发 `Desktop Release` workflow，保持 `signed_release = false`，只取回构建工件验收；本机与干净设备测试后，人工创建 GitHub Pre-release，上传文件和 SHA-256，并使用明确的未签名说明。
2. 配好所有所需 Secrets 后，手动触发 `signed_release = true`，检查两端签名/公证验证均通过。
3. 下载工件，在干净设备上安装并复验；为每个成品计算 SHA-256，写明版本号、功能变更、数据本地保存边界和免责声明变更。
4. 人工创建 GitHub Draft Release，上传已验收的文件及校验和；审阅无误后再点击发布。
5. 只有签名、公证与对应验证全部通过，才可推送 `signed-v*` 标签；该标签工作流会把签名、公证设为硬性条件，缺少配置即失败。

## 凭据安全规则

- 证书、密码、Apple 私钥只放 GitHub Actions Secrets、受控密码库或本机钥匙串；不要发到聊天、Issue、截图、代码、文档或 Release 附件。
- 任何人拿到 Windows 证书私钥或 Apple Developer ID 私钥，都可能伪装成发布者；疑似泄露时应立即吊销并重签后续版本。
- 未来若接入在线服务，客户端仍不得保存服务端 API 密钥；必须加入账户、额度、速率限制、审计、异常告警和可关闭的费用上限。
