@echo off
echo ========================================
echo    IS YONETIM - BACKEND PUBLISH
echo ========================================
echo.

cd /d "%~dp0api"

echo Backend derleniyor...
dotnet publish -c Release -o ../dist

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    BASARILI!
    echo ========================================
    echo.
    echo Backend dist/ klasorune derlendi.
    echo Calistirmak icin: start.bat
) else (
    echo.
    echo ========================================
    echo    HATA!
    echo ========================================
    echo.
    echo Derleme sirasinda hata olustu.
)

echo.
pause
