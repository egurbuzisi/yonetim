@echo off
echo ========================================
echo    IS YONETIM - GELISTIRME MODU
echo ========================================
echo.

:: Backend başlat (dotnet run - development mode)
echo [1/3] Backend baslatiliyor (dotnet run - port 5000)...
cd /d "%~dp0api"
start "Backend DEV" cmd /c "dotnet run"

:: 3 saniye bekle (dotnet restore için)
timeout /t 3 /nobreak >nul

:: Messages API başlat (port 5001)
echo [2/3] Messages API baslatiliyor (port 5001)...
cd /d "%~dp0messages-api"
start "Messages API" cmd /c "npm start"

:: 2 saniye bekle
timeout /t 2 /nobreak >nul

:: Frontend başlat (port 5173)
echo [3/3] Frontend baslatiliyor (port 5173)...
cd /d "%~dp0frontend"
start "Frontend DEV" cmd /c "npm run dev"

echo.
echo ========================================
echo    GELISTIRME MODU BASLATILDI!
echo ========================================
echo.
echo Backend (DEV):   http://localhost:5000
echo Messages API:    http://localhost:5001
echo Frontend (DEV):  http://localhost:5173
echo.
echo Kod degisiklikleri otomatik yenilenir.
echo.
pause
