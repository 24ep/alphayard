@echo off
title Bondarys Dev Console

echo --- Starting Bondarys Development Environment ---

:: Start Backend in a new window
echo [1/3] Starting Backend...
start "Backend" cmd /c "cd backend && npm run dev"

:: Start Admin in a new window
echo [2/3] Starting Admin...
start "Admin" cmd /c "cd admin && npm run dev"

:: Start Mobile in a new window
echo [3/3] Starting Mobile Web...
start "Mobile" cmd /c "cd mobile && npm run web"

echo --- All services are starting in separate windows ---
echo Backend: http://localhost:3000
echo Admin:   http://localhost:3001
echo Mobile:  http://localhost:8081
pause
