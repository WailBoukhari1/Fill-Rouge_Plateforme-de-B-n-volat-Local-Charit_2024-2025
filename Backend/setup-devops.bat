@echo off
setlocal enabledelayedexpansion

echo ===== DevOps Environment Setup =====
echo This script will check your system and set up the DevOps environment
echo.

:: Check Docker
echo Checking Docker installation...
docker --version > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
    echo [32m✓ Docker is installed: %DOCKER_VERSION%[0m
) else (
    echo [31m✗ Docker is not installed. Please install Docker first.[0m
    exit /b 1
)

:: Check Docker Compose
echo Checking Docker Compose installation...
docker-compose --version > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('docker-compose --version') do set COMPOSE_VERSION=%%i
    echo [32m✓ Docker Compose is installed: %COMPOSE_VERSION%[0m
) else (
    echo [31m✗ Docker Compose is not installed. Please install Docker Compose first.[0m
    exit /b 1
)

:: Check system resources
echo Checking system resources...
for /f "tokens=2 delims==" %%a in ('wmic OS get TotalVisibleMemorySize /value') do set TOTAL_MEM=%%a
set /a TOTAL_MEM_GB=%TOTAL_MEM:~0,-1%/1024/1024

if %TOTAL_MEM_GB% GEQ 4 (
    echo [32m✓ System has sufficient memory: %TOTAL_MEM_GB%GB[0m
) else (
    echo [33m⚠ System has less than 4GB of RAM (%TOTAL_MEM_GB%GB). This might not be enough.[0m
    set /p CONTINUE="Do you want to continue anyway? (y/n) "
    if /i "!CONTINUE!" NEQ "y" exit /b 1
)

:: Check disk space
echo Checking disk space...
for /f "tokens=3" %%a in ('dir /-c . ^| findstr "bytes free"') do set FREE_SPACE=%%a
echo [32m✓ Available disk space: %FREE_SPACE% bytes[0m

:: Check if services are already running
echo Checking if services are already running...
docker ps | findstr "jenkins\|sonarqube\|mongodb\|frontend\|backend" > nul
if %ERRORLEVEL% EQU 0 (
    echo [33m⚠ Some services are already running. Stopping them...[0m
    docker-compose down
)

:: Check Docker socket
echo Checking Docker daemon access...
docker info > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [32m✓ Docker daemon is accessible.[0m
) else (
    echo [33m⚠ Cannot access the Docker daemon.[0m
    echo Make sure Docker Desktop is running and properly configured.
)

echo.
echo [33mSystem check completed.[0m
set /p START_SERVICES="Do you want to start the DevOps services now? (y/n) "
if /i "%START_SERVICES%" EQU "y" (
    echo [33mStarting services...[0m
    docker-compose up -d
    
    echo [33mWaiting for services to start...[0m
    echo This might take a few minutes on first run.
    
    :: Wait for services to be healthy
    set COUNT=0
    set MAX_WAIT=30
    echo|set /p="Waiting for services to become healthy"
    :wait_loop
    if %COUNT% GEQ %MAX_WAIT% goto :wait_done
    
    timeout /t 10 /nobreak > nul
    echo|set /p="."
    set /a COUNT+=1
    goto :wait_loop
    
    :wait_done
    echo.
    
    echo.
    echo [32m===== DevOps Services Setup Complete =====[0m
    echo Access your services at:
    echo  - Frontend Application: http://localhost
    echo  - Backend API: http://localhost:8081
    echo  - Jenkins: http://localhost:8080
    echo  - SonarQube: http://localhost:9000
    echo  - Portainer: https://localhost:9443
    echo.
    echo For more information, refer to the devops-services-guide.md
) else (
    echo You can start the services later with: docker-compose up -d
)

endlocal 