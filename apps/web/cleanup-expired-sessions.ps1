$baseUrl = "http://localhost:3000"
if ($args.Count -gt 0) {
    $baseUrl = $args[0]
}

Write-Host "Cleaning up expired sessions from: $baseUrl" -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/sessions/cleanup" -Method POST -ContentType "application/json"
    Write-Host "Success! Cleaned up $($response.retrievableData.deletedCount) expired sessions" -ForegroundColor Green
    Write-Host "Cleanup date: $($response.retrievableData.cleanupDate)" -ForegroundColor Gray
}
catch {
    Write-Host "Error cleaning up sessions: $_" -ForegroundColor Red
}

