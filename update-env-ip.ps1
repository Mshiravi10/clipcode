$envPath = "apps/web/.env"

$envContent = @"
DATABASE_URL=postgresql://postgres:123@localhost:5432/clipcode
NEXTAUTH_SECRET=your_secret_change_this_in_production_123456789
NEXTAUTH_URL=http://192.168.161.27:3000
GITHUB_ID=Iv23liKIVB09C8YpSPh0
GITHUB_SECRET=8928ab8336863dd61862c6f08e5e14a87d8efb6d
"@

$envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force

Write-Host "Updated .env with IP address configuration"
Write-Host ""
Write-Host "IMPORTANT: Update your GitHub OAuth App settings:"
Write-Host ""
Write-Host "Homepage URL: http://192.168.161.27:3000"
Write-Host "Callback URL: http://192.168.161.27:3000/api/auth/callback/github"
Write-Host ""
Write-Host "Then restart the dev server!"


