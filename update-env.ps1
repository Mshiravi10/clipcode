$envPath = "apps/web/.env"

$envContent = @"
DATABASE_URL=postgresql://postgres:123@localhost:5432/clipcode
NEXTAUTH_SECRET=your_secret_change_this_in_production_123456789
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=Iv23liKIVB09C8YpSPh0
GITHUB_SECRET=generate_this_from_github_settings
"@

$envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force

Write-Host "✅ Updated .env file with your GitHub credentials"
Write-Host ""
Write-Host "⚠️  IMPORTANT: You still need to:"
Write-Host "1. Generate Client Secret from GitHub OAuth App settings"
Write-Host "2. Replace 'generate_this_from_github_settings' with your actual secret"
Write-Host "3. Update NEXTAUTH_SECRET with a strong random string"
Write-Host ""
Write-Host "Your .env is located at: apps/web/.env"


