# 易定观象

「易定观象」是一款离线运行的《易经》传统文化互动体验工具。它通过铜钱互动呈现六爻符号、卦名、经典原文、象义整理与现代阅读参照，供传统文化学习、整理问题和自我审视使用。

页面内容不用于判断未来、安排时日、改变运气或替用户作现实决定；也不替代法律、医疗、投资、心理咨询等专业意见。重要事情请回到可核实的事实、正式程序与专业意见。

## 公开源码与使用边界

本仓库公开源代码，便于学习、审阅与共同发现问题；这不等于授予商业使用、收费服务或二次发行许可。代码、界面、文案、整理数据与素材的具体使用边界见 [LICENSE.md](./LICENSE.md) 与 [NOTICE.md](./NOTICE.md)。

## 免费声明

当前版本免费开放使用，不提供付费讲解、付费咨询、代看、代操作或任何形式的收费服务。请勿向任何个人或第三方支付相关费用。

当前版本为免费、非商业参考版本。任何人不得以本项目名义承诺现实结果、索取费用或要求提交敏感信息。

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址：

```txt
http://127.0.0.1:5173/
```

手机预览时，需要电脑和手机连接同一个局域网，并使用 Vite 输出的局域网地址，而不是 `127.0.0.1`。

## 构建网页版本

```bash
npm run build
```

构建产物在 `dist/`。

## 桌面版

本项目已加入 Electron 桌面壳。

开发预览：

```bash
npm run desktop:dev
```

Windows 打包：

```bash
npm run dist:win
```

macOS 打包：

```bash
npm run dist:mac
```

注意：macOS 应用建议在 macOS 或 GitHub Actions 的 `macos-latest` 环境中打包；Windows 本机通常不适合直接产出可用的 macOS 安装包。

本地验收时，先打开 `release/mac-arm64/易定观象.app`，确认应用能启动并完成完整观象流程；再检查 `release/` 中生成的 `.dmg` 与 `.zip`。

### 未签名体验包

项目可以发布明确标注为“未签名体验版”的免费安装包，但它不是“已认证正式版”：macOS 可能阻止首次打开，Windows 可能显示“未知发布者”或 SmartScreen 提示。请只从本仓库的 GitHub Release 下载，并核对 Release 中公布的 SHA-256；不要因系统提示而关闭系统安全设置、输入密码给第三方，或从搬运站下载同名文件。

未签名体验包仍须通过完整观象、记录保存、离线使用、卸载与下载后校验；Release 说明必须明确“未签名”“本地保存”“不含线上服务”“不构成现实判断”。获得对应平台的签名与公证后，才会另行发布签名版。

## GitHub 自动打包

仓库包含 `.github/workflows/desktop-release.yml`。手动触发 workflow 可生成验收构建；只有推送 `signed-v*` 标签才会按正式发布标准强制 macOS 签名/公证与 Windows 签名验证。该 workflow 只上传构建工件，**不会自动创建 GitHub Release 或公开发布**。

未签名体验版也必须经过本地和干净设备验收；在配置 Apple Developer 身份与 Windows 代码签名证书之前，请勿推送 `signed-v*` 标签。详细准备方式见 [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)。

仓库名称、简介、GitHub 设置和首次上传步骤见 [PUBLISHING.md](./PUBLISHING.md)。

## 内容边界

推荐使用：

- 观象
- 易象
- 象义
- 问题参照
- 文化学习
- 传统文本
- 爻辞释义

避免使用暗示现实结果保证、收费服务、个人命运判断或专业结论的表达。

## 安全边界

当前版本为本地前端应用，不包含服务端接口、登录系统、支付系统、人工智能 API 或远程数据库；使用者不会因运行本项目消耗维护者的 API 额度。更多说明见 [SECURITY.md](./SECURITY.md)、[PRIVACY.md](./PRIVACY.md) 与 [SAFETY_AND_CONTENT_BOUNDARY.md](./SAFETY_AND_CONTENT_BOUNDARY.md)。
