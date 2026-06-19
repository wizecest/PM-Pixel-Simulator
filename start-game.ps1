$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is not installed."
  Write-Host "Please install Node.js first: https://nodejs.org/"
  Read-Host "Press Enter to exit"
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm is not available."
  Write-Host "Please reinstall Node.js first: https://nodejs.org/"
  Read-Host "Press Enter to exit"
  exit 1
}

$listeners = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique

foreach ($processId in $listeners) {
  $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
  if ($processInfo -and $processInfo.CommandLine -like "*$root*") {
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  } elseif ($processInfo) {
    Write-Host "Port 3000 is already used by another program."
    Write-Host "Close that program or change this app's port."
    Read-Host "Press Enter to exit"
    exit 1
  }
}

Start-Sleep -Seconds 1

if (Test-Path -LiteralPath ".next") {
  Remove-Item -LiteralPath ".next" -Recurse -Force
}

Remove-Item -LiteralPath "next-dev.out.log", "next-dev.err.log", "tsconfig.tsbuildinfo" -ErrorAction SilentlyContinue

if (-not (Test-Path -LiteralPath "node_modules")) {
  Write-Host "Installing dependencies..."
  npm install
}

Start-Process "http://127.0.0.1:3000"
Write-Host "Starting PM Pixel Simulator..."
Write-Host "Keep this window open while playing."
npm run dev -- --hostname 127.0.0.1 --port 3000
