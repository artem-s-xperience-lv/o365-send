@echo off
npm run build
if %errorlevel% neq 0 exit /b %errorlevel%
npm run start