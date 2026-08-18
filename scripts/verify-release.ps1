$ErrorActionPreference = "Stop"

Write-Host "== npm build =="
npm run build

Write-Host "== npm audit high =="
npm audit --audit-level=high

Write-Host "== secret keyword scan =="
$patterns = @(
  "(api[_-]?key|secret|token|password)\s*[:=]\s*['""][^'""]{8,}['""]",
  "AKIA[0-9A-Z]{16}",
  "sk-[A-Za-z0-9_-]{20,}",
  "BEGIN (RSA|OPENSSH|EC) PRIVATE KEY"
)

$argsList = @(
  "--hidden",
  "--glob", "!node_modules/**",
  "--glob", "!dist/**",
  "--glob", "!release/**",
  "--glob", "!.git/**",
  "--glob", "!package-lock.json",
  "--glob", "!*.log"
)

$hits = @()
foreach ($pattern in $patterns) {
  $result = & rg -n -i @argsList $pattern . 2>$null
  if ($LASTEXITCODE -eq 0) {
    $hits += $result
  } elseif ($LASTEXITCODE -gt 1) {
    throw "rg failed while scanning pattern: $pattern"
  }
}

if ($hits.Count -gt 0) {
  Write-Host "Potential secret-like strings found:"
  $hits | Select-Object -First 80 | ForEach-Object { Write-Host $_ }
  throw "Secret scan needs review before release."
}

Write-Host "Release verification passed."
