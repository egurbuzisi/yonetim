@echo off
chcp 65001 > nul
echo ================================================
echo   YILDIRIM BELEDIYESI IS TAKIP SISTEMI
echo   .NET + SQL Server API
echo ================================================
echo.
echo   API: http://localhost:5000/api
echo.
echo   Durdurmak icin CTRL+C basin.
echo ================================================
echo.

cd /d "%~dp0"
dotnet IsYonetimAPI.dll --urls "http://localhost:5000"
pause
