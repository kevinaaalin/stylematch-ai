$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$vite = Join-Path $projectRoot "node_modules\vite\bin\vite.js"

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$node = if ($nodeCommand) {
  $nodeCommand.Source
} else {
  "C:\Users\Kevin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
}

if (-not (Test-Path $node)) {
  throw "找不到 Node.js，請先安裝 Node.js 20 以上版本。"
}

if (-not (Test-Path $vite)) {
  throw "尚未安裝套件，請先在此資料夾執行 pnpm install。"
}

Set-Location $projectRoot
Write-Host "StyleMatch AI 啟動中：http://127.0.0.1:4173" -ForegroundColor Green
& $node $vite --host 127.0.0.1 --port 4173
