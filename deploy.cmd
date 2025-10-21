@echo off
setlocal enabledelayedexpansion

echo Starting custom deployment for ParkingMate API...

:: Install pnpm globally if not available
where pnpm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing pnpm globally...
    call npm install -g pnpm@9.15.0
)

:: Install dependencies from root (workspace)
echo Installing workspace dependencies...
call pnpm install --frozen-lockfile

:: Change to the API directory
echo Changing to API directory...
cd /d %~dp0\apps\api

:: Install production dependencies for API package
echo Installing API production dependencies...
call pnpm install --frozen-lockfile --prod

:: Build the application
echo Building the application...
call pnpm run build

echo Deployment completed successfully!
