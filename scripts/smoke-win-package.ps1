$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Zip = Get-ChildItem -LiteralPath (Join-Path $Root "release") -Filter "YidingGuanxiang-windows-x64.zip" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $Zip) {
  throw "Windows zip package was not found."
}

$TempDir = Join-Path $env:TEMP ("yiding-win-smoke-" + [guid]::NewGuid().ToString("N"))
Expand-Archive -LiteralPath $Zip.FullName -DestinationPath $TempDir -Force

try {
  $Exe = Get-ChildItem -LiteralPath $TempDir -Filter "*.exe" -Recurse |
    Where-Object { $_.Name -notmatch "elevate|uninstall" } |
    Select-Object -First 1

  if (-not $Exe) {
    throw "No runnable exe was found in the extracted package."
  }

  $Process = Start-Process -FilePath $Exe.FullName -WorkingDirectory $Exe.DirectoryName -PassThru
  Start-Sleep -Seconds 8

  $Alive = Get-Process -Id $Process.Id -ErrorAction SilentlyContinue
  if (-not $Alive) {
    throw "The app process exited before the smoke check finished."
  }

  Write-Host "ZIP=$($Zip.FullName)"
  Write-Host "EXE=$($Exe.FullName)"
  Write-Host "LAUNCHED=$($Alive.ProcessName):$($Alive.Id)"

  Stop-Process -Id $Process.Id -Force
}
finally {
  if (Test-Path -LiteralPath $TempDir) {
    Remove-Item -LiteralPath $TempDir -Recurse -Force
  }
}
