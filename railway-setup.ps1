# Railway agent service setup from console
# Run from repo root. Requires: Node.js/npm (for Railway CLI) and Railway login.
# Root Directory must be set in Railway dashboard (Settings) - leave empty or set to "agent".

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot
$envFile = Join-Path $repoRoot "agent\.env"

if (-not (Test-Path $envFile)) {
    Write-Host "agent/.env not found. Create it from agent/.env.example and add your AWS keys." -ForegroundColor Red
    exit 1
}

# Install Railway CLI if missing
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Railway CLI (npm install -g @railway/cli)..." -ForegroundColor Yellow
    npm install -g @railway/cli
    if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
        Write-Host "Railway CLI not found after install. Add npm global bin to PATH or run: npx railway ..." -ForegroundColor Red
        exit 1
    }
}

# Link to project (use your project ID from the Railway URL)
$projectId = "701c0236-967b-482d-a2c6-39fa77d50f85"
$serviceId = "2f98d2b6-a2e7-45e9-8af3-6abb64961467"
Write-Host "Linking to Railway project. If prompted, select the agent service." -ForegroundColor Cyan
Push-Location $repoRoot
railway link --project $projectId 2>$null
if ($LASTEXITCODE -ne 0) {
    railway link
}

# Parse agent/.env and set variables (skip comments and empty lines)
$vars = @{}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $idx = $line.IndexOf("=")
        if ($idx -gt 0) {
            $name = $line.Substring(0, $idx).Trim()
            $value = $line.Substring($idx + 1).Trim()
            if ($name -match "^(USE_BEDROCK|AWS_REGION|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY)$") {
                $vars[$name] = $value
            }
        }
    }
}

foreach ($name in $vars.Keys) {
    $value = $vars[$name]
    Write-Host "Setting $name..." -ForegroundColor Gray
    & railway variables set $name "$value"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to set $name" -ForegroundColor Red
    }
}

Pop-Location
Write-Host ""
Write-Host "Variables set. Next:" -ForegroundColor Green
Write-Host "1. In Railway dashboard: Settings -> Root Directory -> leave EMPTY (or set to 'agent'), then Save." -ForegroundColor White
Write-Host "2. Networking: Generate Domain for the service, copy the URL." -ForegroundColor White
Write-Host "3. Deployments -> ... -> Redeploy." -ForegroundColor White
Write-Host "4. Use the service URL as VITE_API_URL in Vercel and for ?api= quick test." -ForegroundColor White
