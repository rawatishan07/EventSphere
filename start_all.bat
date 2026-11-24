@echo off
title EventSphere Launcher
echo ========================================================
echo   Launching EventSphere Full Stack System
echo ========================================================
start "EventSphere Backend" cmd /k "%~dp0start_backend.bat"
timeout /t 2 /nobreak >nul
start "EventSphere Frontend" cmd /k "%~dp0start_frontend.bat"
echo.
echo Services launched!
echo Frontend will be accessible at: http://localhost:5174
echo Backend API will be accessible at: http://localhost:5000

