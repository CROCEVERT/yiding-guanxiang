const requiredSigning = process.env.REQUIRE_SIGNING === "true";

function requireVariables(label, names) {
  const missing = names.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`${label} 缺少受控发布凭据：${missing.join(", ")}。请仅通过本机钥匙串或 GitHub Actions Secrets 配置，不能写进源码。`);
  }
}

/** @param {{ electronPlatformName: string }} context */
exports.default = async function releasePreflight(context) {
  if (!requiredSigning) return;

  if (context.electronPlatformName === "darwin") {
    requireVariables("macOS Developer ID 签名", ["CSC_LINK", "CSC_KEY_PASSWORD"]);
    requireVariables("macOS 公证", ["APPLE_ID", "APPLE_APP_SPECIFIC_PASSWORD", "APPLE_TEAM_ID"]);
    return;
  }

  if (context.electronPlatformName === "win32") {
    requireVariables("Windows Authenticode 签名", ["WIN_CSC_LINK", "WIN_CSC_KEY_PASSWORD"]);
  }
};
