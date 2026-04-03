# AIDAA Backend Authentication Test Script
# PowerShell script to test authentication endpoints
# Usage: . .\test-auth.ps1

# Server configuration
$baseURL = "http://localhost:5000/api"

Write-Host "`n===== AIDAA Backend - Authentication Test Suite =====`n" -ForegroundColor Cyan

# TEST 1: Health Check
Write-Host "[TEST 1] Health Check" -ForegroundColor Yellow
try {
  $response = Invoke-WebRequest -Uri "$baseURL/../health" -Method Get `
    -Headers @{"Content-Type" = "application/json"} `
    -UseBasicParsing `
    -ErrorAction Stop
  
  $data = $response.Content | ConvertFrom-Json
  Write-Host "[PASS] Server is running: $($data.message)" -ForegroundColor Green
} catch {
  Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# TEST 2: Login with First-Time Parent
Write-Host "[TEST 2] Login - First-Time Parent (Password NULL)" -ForegroundColor Yellow
try {
  $loginBody = @{
    email = "sarah.johnson@example.com"
    password = "anypassword123"
  } | ConvertTo-Json

  $response = Invoke-WebRequest -Uri "$baseURL/auth/login" -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $loginBody `
    -UseBasicParsing `
    -ErrorAction Stop
  
  $data = $response.Content | ConvertFrom-Json
  
  if ($data.success -and $data.mustSetPassword) {
    Write-Host "[PASS] First-time parent detected" -ForegroundColor Green
    Write-Host "       UserId: $($data.userId)" -ForegroundColor Green
    $script:userId = $data.userId
  }
} catch {
  Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# TEST 3: Set Password
Write-Host "[TEST 3] Set Password - First Login" -ForegroundColor Yellow
try {
  if ($script:userId) {
    $setPasswordBody = @{
      userId = $script:userId
      password = "SecurePassword123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$baseURL/auth/set-password" -Method Post `
      -Headers @{"Content-Type" = "application/json"} `
      -Body $setPasswordBody `
      -UseBasicParsing `
      -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success -and $data.data.token) {
      Write-Host "[PASS] Password set successfully" -ForegroundColor Green
      Write-Host "       User: $($data.data.user.name)" -ForegroundColor Green
      Write-Host "       Role: $($data.data.user.role)" -ForegroundColor Green
      $script:jwtToken = $data.data.token
    }
  }
} catch {
  Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# TEST 4: Login with Password
Write-Host "[TEST 4] Login - Using Newly Set Password" -ForegroundColor Yellow
try {
  $loginBody = @{
    email = "sarah.johnson@example.com"
    password = "SecurePassword123"
  } | ConvertTo-Json

  $response = Invoke-WebRequest -Uri "$baseURL/auth/login" -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $loginBody `
    -UseBasicParsing `
    -ErrorAction Stop
  
  $data = $response.Content | ConvertFrom-Json
  
  if ($data.success -and $data.data.token) {
    Write-Host "[PASS] Login successful with password" -ForegroundColor Green
    Write-Host "       User: $($data.data.user.name)" -ForegroundColor Green
    $script:jwtToken = $data.data.token
  }
} catch {
  Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# TEST 5: Access Protected Route with JWT
Write-Host "[TEST 5] Access Protected Route (Children) with JWT" -ForegroundColor Yellow
try {
  if ($script:jwtToken) {
    $response = Invoke-WebRequest -Uri "$baseURL/child/mychildren" -Method Get `
      -Headers @{
        "Authorization" = "Bearer $($script:jwtToken)"
        "Content-Type" = "application/json"
      } `
      -UseBasicParsing `
      -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success) {
      Write-Host "[PASS] Protected route accessed successfully" -ForegroundColor Green
      Write-Host "       Children found: $($data.data.Count)" -ForegroundColor Green
      foreach ($child in $data.data) {
        Write-Host "         - $($child.name) (Age: $($child.age))" -ForegroundColor Green
      }
    }
  }
} catch {
  Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# TEST 6: Invalid Token Test
Write-Host "[TEST 6] Invalid Token Test (Should Reject)" -ForegroundColor Yellow
try {
  $response = Invoke-WebRequest -Uri "$baseURL/child/mychildren" -Method Get `
    -Headers @{
      "Authorization" = "Bearer invalid.token.here"
      "Content-Type" = "application/json"
    } `
    -UseBasicParsing `
    -ErrorAction Stop
  
  Write-Host "[FAIL] Invalid token was accepted" -ForegroundColor Red
} catch {
  $errorData = $null
  try {
    $errorData = $_.ErrorDetails.Message | ConvertFrom-Json
  } catch {}
  
  if ($_.Exception.Response.StatusCode -eq 401) {
    Write-Host "[PASS] Invalid token rejected correctly (401)" -ForegroundColor Green
  }
}

Write-Host "`n===== Test Suite Complete =====`n" -ForegroundColor Cyan
