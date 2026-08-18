const { execFileSync } = require("node:child_process");
const path = require("node:path");

/** @param {{ electronPlatformName: string, appOutDir: string, packager: { appInfo: { productFilename: string } } }} context */
exports.default = async function verifyMacDistribution(context) {
  if (process.env.REQUIRE_SIGNING !== "true" || context.electronPlatformName !== "darwin") return;

  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  execFileSync("codesign", ["--verify", "--strict", "--verbose=4", appPath], { stdio: "inherit" });
  execFileSync("spctl", ["--assess", "--type", "execute", "--verbose=4", appPath], { stdio: "inherit" });
  execFileSync("xcrun", ["stapler", "validate", appPath], { stdio: "inherit" });
  console.log(`macOS 签名与公证票据验证通过：${appPath}`);
};
