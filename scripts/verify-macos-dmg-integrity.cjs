const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const releaseDir = path.resolve("release");
const dmgFiles = fs.readdirSync(releaseDir)
  .filter((file) => file.endsWith(".dmg"))
  .map((file) => path.join(releaseDir, file));

if (dmgFiles.length === 0) {
  throw new Error("未找到 macOS DMG，无法进行发布前完整性校验。");
}

for (const dmgPath of dmgFiles) {
  const mountPoint = fs.mkdtempSync("/tmp/yiding-guanxiang-dmg-");
  let attached = false;

  try {
    execFileSync("hdiutil", ["attach", dmgPath, "-nobrowse", "-readonly", "-mountpoint", mountPoint], { stdio: "inherit" });
    attached = true;

    const appName = fs.readdirSync(mountPoint).find((entry) => entry.endsWith(".app"));
    if (!appName) {
      throw new Error(`${path.basename(dmgPath)} 内未找到 .app 应用。`);
    }

    const appPath = path.join(mountPoint, appName);
    execFileSync("codesign", ["--verify", "--deep", "--strict", "--verbose=2", appPath], { stdio: "inherit" });
    console.log(`DMG 完整性校验通过：${path.basename(dmgPath)}`);
  } finally {
    if (attached) {
      execFileSync("hdiutil", ["detach", mountPoint], { stdio: "inherit" });
    }
    fs.rmSync(mountPoint, { recursive: true, force: true });
  }
}
