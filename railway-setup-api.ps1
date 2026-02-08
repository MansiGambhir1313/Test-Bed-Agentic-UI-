# Set Railway variables via API (no interactive login).
# 1. Create a token: Railway dashboard -> Account -> Tokens -> Create Token
# 2. In PowerShell: $env:RAILWAY_TOKEN = "your-token"
# 3. Run: .\railway-setup-api.ps1

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot
$envFile = Join-Path $repoRoot "agent\.env"

$token = $env:RAILWAY_TOKEN; if (-not $token) { $token = $env:RAILWAY_API_TOKEN }
if (-not $token) {
    Write-Host "Set RAILWAY_TOKEN (or RAILWAY_API_TOKEN) first." -ForegroundColor Red
    Write-Host "Create token: Railway dashboard -> Account -> Tokens -> Create Token" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $envFile)) {
    Write-Host "agent/.env not found." -ForegroundColor Red
    exit 1
}

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

$projectId = "701c0236-967b-482d-a2c6-39fa77d50f85"
$environmentId = "cc0f343a-109c-4985-8984-4a312e1bcc29"
$serviceId = "2f98d2b6-a2e7-45e9-8af3-6abb64961467"

$variablesJson = $vars | ConvertTo-Json -Compress
$query = @"
mutation variableCollectionUpsert(`$input: VariableCollectionUpsertInput!) {
  variableCollectionUpsert(input: `$input)
}
"@
$payload = @{
    query = $query
    variables = @{
        input = @{
            projectId = $projectId
            environmentId = $environmentId
            serviceId = $serviceId
            variables = $vars
        }
    }
} | ConvertTo-Json -Depth 5

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-RestMethod -Uri "https://backboard.railway.com/graphql/v2" -Method Post -Headers $headers -Body $payload
    if ($response.errors) {
        Write-Host "API error: $($response.errors | ConvertTo-Json -Compress)" -ForegroundColor Red
        exit 1
    }
    Write-Host "Variables set on Railway." -ForegroundColor Green
} catch {
    Write-Host "Request failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Next (dashboard):" -ForegroundColor Cyan
Write-Host "1. Settings -> Root Directory -> leave EMPTY, Save" -ForegroundColor White
Write-Host "2. Networking -> Generate Domain, copy URL" -ForegroundColor White
Write-Host "3. Deployments -> ... -> Redeploy" -ForegroundColor White
Write-Host "4. In Vercel: VITE_API_URL = that URL, then redeploy" -ForegroundColor White
