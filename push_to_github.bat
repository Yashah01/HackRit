@echo off
title Push College Life Scheduler to GitHub
echo ========================================================
echo Pushing College Life Scheduler to GitHub
echo Target Repository: https://github.com/Yashah01/HackRit
echo ========================================================
echo.
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" push -u origin main
if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo SUCCESS: Repository pushed successfully to GitHub
    echo View it here: https://github.com/Yashah01/HackRit
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo If authentication is required, please sign in using your browser or Personal Access Token.
    echo ========================================================
)
echo.
pause
