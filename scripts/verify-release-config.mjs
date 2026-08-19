import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const [packageText, workflowText, gitignore] = await Promise.all([
  readFile(new URL("../package.json", import.meta.url), "utf8"),
  readFile(new URL("../.github/workflows/desktop-release.yml", import.meta.url), "utf8"),
  readFile(new URL("../.gitignore", import.meta.url), "utf8"),
]);
const workflow = workflowText.replaceAll("\r\n", "\n");
const packageJson = JSON.parse(packageText);
const build = packageJson.build ?? {};
const issues = [];

if (build.asar !== true) issues.push("桌面包未启用 ASAR");
if (build.beforePack !== "scripts/release-preflight.cjs") issues.push("缺少正式发布凭据预检");
if (build.afterSign !== "scripts/verify-mac-distribution.cjs") issues.push("缺少 macOS 签名/公证验收");
if (build.mac?.hardenedRuntime !== true) issues.push("macOS 未启用 Hardened Runtime");
if (build.mac?.notarize !== true) issues.push("macOS 未启用公证流程");
for (const name of ["PRIVACY.md", "SAFETY_AND_CONTENT_BOUNDARY.md", "SECURITY.md", "RELEASE_CHECKLIST.md"]) {
  if (!build.files?.includes(name)) issues.push(`桌面包未包含 ${name}`);
}

for (const snippet of [
  "permissions:\n  contents: read",
  "persist-credentials: false",
  "REQUIRE_SIGNING:",
  "WIN_CSC_LINK: ${{ secrets.WIN_CSC_LINK }}",
  "MAC_CSC_LINK",
  "verify-windows-signature.ps1",
]) {
  if (!workflow.includes(snippet)) issues.push(`发布工作流缺少安全配置：${snippet}`);
}

for (const pattern of [".env", "*.p12", "*.pfx", "AuthKey_*.p8"]) {
  if (!gitignore.includes(pattern)) issues.push(`.gitignore 未排除敏感文件：${pattern}`);
}

if (issues.length > 0) throw new Error(`发布安全配置验证失败：\n${issues.join("\n")}`);

console.log(`发布安全配置验证通过：${root}`);
