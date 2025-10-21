@echo off

:: Change to the API directory
cd /d %~dp0\apps\api

:: Install dependencies using pnpm
call pnpm install --frozen-lockfile --prod

:: Build the application
call pnpm run build

:: Start the application
node dist\index
