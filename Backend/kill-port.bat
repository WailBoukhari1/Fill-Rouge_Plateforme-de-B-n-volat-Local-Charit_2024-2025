@echo off
echo Killing processes on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| find ":8080" ^| find "LISTENING"') do (
    echo Found process: %%a
    taskkill /F /PID %%a
    echo Process %%a terminated.
)
echo Done. 