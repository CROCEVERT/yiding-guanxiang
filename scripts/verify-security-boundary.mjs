import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceRoots = ["src", "electron"];
const ignoredDirectories = new Set(["node_modules", "dist", "release", ".git"]);
const ignoredFiles = new Set(["scripts/verify-security-boundary.mjs"]);
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".cjs", ".mjs", ".html", ".css"]);
const forbiddenPatterns = [
  { label: "OpenAI API 调用", pattern: /\bopenai\b/i },
  { label: "Anthropic API 调用", pattern: /\banthropic\b/i },
  { label: "Gemini API 调用", pattern: /\bgemini\b/i },
  { label: "支付 SDK", pattern: /\bstripe\b|alipay|wechatpay/i },
  { label: "运行时网络请求", pattern: /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bEventSource\b|sendBeacon\s*\(/ },
];
const requiredElectronPatterns = [
  { label: "关闭 Node 注入", pattern: /nodeIntegration:\s*false/ },
  { label: "启用上下文隔离", pattern: /contextIsolation:\s*true/ },
  { label: "启用渲染进程沙箱", pattern: /sandbox:\s*true/ },
  { label: "全局启用沙箱", pattern: /app\.enableSandbox\(\)/ },
  { label: "拒绝权限请求", pattern: /setPermissionRequestHandler[\s\S]*?callback\(false\)/ },
  { label: "拒绝新窗口", pattern: /setWindowOpenHandler\(\(\)\s*=>\s*\{[\s\S]*?action:\s*["']deny["']/ },
  { label: "拒绝应用内导航", pattern: /will-navigate[\s\S]*?preventDefault\(\)/ },
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) return ignoredDirectories.has(entry.name) ? [] : walk(absolute);
    return [absolute];
  }));
  return nested.flat();
}

const sourceFiles = (await Promise.all(sourceRoots.map((root) => walk(join(projectRoot, root))))).flat();
const failures = [];

for (const absolutePath of sourceFiles) {
  const projectPath = relative(projectRoot, absolutePath);
  if (ignoredFiles.has(projectPath)) continue;
  const extension = projectPath.slice(projectPath.lastIndexOf("."));
  if (!sourceExtensions.has(extension)) continue;
  const content = await readFile(absolutePath, "utf8");
  for (const { label, pattern } of forbiddenPatterns) {
    if (pattern.test(content)) failures.push(`${projectPath}：检出${label}`);
  }
}

const electronMain = await readFile(join(projectRoot, "electron/main.cjs"), "utf8");
for (const { label, pattern } of requiredElectronPatterns) {
  if (!pattern.test(electronMain)) failures.push(`electron/main.cjs：缺少${label}`);
}

const requiredDocs = ["PRIVACY.md", "SAFETY_AND_CONTENT_BOUNDARY.md", "SECURITY.md"];
for (const file of requiredDocs) {
  await readFile(join(projectRoot, file), "utf8").catch(() => failures.push(`缺少发布说明：${file}`));
}

if (failures.length > 0) {
  throw new Error(`安全边界验证失败：\n${failures.join("\n")}`);
}

console.log("安全边界验证通过：无 API／支付／运行时网络调用，桌面端权限、窗口与导航默认拒绝。");
