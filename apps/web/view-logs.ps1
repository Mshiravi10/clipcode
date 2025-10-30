$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/clipcode"

Write-Host "=== Error Logs Summary ===" -ForegroundColor Cyan
psql $env:DATABASE_URL -c "SELECT level, COUNT(*) as count FROM `"ErrorLog`" GROUP BY level ORDER BY count DESC;"

Write-Host "`n=== Recent Errors (Last 10) ===" -ForegroundColor Cyan
psql $env:DATABASE_URL -c "SELECT id, level, message, `"createdAt`" FROM `"ErrorLog`" ORDER BY `"createdAt`" DESC LIMIT 10;"

Write-Host "`n=== Errors with Stack Traces ===" -ForegroundColor Cyan
psql $env:DATABASE_URL -c "SELECT id, level, message, `"createdAt`" FROM `"ErrorLog`" WHERE `"stackTrace`" IS NOT NULL ORDER BY `"createdAt`" DESC LIMIT 10;"

Write-Host "`n=== OAuth Events ===" -ForegroundColor Cyan
psql $env:DATABASE_URL -c "SELECT id, message, `"createdAt`" FROM `"ErrorLog`" WHERE message LIKE 'OAuth%' ORDER BY `"createdAt`" DESC LIMIT 10;"

