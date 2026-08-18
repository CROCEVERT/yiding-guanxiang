# GitHub 发布检查清单

当前目标：把「易定观象 / 易定·六十四象」作为免费、开源、传统文化学习与问题参照工具发布，并准备 Windows / macOS 桌面版构建。

## 1. 发布前本地自检

在 `E:\workspace\projects\xuangui-insight` 执行：

```powershell
npm run verify:release
```

它会检查：

- 前端能否正常构建；
- npm 高危依赖告警；
- 仓库内是否出现疑似密钥、token、password、private key 等敏感信息。

## 2. GitHub 仓库准备

你需要在 GitHub 创建一个空仓库，建议名称：

```text
yiding-guanxiang
```

创建时先不要勾选自动生成 README、LICENSE 或 .gitignore，因为本地项目里已经有。

创建后把仓库地址发给我，例如：

```text
https://github.com/你的用户名/yiding-guanxiang.git
```

## 3. 免费声明位置

当前仓库已有：

- `LICENSE.md`：限制商业转售、付费解释、包装成付费咨询服务；
- `NOTICE.md`：说明本项目免费、不可用于收费诱导；
- `README.md`：首页说明、使用边界、合规声明；
- 应用内须知弹窗：说明仅作传统文化学习与问题参照。

## 4. 桌面版构建

本地 Windows 可尝试：

```powershell
npm run dist:win
```

GitHub Actions 可在推送 tag 后自动构建 Windows 与 macOS：

```powershell
git tag yiding-guanxiang-v1.1.0
git push origin yiding-guanxiang-v1.1.0
```

注意：macOS 安装包最好由 GitHub Actions 的 macOS runner 或真实 Mac 构建，本机 Windows 不适合直接产出最终 Mac 包。
