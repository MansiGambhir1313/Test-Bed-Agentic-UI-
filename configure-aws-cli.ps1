# Configure AWS CLI from agent/.env (access key, secret key, region)
# Prerequisite: Install AWS CLI first — winget install Amazon.AWSCLIV2 (then restart terminal)
$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot
$EnvFile = Join-Path $RepoRoot "agent\.env"

if (-not (Test-Path $EnvFile)) {
    Write-Error "agent/.env not found. Create it from agent/.env.example with AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION."
}

$accessKey = $null
$secretKey = $null
$region = "us-east-1"
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^([^#=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim().Trim('"').Trim("'")
        switch ($key) {
            "AWS_ACCESS_KEY_ID"    { $accessKey = $val }
            "AWS_SECRET_ACCESS_KEY" { $secretKey = $val }
            "AWS_REGION"           { $region = $val }
        }
    }
}

if (-not $accessKey -or -not $secretKey) {
    Write-Error "agent/.env must contain AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
}

$aws = $null
try { $aws = Get-Command aws -ErrorAction Stop } catch {}
if (-not $aws) {
    Write-Host "AWS CLI not found. Install: winget install Amazon.AWSCLIV2" -ForegroundColor Red
    exit 1
}

aws configure set aws_access_key_id $accessKey --profile default
aws configure set aws_secret_access_key $secretKey --profile default
aws configure set region $region --profile default
aws configure set output json --profile default

Write-Host "AWS CLI configured (profile: default)" -ForegroundColor Green
Write-Host "  Region: $region" -ForegroundColor Gray
Write-Host "  Verify: aws sts get-caller-identity" -ForegroundColor Gray
