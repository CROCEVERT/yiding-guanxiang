const packageJson = require("./package.json");

/**
 * 未签名体验包与签名正式包共用同一份文件白名单和产品信息。
 * 唯一差异是：只有 REQUIRE_SIGNING=true 时才启用 macOS Hardened Runtime 与公证。
 * 这样无证书时不会把未签名包误当成可公证的正式构建。
 */
const isSignedRelease = process.env.REQUIRE_SIGNING === "true";

module.exports = {
  ...packageJson.build,
  mac: {
    ...packageJson.build.mac,
    hardenedRuntime: isSignedRelease,
    notarize: isSignedRelease,
  },
};
