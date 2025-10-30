$envContent = @"
DATABASE_URL=postgresql://postgres:123@localhost:5432/clipcode
NEXTAUTH_SECRET=your_secret_change_this_in_production_123456789
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=your_github_oauth_app_id_here
GITHUB_SECRET=your_github_oauth_app_secret_here
"@

$envPath = "apps/web/.env"

if (Test-Path $envPath) {
    Write-Host ".env file already exists. Skipping..."
}
else {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "Created .env file at apps/web/.env"
}

Write-Host "Next steps:"
Write-Host "1. Update apps/web/.env with your GitHub OAuth credentials"
Write-Host "2. Generate a proper NextAuth secret: openssl rand -base64 32"
Write-Host "3. Update NEXTAUTH_SECRET in the .env file"
Write-Host "Environment configured!"
