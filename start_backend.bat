@echo off
title EventSphere Backend API
echo ========================================================
echo   Starting EventSphere Backend Server (Node.js + MySQL)
echo ========================================================
cd /d "%~dp0backend"
node server.js
pause

