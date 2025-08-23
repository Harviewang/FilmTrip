# PowerShell: export JSON snapshots placeholder
param(
  [string]$OutDir = "backups/snapshots"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$dateDir = Join-Path $OutDir $timestamp
New-Item -ItemType Directory -Force -Path $dateDir | Out-Null

# TODO: 调用后端导出端点或脚本生成 JSON：
# cameras.json, filmstocks.json, rolls.json, photos.json, tags.json, roll_tags.json, photo_tags.json
Write-Host "[placeholder] export snapshots to $dateDir"

# TODO: 上传到对象存储或推送到 GitHub
Write-Host "[placeholder] upload snapshots from $dateDir"

