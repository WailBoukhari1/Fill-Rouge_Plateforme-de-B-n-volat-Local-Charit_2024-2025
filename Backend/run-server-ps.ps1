# PowerShell script to start the Spring Boot application
Write-Host "Starting Spring Boot application..."

# Change directory to the Backend directory (though this should be unnecessary if running from Backend folder)
# Kill any existing process on port 8080
$running = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($running) {
    $process = Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Killing process using port 8080: $($process.ProcessName) (PID: $($process.Id))"
        Stop-Process -Id $process.Id -Force
    }
}

Write-Host "Running Spring Boot application..."
# Run the Spring Boot application
./mvnw spring-boot:run 