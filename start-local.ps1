$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspaceRoot = Split-Path -Parent $projectRoot
$vite = Join-Path $projectRoot "node_modules\vite\bin\vite.js"
$apiServer = Join-Path $workspaceRoot "local-api\server.mjs"
$comfyRoot = "C:\Users\Kevin\Desktop\ComfyUI_windows_portable"
$comfyPython = Join-Path $comfyRoot "python_embeded\python.exe"
$comfyMain = Join-Path $comfyRoot "ComfyUI\main.py"
$comfyModelConfig = Join-Path $comfyRoot "stylematch-extra-model-paths.yaml"
$workspaceComfyModelConfig = Join-Path $projectRoot "config\comfyui-extra-model-paths.yaml"
$logRoot = Join-Path $projectRoot ".local-logs"
$smtpConfig = Join-Path $projectRoot "config\smtp-config.local"

if (Test-Path $smtpConfig) {
  $allowedSmtpKeys = @("SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "SMTP_ALLOW_INSECURE")
  Get-Content -LiteralPath $smtpConfig -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) { return }
    $key, $value = $line.Split("=", 2)
    if ($allowedSmtpKeys -contains $key.Trim()) {
      [System.Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim(), [System.EnvironmentVariableTarget]::Process)
    }
  }
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$node = if ($nodeCommand) {
  $nodeCommand.Source
} else {
  "C:\Users\Kevin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
}

if (-not (Test-Path $node)) {
  throw "Node.js 20 or newer is required."
}

if (-not (Test-Path $vite)) {
  throw "Dependencies are missing. Run pnpm install in this folder first."
}

if ((Test-Path $comfyRoot) -and (Test-Path $workspaceComfyModelConfig)) {
  Copy-Item -LiteralPath $workspaceComfyModelConfig -Destination $comfyModelConfig -Force
}

New-Item -ItemType Directory -Force -Path $logRoot | Out-Null

function Test-LocalService([string]$Url) {
  try {
    Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2 | Out-Null
    return $true
  } catch { return $false }
}

if (-not (Test-LocalService "http://127.0.0.1:8188/system_stats")) {
  if ((Test-Path $comfyPython) -and (Test-Path $comfyMain)) {
    $checkpointRoots = @(
      (Join-Path $comfyRoot "ComfyUI\models\checkpoints"),
      "C:\Users\Kevin\Documents\ComfyUI\models\checkpoints"
    )
    $checkpoints = @($checkpointRoots | Where-Object { Test-Path $_ } | ForEach-Object { Get-ChildItem -LiteralPath $_ -Recurse -File -ErrorAction SilentlyContinue } | Where-Object { $_.Extension -in ".safetensors", ".ckpt" })
    if ($checkpoints.Count -eq 0) {
      Write-Warning "ComfyUI is installed, but no checkpoint model was found. The site will start, but image generation requires a model."
    }
    $comfyArgs = @("-s", $comfyMain, "--windows-standalone-build", "--listen", "127.0.0.1", "--port", "8188", "--extra-model-paths-config", $comfyModelConfig)
    if (-not (Get-Command nvidia-smi -ErrorAction SilentlyContinue)) { $comfyArgs += "--cpu" }
    Start-Process -FilePath $comfyPython -ArgumentList $comfyArgs -WorkingDirectory $comfyRoot -WindowStyle Hidden `
      -RedirectStandardOutput (Join-Path $logRoot "comfyui.out.log") -RedirectStandardError (Join-Path $logRoot "comfyui.err.log")
    Write-Host "Starting ComfyUI: http://127.0.0.1:8188" -ForegroundColor Cyan
  } else {
    Write-Warning "Desktop ComfyUI was not found. Image generation is unavailable."
  }
}

if (-not (Test-LocalService "http://127.0.0.1:4180/health")) {
  if (-not (Test-Path $apiServer)) { throw "Local API was not found: $apiServer" }
  Start-Process -FilePath $node -ArgumentList @($apiServer) -WorkingDirectory (Split-Path -Parent $apiServer) -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $logRoot "local-api.out.log") -RedirectStandardError (Join-Path $logRoot "local-api.err.log")
  Write-Host "Starting local API: http://127.0.0.1:4180" -ForegroundColor Cyan
}

Set-Location $projectRoot
Write-Host "Starting StyleMatch AI: http://127.0.0.1:4173" -ForegroundColor Green
& $node $vite --host 127.0.0.1 --port 4173
