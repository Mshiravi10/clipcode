Write-Host "`n=== ClipCode Clean Restart ===`n" -ForegroundColor Cyan

Write-Host "Clearing database sessions..." -ForegroundColor Yellow
npx prisma db execute --stdin <<'@
DELETE FROM "Session";
'@ 
Write-Host "Done!`n" -ForegroundColor Green

Write-Host "Cleaning .next cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "Done!`n" -ForegroundColor Green
} else {
    Write-Host "No cache to clear`n" -ForegroundColor Gray
}

Write-Host "=== Cleanup Complete! ===`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Stop server (Ctrl+C)" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White  
Write-Host "3. Clear browser cookies" -ForegroundColor White
Write-Host "4. Go to /auth/signin`n" -ForegroundColor White

