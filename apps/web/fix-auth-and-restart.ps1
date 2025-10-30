#!/usr/bin/env pwsh

Write-Host "`n🔧 Fixing Authentication Issues..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all Node processes
Write-Host "1️⃣  Stopping all Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "   Stopping process $($_.Id)..."
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "   Warning: Could not stop process $($_.Id)" -ForegroundColor Yellow
    }
}
Start-Sleep -Seconds 2

# Step 2: Clear invalid sessions from database
Write-Host "`n2️⃣  Clearing invalid sessions from database..." -ForegroundColor Yellow
$clearSessionsScript = @"
-- Clear all sessions to fix cookie mismatch
DELETE FROM "Session";
"@

$clearSessionsScript | npx prisma db execute --stdin

# Step 3: Verify NEXTAUTH_URL
Write-Host "`n3️⃣  Checking NEXTAUTH_URL configuration..." -ForegroundColor Yellow
$envContent = Get-Content .env -Raw
if ($envContent -match 'NEXTAUTH_URL=(.+)') {
    Write-Host "   Current NEXTAUTH_URL: $($matches[1])" -ForegroundColor Cyan
    Write-Host "   ✓ Using this URL for authentication" -ForegroundColor Green
}

# Step 4: Generate Prisma Client
Write-Host "`n4️⃣  Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate 2>&1 | Out-Null

# Step 5: Start the server
Write-Host "`n5️⃣  Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Ready! Server will start on http://192.168.161.27:3000" -ForegroundColor Green
Write-Host ""
Write-Host "📝 To test authentication:" -ForegroundColor Cyan
Write-Host "   1. Open http://192.168.161.27:3000 in your browser"
Write-Host "   2. You should be redirected to the sign-in page"
Write-Host "   3. Click 'Sign in with GitHub'"
Write-Host "   4. Authorize the app"
Write-Host ""
Write-Host "Press Ctrl+C to stop the server"
Write-Host ""

npm run dev

