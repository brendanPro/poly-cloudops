# Script to set up n8n admin account via API
# Reads credentials from .env file

# Load .env file
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)) {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "[ERROR] .env file not found" -ForegroundColor Red
    exit 1
}

$N8N_URL = "http://localhost:5678"
$N8N_ADMIN_EMAIL = $env:N8N_ADMIN_EMAIL
$N8N_ADMIN_PASSWORD = $env:N8N_ADMIN_PASSWORD

if (-not $N8N_ADMIN_EMAIL -or -not $N8N_ADMIN_PASSWORD) {
    Write-Host "[ERROR] N8N_ADMIN_EMAIL or N8N_ADMIN_PASSWORD not set in .env" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "======================================"
Write-Host "N8N Admin Account Setup Script"
Write-Host "======================================"
Write-Host ""
Write-Host "Target: $N8N_URL"
Write-Host "Email: $N8N_ADMIN_EMAIL"
Write-Host ""

# Step 1: Wait for n8n to be accessible
Write-Host "[Step 1] Waiting for n8n to be ready..."

$maxWaitTime = 120
$elapsed = 0
$checkInterval = 3

while ($elapsed -lt $maxWaitTime) {
    try {
        $response = Invoke-WebRequest -Uri "$N8N_URL/" -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] n8n is responding!" -ForegroundColor Green
            break
        }
    } catch {
        # Still waiting
    }
    
    Write-Host -NoNewline "."
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
}

Write-Host ""

if ($elapsed -ge $maxWaitTime) {
    Write-Host "[ERROR] n8n did not respond after $maxWaitTime seconds" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:"
    Write-Host "  - Check if container is running: docker ps"
    Write-Host "  - View logs: docker-compose logs n8n"
    exit 1
}

# Step 2: Wait for full initialization
Write-Host "[Step 2] Waiting for n8n to fully initialize (20 seconds)..."
Start-Sleep -Seconds 20

# Step 3: Attempt to create owner account with multiple endpoints
Write-Host "[Step 3] Creating owner account..."

$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    email     = $N8N_ADMIN_EMAIL
    password  = $N8N_ADMIN_PASSWORD
    firstName = "CloudOps"
    lastName  = "Admin"
} | ConvertTo-Json

# Try multiple endpoints (different n8n versions)
$setupEndpoints = @(
    "$N8N_URL/rest/owner",
    "$N8N_URL/rest/owner/setup"
)

$accountCreated = $false
$accountExists = $false

foreach ($setupUrl in $setupEndpoints) {
    Write-Host "  Trying: $setupUrl" -ForegroundColor Gray
    
    try {
        $setupResponse = Invoke-WebRequest -Uri $setupUrl -Method Post -Headers $headers -Body $body -TimeoutSec 10 -ErrorAction Stop
        Write-Host "[OK] Admin account created successfully!" -ForegroundColor Green
        $accountCreated = $true
        break
    }
    catch {
        $statusCode = $null
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        
        if ($statusCode -eq 400) {
            Write-Host "  Account already exists" -ForegroundColor Yellow
            $accountExists = $true
            break
        } elseif ($statusCode -eq 404) {
            Write-Host "  Endpoint not found, trying next..." -ForegroundColor Gray
        } else {
            Write-Host "  Failed with status: $statusCode" -ForegroundColor Gray
        }
    }
}

Write-Host ""

# Step 4: Authenticate with the account
if ($accountCreated -or $accountExists) {
    Write-Host "[Step 4] Authenticating..."
    
    $loginBody = @{
        email    = $N8N_ADMIN_EMAIL
        password = $N8N_ADMIN_PASSWORD
    } | ConvertTo-Json
    
    # Try multiple login endpoints
    $loginEndpoints = @(
        "$N8N_URL/rest/login",
        "$N8N_URL/api/v1/login"
    )
    
    $authenticated = $false
    $authToken = $null
    
    foreach ($loginUrl in $loginEndpoints) {
        Write-Host "  Trying: $loginUrl" -ForegroundColor Gray
        
        try {
            $loginResponse = Invoke-WebRequest -Uri $loginUrl -Method Post -Headers $headers -Body $loginBody -TimeoutSec 10 -ErrorAction Stop
            $loginData = $loginResponse.Content | ConvertFrom-Json
            
            # Extract token (different versions return it differently)
            if ($loginData.data.token) {
                $authToken = $loginData.data.token
            } elseif ($loginData.token) {
                $authToken = $loginData.token
            } elseif ($loginData.data.id) {
                $authToken = $loginData.data.id
            }
            
            Write-Host "[OK] Authentication successful!" -ForegroundColor Green
            $authenticated = $true
            break
            
        } catch {
            $statusCode = $null
            if ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
            }
            
            if ($statusCode -eq 404) {
                Write-Host "  Endpoint not found, trying next..." -ForegroundColor Gray
            } else {
                Write-Host "  Failed with status: $statusCode" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host ""
    
    # Step 5: Display results
    Write-Host "======================================"
    Write-Host "Setup Complete!"
    Write-Host "======================================"
    Write-Host ""
    Write-Host "Account credentials:"
    Write-Host "  Email: $N8N_ADMIN_EMAIL"
    Write-Host "  Password: $N8N_ADMIN_PASSWORD"
    Write-Host ""
    
    if ($authenticated -and $authToken) {
        Write-Host "Authentication Token (for API calls):" -ForegroundColor Cyan
        Write-Host "  $authToken"
        Write-Host ""
    }
    
    Write-Host "Opening n8n in browser..."
    Write-Host "URL: $N8N_URL"
    Write-Host ""
    
    if ($authenticated) {
        Write-Host "Your browser should remember the session." -ForegroundColor Green
        Write-Host "You won't need to login again unless you clear cookies." -ForegroundColor Green
    } else {
        Write-Host "Please login with the credentials above." -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    # Open browser
    Start-Sleep -Seconds 2
    try {
        Start-Process $N8N_URL
        Write-Host "[OK] Browser opened!" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Could not open browser automatically" -ForegroundColor Yellow
        Write-Host "Please open: $N8N_URL" -ForegroundColor Cyan
    }
    
} else {
    Write-Host "======================================"
    Write-Host "Manual Setup Required"
    Write-Host "======================================"
    Write-Host ""
    Write-Host "Could not create account automatically."
    Write-Host "Please complete the setup manually at:"
    Write-Host "  $N8N_URL"
    Write-Host ""
    Write-Host "Use these credentials:"
    Write-Host "  Email: $N8N_ADMIN_EMAIL"
    Write-Host "  Password: $N8N_ADMIN_PASSWORD"
    Write-Host "  First Name: CloudOps"
    Write-Host "  Last Name: Admin"
    Write-Host ""
    
    try {
        Start-Process $N8N_URL
    } catch {
        # Silent fail
    }
}