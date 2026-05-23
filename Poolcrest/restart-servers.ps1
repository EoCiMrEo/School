# Quick Fix Script - Run this to restart your servers

Write-Host "Stopping any running processes..."
Start-Sleep -Seconds 2

Write-Host "`nStarting Django Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd be; python -m daphne -b 0.0.0.0 -p 8000 core.asgi:application"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd fe; npm run dev"

Write-Host "`nServers started!"
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:4028"
Write-Host "`nCheck the Diagnostic Panel in the browser for status"
