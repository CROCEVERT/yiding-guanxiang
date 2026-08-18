# 易定观象｜GitHub 公开源码准备

更新日期：2026-08-18

本文件用于首次公开源码，不是桌面安装包的正式发布说明。当前项目可先公开源代码；macOS 公证和 Windows 签名完成前，桌面安装包仍只属于本地验收或测试范围。

首次公开版本定为 **易定观象 1.0**，程序版本号为 `1.0.0`；对应 Git 标签使用 `v1.0.0`，不复用本地历史中的中文测试标签。

## 建议的 GitHub 信息

| 项目 | 建议值 |
|---|---|
| 仓库名 | `yiding-guanxiang` |
| 仓库简介 | 离线运行的《易经》传统文化互动体验工具，用于经典文本学习、问题整理与自我审视。 |
| 可见性 | Public（公开源码） |
| 维护者显示名 | 易定观象项目维护者 |
| 推荐 Topics | `yijing`、`iching`、`chinese-classics`、`traditional-culture`、`electron`、`react`、`offline-first` |

仓库所有者的 GitHub 用户名会公开显示。若不希望把个人真实姓名与项目绑定，请使用你希望长期维护本项目的 GitHub 账号；不要在代码、文档、Issue 或 Release 中补写住址、电话、证件、个人账户或证书信息。

## 仓库首页可用文案

> 易定观象是一个离线运行的传统文化互动体验工具。它用铜钱互动呈现《易经》文本、六爻符号与现代阅读参照，帮助使用者整理正在思考的问题。当前版本免费使用，不提供收费讲解、代看、代操作或现实结果承诺；应用不需要登录，也不设置云同步或应用内数据上传。

## 首次公开源码步骤

1. 在 GitHub 创建一个空的公开仓库，名称使用 `yiding-guanxiang`；不要勾选自动创建 README、License 或 `.gitignore`。
2. 将仓库链接提供给项目维护者，或由维护者在本机添加为 `origin`。在推送前再次运行构建、公开边界与安全边界检查。
3. 首次只推送源码与文档，不推送 `v*` 标签，不创建 Release，不上传未签名安装包。
4. 在仓库设置中启用私密漏洞报告，并按可用项开启 Secret scanning 和 push protection。检查 `SECURITY.md` 和 Issue 模板已展示。
5. 在 GitHub 首页补充上方简介与 Topics；确认 README、LICENSE、NOTICE、PRIVACY、SECURITY、内容边界和发布清单均可读。

## 桌面安装包的下一阶段

- **macOS：** 需加入 Apple Developer Program，使用 Developer ID Application 证书签名，并提交 Apple 公证。Developer ID 与公证让 Gatekeeper 能核验应用来源与完整性，不等于 App Store 审核。参见 [Apple Developer ID](https://developer.apple.com/support/developer-id/) 与 [Apple 公证说明](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)。
- **Windows：** 若直接在 GitHub 下载 EXE，需要可信代码签名；也可日后评估 Microsoft Store 的 MSIX 路线。Microsoft 目前将 Store 的 MSIX 路线和 Azure Artifact Signing 列为 Windows 分发的主要选项。参见 [Microsoft 代码签名选项](https://learn.microsoft.com/windows/apps/package-and-deploy/code-signing-options)。
- 在两端签名验证和干净设备安装通过前，安装包不应标为“正式版”。详细步骤见 [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)。

## 对外沟通边界

- 不要在公开 Issue、截图或讨论里粘贴自己的问题记录、病历、财务、联系方式、单位信息或他人隐私；
- 不把项目称为现实判断服务，也不承诺结果、时机或个人命运；
- 公开源码不等于允许商业改包、收费服务或删除声明；具体许可见 [LICENSE.md](./LICENSE.md)；
- 发现技术漏洞时，优先使用 GitHub 私密漏洞报告，不在公开 Issue 中披露利用细节。
