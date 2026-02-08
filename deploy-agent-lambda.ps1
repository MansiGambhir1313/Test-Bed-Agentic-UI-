# Deploy DeepAgents agent to AWS Lambda (container image + Web Adapter)
# Run from repo root. Uses agent/.env for AWS credentials and region.

param(
    [string]$Region = "",
    [switch]$SkipBuild,
    [switch]$SkipPush
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot
Set-Location $RepoRoot

# Load agent/.env into process env (no export to other sessions)
$EnvFile = Join-Path $RepoRoot "agent\.env"
if (-not (Test-Path $EnvFile)) {
    Write-Error "agent/.env not found. Create it from agent/.env.example with AWS credentials and USE_BEDROCK=true."
}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^([^#=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $val = $matches[2].Trim().Trim('"').Trim("'")
        [Environment]::SetEnvironmentVariable($key, $val, "Process")
    }
}

if (-not $Region) { $Region = $env:AWS_REGION }
if (-not $Region) { $Region = "us-east-1" }
$env:AWS_REGION = $Region

# Check prerequisites
$awsMissing = $false
try { $null = Get-Command aws -ErrorAction Stop } catch { $awsMissing = $true }
if ($awsMissing) {
    Write-Host "AWS CLI is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html" -ForegroundColor Yellow
    Write-Host "Then run: aws configure" -ForegroundColor Yellow
    exit 1
}

$dockerMissing = $false
try { $null = Get-Command docker -ErrorAction Stop } catch { $dockerMissing = $true }
if ($dockerMissing -and -not $SkipBuild) {
    Write-Host "Docker is not installed or not in PATH. Use -SkipBuild -SkipPush if the image is already in ECR." -ForegroundColor Yellow
    exit 1
}

# Get account ID
$AccountId = (aws sts get-caller-identity --query Account --output text 2>&1)
if ($LASTEXITCODE -ne 0) {
    Write-Host "AWS credentials failed. Check agent/.env (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) or run aws configure." -ForegroundColor Red
    exit 1
}

$EcrUri = "${AccountId}.dkr.ecr.${Region}.amazonaws.com/deepagents-agent"
$ImageUri = "${EcrUri}:latest"
$FuncName = "deepagents-agent"
$RoleName = "deepagents-agent-lambda-role"

Write-Host "Account: $AccountId  Region: $Region  ECR: $EcrUri" -ForegroundColor Cyan

# 1) ECR repo
Write-Host "`n[1/6] ECR repository..." -ForegroundColor Green
try { $null = aws ecr describe-repositories --repository-names deepagents-agent --region $Region 2>&1 } catch { }
if ($LASTEXITCODE -ne 0) {
    aws ecr create-repository --repository-name deepagents-agent --region $Region
}

# 2) Build and push image
if (-not $SkipBuild -and -not $SkipPush) {
    Write-Host "`n[2/6] Building Docker image..." -ForegroundColor Green
    docker build --platform linux/amd64 --provenance=false -t deepagents-agent -f (Join-Path $RepoRoot "Dockerfile") $RepoRoot
    if ($LASTEXITCODE -ne 0) { exit 1 }
    Write-Host "Pushing to ECR..." -ForegroundColor Green
    $pwd = aws ecr get-login-password --region $Region
    $pwd | docker login --username AWS --password-stdin "${AccountId}.dkr.ecr.${Region}.amazonaws.com"
    docker tag deepagents-agent:latest $ImageUri
    docker push $ImageUri
    if ($LASTEXITCODE -ne 0) { exit 1 }
} else {
    Write-Host "`n[2/6] Skipping build/push (use -SkipBuild -SkipPush only if image already in ECR)." -ForegroundColor Yellow
}

# 3) IAM role for Lambda (Bedrock + logs)
Write-Host "`n[3/6] IAM role for Lambda..." -ForegroundColor Green
$TrustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@
$TrustFile = Join-Path $RepoRoot "agent\.lambda-trust-policy.json"
[System.IO.File]::WriteAllText($TrustFile, $TrustPolicy.Trim(), [System.Text.UTF8Encoding]::new($false))

try { $null = aws iam get-role --role-name $RoleName 2>&1 } catch { }
if ($LASTEXITCODE -ne 0) {
    aws iam create-role --role-name $RoleName --assume-role-policy-document "file://$TrustFile"
    Start-Sleep -Seconds 5
}

$BedrockPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
"@
$BedrockPolicyFile = Join-Path $RepoRoot "agent\.lambda-bedrock-policy.json"
[System.IO.File]::WriteAllText($BedrockPolicyFile, $BedrockPolicy.Trim(), [System.Text.UTF8Encoding]::new($false))
aws iam put-role-policy --role-name $RoleName --policy-name BedrockAndLogs --policy-document "file://$BedrockPolicyFile"

$RoleArn = "arn:aws:iam::${AccountId}:role/${RoleName}"
Write-Host "Role: $RoleArn" -ForegroundColor Gray

# 4) Lambda Web Adapter is in the container image (layers not supported for container images)

# 5) Create or update Lambda function
Write-Host "`n[4/6] Lambda function..." -ForegroundColor Green
$FuncExists = $false
try { $null = aws lambda get-function --function-name $FuncName --region $Region 2>&1 } catch { }
if ($LASTEXITCODE -eq 0) { $FuncExists = $true }

if ($FuncExists) {
    Write-Host "Updating function code (image)..." -ForegroundColor Gray
    aws lambda update-function-code --function-name $FuncName --image-uri $ImageUri --region $Region
    Start-Sleep -Seconds 5
    aws lambda update-function-configuration --function-name $FuncName `
        --timeout 900 --memory-size 2048 `
        --environment "Variables={USE_BEDROCK=true,PORT=8080,MODEL=claude-sonnet-4-5-20250929,LANGSMITH_TRACING=false}" `
        --ephemeral-storage Size=1024 `
        --region $Region
} else {
    aws lambda create-function `
        --function-name $FuncName `
        --package-type Image `
        --code ImageUri=$ImageUri `
        --role $RoleArn `
        --timeout 900 `
        --memory-size 2048 `
        --environment "Variables={USE_BEDROCK=true,PORT=8080,MODEL=claude-sonnet-4-5-20250929,LANGSMITH_TRACING=false}" `
        --ephemeral-storage Size=1024 `
        --architectures x86_64 `
        --region $Region
}

# 6) Function URL
Write-Host "`n[5/6] Function URL..." -ForegroundColor Green
try { $null = aws lambda get-function-url-config --function-name $FuncName --region $Region 2>&1 } catch { }
if ($LASTEXITCODE -ne 0) {
    aws lambda create-function-url-config --function-name $FuncName --auth-type NONE --region $Region
    $UrlConfig = aws lambda get-function-url-config --function-name $FuncName --region $Region
}
# CORS so GUI (Vercel / localhost) can call the agent
$CorsJson = '{"AllowOrigins":["*"],"AllowMethods":["*"],"AllowHeaders":["*"],"MaxAge":86400}'
aws lambda update-function-url-config --function-name $FuncName --cors $CorsJson --region $Region 2>$null
# Allow public invoke for Function URL (NONE auth)
aws lambda add-permission --function-name $FuncName --statement-id FunctionURLAllowPublic --action lambda:InvokeFunctionUrl --principal "*" --function-url-auth-type NONE --region $Region 2>$null

# Output
$UrlConfig = aws lambda get-function-url-config --function-name $FuncName --region $Region | ConvertFrom-Json
$FunctionUrl = $UrlConfig.FunctionUrl
Write-Host "`n[6/6] Done." -ForegroundColor Green
Write-Host ""
Write-Host "Agent (Lambda) URL:" -ForegroundColor Cyan
Write-Host "  $FunctionUrl" -ForegroundColor White
Write-Host ""
Write-Host "Next: Set VITE_API_URL to this URL (no trailing slash) in Vercel/Amplify or gui/.env, then redeploy/run the GUI." -ForegroundColor Yellow

# Cleanup temp files
Remove-Item $TrustFile -ErrorAction SilentlyContinue
Remove-Item $BedrockPolicyFile -ErrorAction SilentlyContinue
