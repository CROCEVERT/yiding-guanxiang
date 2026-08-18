$ErrorActionPreference = "Stop"

if ($env:REQUIRE_SIGNING -ne "true") {
  Write-Host "非正式发布构建：跳过 Windows 签名校验。"
  exit 0
}

$artifacts = Get-ChildItem -Path "release" -Recurse -File -Filter "*.exe"
if ($artifacts.Count -eq 0) {
  throw "未找到 Windows .exe 构建产物，无法验证正式发布签名。"
}

$invalid = @()
foreach ($artifact in $artifacts) {
  $signature = Get-AuthenticodeSignature -FilePath $artifact.FullName
  if ($signature.Status -ne "Valid") {
    $invalid += "$($artifact.Name): $($signature.Status)"
  } else {
    Write-Host "签名有效：$($artifact.Name)"
  }
}

if ($invalid.Count -gt 0) {
  throw "Windows 正式发布签名验证失败：$($invalid -join '; ')"
}
