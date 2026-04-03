param()

$BASE_URL = "http://localhost:5000"

function Test-Endpoint {
  param(
    [string]$Name,
    [string]$Method,
    [string]$Endpoint,
    [hashtable]$Body,
    [hashtable]$Headers
  )
  
  Write-Host ""
  Write-Host "TEST: $Name" -ForegroundColor Cyan
  
  try {
    $params = @{
      Uri = "$BASE_URL$Endpoint"
      Method = $Method
      ContentType = "application/json"
      UseBasicParsing = $true
      ErrorAction = "SilentlyContinue"
    }
    
    if ($Body) {
      $params.Body = ($Body | ConvertTo-Json)
      Write-Host "Body: $($Body | ConvertTo-Json)" -ForegroundColor Gray
    }
    
    if ($Headers) {
      $params.Headers = $Headers
    }
    
    $response = Invoke-WebRequest @params
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: OK" -ForegroundColor Green
    
    return $data
  }
  catch {
    $errorResponse = $_.ErrorDetails.Message
    if ($errorResponse) {
      Write-Host "Status: ERROR" -ForegroundColor Yellow
      Write-Host "Response: $errorResponse" -ForegroundColor Yellow
      return ($errorResponse | ConvertFrom-Json)
    }
    else {
      Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
      return $null
    }
  }
}

Test-Endpoint -Name "Health Check" `
  -Method "Get" `
  -Endpoint "/health"

Write-Host ""
Write-Host "=== FIRST-TIME PARENT LOGIN ===" -ForegroundColor Yellow
$loginResponse = Test-Endpoint -Name "First-Time Parent Login" `
  -Method "Post" `
  -Endpoint "/api/auth/login" `
  -Body @{
    email = "sarah.johnson@example.com"
    password = "anypassword"
  }

if ($loginResponse.mustSetPassword) {
  Write-Host "OK: mustSetPassword = TRUE" -ForegroundColor Green
  $userId = $loginResponse.userId
  Write-Host "UserID: $userId" -ForegroundColor Green
}

if ($userId) {
  Write-Host ""
  Write-Host "=== SETTING PASSWORD ===" -ForegroundColor Yellow
  $setPasswordResponse = Test-Endpoint -Name "Set Password" `
    -Method "Post" `
    -Endpoint "/api/auth/set-password" `
    -Body @{
      userId = $userId
      password = "SecurePassword123"
    }
  
  if ($setPasswordResponse.success) {
    $passwordToken = $setPasswordResponse.data.token
    Write-Host "OK: Password set successfully" -ForegroundColor Green
  }
}

Write-Host ""
Write-Host "=== LOGIN AFTER PASSWORD SETUP ===" -ForegroundColor Yellow
$successLoginResponse = Test-Endpoint -Name "Login with Password" `
  -Method "Post" `
  -Endpoint "/api/auth/login" `
  -Body @{
    email = "sarah.johnson@example.com"
    password = "SecurePassword123"
  }

if ($successLoginResponse.data.token) {
  $validToken = $successLoginResponse.data.token
  Write-Host "OK: JWT Token received" -ForegroundColor Green
}

if ($validToken) {
  Write-Host ""
  Write-Host "=== PROTECTED ROUTE WITH VALID TOKEN ===" -ForegroundColor Yellow
  Test-Endpoint -Name "Get My Children (Valid Token)" `
    -Method "Get" `
    -Endpoint "/api/child/mychildren" `
    -Headers @{
      "Authorization" = "Bearer $validToken"
    }
}

Write-Host ""
Write-Host "=== ADMIN LOGIN ===" -ForegroundColor Yellow
$adminLoginResponse = Test-Endpoint -Name "Admin Login" `
  -Method "Post" `
  -Endpoint "/api/auth/login" `
  -Body @{
    email = "admin@aidaa.com"
    password = "admin123"
  }

if ($adminLoginResponse.data.token) {
  Write-Host "OK: Admin token received" -ForegroundColor Green
  Write-Host "Role: $($adminLoginResponse.data.user.role)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== COMPREHENSIVE TEST COMPLETE ===" -ForegroundColor Cyan
