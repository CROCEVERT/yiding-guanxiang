$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Zip = Join-Path $Root "release\YidingGuanxiang-windows-x64.zip"
if (!(Test-Path $Zip)) {
  throw "Missing package: $Zip"
}

$Temp = Join-Path $env:TEMP ("yiding-win-visual-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $Temp | Out-Null

try {
  Expand-Archive -LiteralPath $Zip -DestinationPath $Temp -Force
  $Exe = Get-ChildItem -LiteralPath $Temp -Recurse -Filter "*.exe" |
    Where-Object { $_.Name -notmatch "crashpad|setup|uninstall" } |
    Select-Object -First 1
  if (!$Exe) {
    throw "No runnable exe found after extracting package."
  }

  $Process = Start-Process -FilePath $Exe.FullName -PassThru -WindowStyle Normal

  $Handle = [IntPtr]::Zero
  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Milliseconds 250
    $Process.Refresh()
    if ($Process.HasExited) {
      throw "App exited before screenshot could be captured."
    }
    if ($Process.MainWindowHandle -ne 0) {
      $Handle = $Process.MainWindowHandle
      break
    }
  }

  if ($Handle -eq [IntPtr]::Zero) {
    throw "App window handle was not created."
  }

  Start-Sleep -Seconds 3
  $Process.Refresh()

  Add-Type @"
using System;
using System.Runtime.InteropServices;
public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
public class Win32 {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
}
"@
  Add-Type -AssemblyName System.Drawing

  [Win32]::SetForegroundWindow($Handle) | Out-Null
  Start-Sleep -Milliseconds 500

  $Rect = New-Object RECT
  [Win32]::GetWindowRect($Handle, [ref]$Rect) | Out-Null
  $Width = [Math]::Max(1, $Rect.Right - $Rect.Left)
  $Height = [Math]::Max(1, $Rect.Bottom - $Rect.Top)

  $Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $Graphics.CopyFromScreen($Rect.Left, $Rect.Top, 0, 0, $Bitmap.Size)

  $Shot = Join-Path $Root "release\win-package-smoke.png"
  $Bitmap.Save($Shot, [System.Drawing.Imaging.ImageFormat]::Png)

  $StepX = [Math]::Max(1, [int]($Width / 40))
  $StepY = [Math]::Max(1, [int]($Height / 80))
  $Samples = 0
  $Bright = 0
  for ($y = 0; $y -lt $Height; $y += $StepY) {
    for ($x = 0; $x -lt $Width; $x += $StepX) {
      $Color = $Bitmap.GetPixel($x, $y)
      $Lum = (0.2126 * $Color.R) + (0.7152 * $Color.G) + (0.0722 * $Color.B)
      if ($Lum -gt 25) { $Bright++ }
      $Samples++
    }
  }

  $Ratio = [Math]::Round($Bright / [Math]::Max(1, $Samples), 4)
  if ($Ratio -lt 0.03) {
    throw "Screenshot looks blank/dark. bright_ratio=$Ratio screenshot=$Shot"
  }

  "ZIP=$Zip"
  "EXE=$($Exe.FullName)"
  "SCREENSHOT=$Shot"
  "BRIGHT_RATIO=$Ratio"
}
finally {
  if ($Process -and !$Process.HasExited) {
    Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
  }
  Remove-Item -LiteralPath $Temp -Recurse -Force -ErrorAction SilentlyContinue
}
