docker compose up -d

Write-Host "Waiting for n8n to be ready..."

$maxAttempts = 30
$attempt = 0

do {
    try {
        Invoke-RestMethod -Uri http://localhost:5678/healthz -TimeoutSec 2 | Out-Null
        Write-Host "n8n is ready ✅"
        break
    } catch {
        Start-Sleep -Seconds 2
        $attempt++
        Write-Host "Waiting... ($attempt)"
    }
} while ($attempt -lt $maxAttempts)

if ($attempt -eq $maxAttempts) {
    Write-Error "n8n did not start in time ❌"
    exit 1
}

$auth = [Convert]::ToBase64String(
  [Text.Encoding]::ASCII.GetBytes("n8n-admin:strongpassword")
)

Invoke-RestMethod `
  -Method POST `
  -Uri http://localhost:5678/rest/workflows `
  -Headers @{ Authorization = "Basic $auth" } `
  -InFile "./workflows/translate-text-deepl.json" `
  -ContentType "application/json"

Write-Host "Bootstrap completed 🎉"
