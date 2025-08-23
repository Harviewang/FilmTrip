# PowerShell: PostgreSQL dump + upload placeholder
param(
  [string]$DatabaseUrl = $env:DATABASE_URL,
  [string]$OutDir = "backups/pgdump"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$dateDir = Join-Path $OutDir (Get-Date -Format "yyyyMMdd")
New-Item -ItemType Directory -Force -Path $dateDir | Out-Null
$outfile = Join-Path $dateDir ("filmtrip-$timestamp.dump")

# TODO: 调用 pg_dump 保存到 $outfile
Write-Host "[placeholder] pg_dump to $outfile"

# TODO: 上传到对象存储或推送到 GitHub
Write-Host "[placeholder] upload $outfile"

