$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ReleaseDir = Join-Path $Root "release"
$AppDir = Join-Path $ReleaseDir "win-portable"
$ElectronDist = Join-Path $Root "node_modules\electron\dist"

Push-Location $Root
try {
  npm run build

  $ElectronExe = Join-Path $ElectronDist "electron.exe"
  if (-not (Test-Path -LiteralPath $ElectronExe)) {
    Write-Host "Electron runtime is missing. Installing runtime..."
    node node_modules\electron\install.js
  }
  if (-not (Test-Path -LiteralPath $ElectronExe)) {
    throw "Electron runtime was not found: $ElectronExe"
  }

  if (Test-Path -LiteralPath $AppDir) {
    Remove-Item -LiteralPath $AppDir -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $AppDir | Out-Null

  Copy-Item -Path (Join-Path $ElectronDist "*") -Destination $AppDir -Recurse -Force

  $ResourcesApp = Join-Path $AppDir "resources\app"
  New-Item -ItemType Directory -Force -Path $ResourcesApp | Out-Null

  foreach ($Item in @("dist", "electron", "package.json", "README.md", "LICENSE.md", "NOTICE.md")) {
    $Source = Join-Path $Root $Item
    if (Test-Path -LiteralPath $Source) {
      Copy-Item -LiteralPath $Source -Destination $ResourcesApp -Recurse -Force
    }
  }

  $ProductName = node -p "require('./package.json').build.productName || 'YidingGuanxiang'"
  if ([string]::IsNullOrWhiteSpace($ProductName)) {
    $ProductName = "YidingGuanxiang"
  }

  $TargetExeName = "$ProductName.exe"
  Rename-Item -LiteralPath (Join-Path $AppDir "electron.exe") -NewName $TargetExeName -Force
  $ExePath = Join-Path $AppDir $TargetExeName

  $ReadmePath = Join-Path $AppDir "README-WINDOWS.txt"
  $Readme = @(
    "Yiding Guanxiang Windows portable package",
    "",
    "How to use:",
    "1. Extract the whole folder.",
    "2. Double-click: $TargetExeName",
    "3. This app does not require PowerShell, Node.js, or a local dev server at runtime.",
    "",
    "Notice:",
    "This tool is free to use. It is for traditional culture learning and question reference only.",
    "It does not provide paid services, real-world conclusions, or professional advice."
  )
  $Readme | Set-Content -LiteralPath $ReadmePath -Encoding UTF8

  $ZipPath = Join-Path $ReleaseDir "YidingGuanxiang-windows-x64.zip"
  if (Test-Path -LiteralPath $ZipPath) {
    Remove-Item -LiteralPath $ZipPath -Force
  }
  Compress-Archive -Path (Join-Path $AppDir "*") -DestinationPath $ZipPath -Force

  Write-Host "Windows package created:"
  Write-Host $ZipPath
  Write-Host "Runnable app:"
  Write-Host $ExePath
}
finally {
  Pop-Location
}
