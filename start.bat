@echo off
echo ========================================
echo    IS YONETIM - BASLATILIYOR
echo ========================================
echo.

:: Backend başlat (port 5000)
echo [1/3] Backend baslatiliyor (port 5000)...
cd /d "%~dp0backend"
start "Backend" cmd /c "dotnet IsYonetimAPI.dll"

:: 2 saniye bekle
timeout /t 2 /nobreak >nul

:: Messages API başlat (port 5001)
echo [2/3] Messages API baslatiliyor (port 5001)...
cd /d "%~dp0messages-api"
start "Messages API" cmd /c "npm start"

:: 2 saniye bekle
timeout /t 2 /nobreak >nul

:: Frontend başlat (port 5173)
echo [3/3] Frontend baslatiliyor (port 5173)...
cd /d "%~dp0frontend"
start "Frontend" cmd /c "npm run dev"

echo.
echo ========================================
echo    BASLATILDI!
echo ========================================
echo.
echo Backend:      http://localhost:5000
echo Messages API: http://localhost:5001
echo Frontend:     http://localhost:5173
echo.
echo Tarayicida http://localhost:5173 adresini acin.
echo.
pause
