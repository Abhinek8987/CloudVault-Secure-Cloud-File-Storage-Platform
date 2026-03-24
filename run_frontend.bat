@echo off
title Cloud Storage - Frontend
echo Installing dependencies...
cd /d "%~dp0frontend"
call npm install
echo Starting Frontend...
call npm run dev
pause
