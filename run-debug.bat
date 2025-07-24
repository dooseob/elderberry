@echo off
echo === Elderberry Debug System (Windows) ===
echo Starting PowerShell debug system...
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PowerShell not found or not accessible
    echo Please check your PowerShell installation
    pause
    exit /b 1
)

REM Execute the debug system
powershell -ExecutionPolicy Bypass -File "debug-system.ps1"

pause