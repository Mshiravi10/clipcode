#!/usr/bin/env pwsh

Write-Host "🚀 Starting ClipCode Development Server..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "   Please create .env from env.example" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# Start the dev server
Write-Host ""
Write-Host "✅ Starting Next.js on http://192.168.161.27:3000" -ForegroundColor Green
Write-Host ""
npm run dev

