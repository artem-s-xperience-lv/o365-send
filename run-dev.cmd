@echo off
npm install
if %errorlevel% neq 0 exit /b %errorlevel%
npm run dev