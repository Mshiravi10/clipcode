#!/usr/bin/env pwsh
# Complete restart script with cleanup

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ClipCode - Complete Clean Restart" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clear all sessions from database
Write-Host "Step 1: Clearing all sessions from database..." -ForegroundColor Yellow
@'
DELETE FROM "Session";
'@ | npx prisma db execute --stdin
Write-Host "✓ Sessions cleared" -ForegroundColor Green
Write-Host ""

# Step 2: Clean Next.js cache
Write-Host "Step 2: Cleaning Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ .next directory removed" -ForegroundColor Green
} else {
    Write-Host "  (no .next directory found)" -ForegroundColor Gray
}
Write-Host ""

# Step 3: Generate Prisma Client
Write-Host "Step 3: Generating Prisma Client..." -ForegroundColor Yellow
Write-Host "  (this may fail due to file lock - it's OK)" -ForegroundColor Gray
$result = npx prisma generate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma Client generated" -ForegroundColor Green
} else {
    Write-Host "  Warning: Could not generate (will be generated on server start)" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Show environment info
Write-Host "Step 4: Environment Configuration:" -ForegroundColor Yellow
$nextauthUrl = (Get-Content .env -ErrorAction SilentlyContinue | Select-String "NEXTAUTH_URL" | ForEach-Object { $_.ToString().Split("=")[1].Trim('"') })
if ($nextauthUrl) {
    Write-Host "  NEXTAUTH_URL: $nextauthUrl" -ForegroundColor Cyan
} else {
    Write-Host "  Warning: NEXTAUTH_URL not found in .env" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Instructions
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Cleanup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Stop any running servers (Ctrl+C in terminal)" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. In your browser:" -ForegroundColor White
Write-Host "   - Press F12" -ForegroundColor White
Write-Host "   - Go to Application tab" -ForegroundColor White
Write-Host "   - Click Cookies" -ForegroundColor White
Write-Host "   - Delete all cookies for this site" -ForegroundColor White
Write-Host "4. Close and reopen your browser" -ForegroundColor White
Write-Host "5. Visit: http://192.168.161.27:3000/auth/signin" -ForegroundColor White
Write-Host ""
Write-Host "For debugging: http://192.168.161.27:3000/auth/debug" -ForegroundColor Cyan
Write-Host ""
