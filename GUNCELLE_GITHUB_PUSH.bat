@echo off
chcp 65001 > nul
echo ========================================================
echo   KPSS Ders Notlari - GitHub Guncelleme / Push Araci
echo ========================================================
echo.
cd /d "f:\- YapayZeka\PROJELER\ders-notlari"

echo [1/3] Git Durumu Kontrol Ediliyor...
git status

echo.
echo [2/3] GitHub'a Gonderiliyor (git push origin main)...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   BASARILI: Tum guncellemeler GitHub'a aktarildi!
    echo   Web siteniz 1-2 dakika icinde yayina girecek:
    echo   https://kuraiiae.github.io/ders-notlari/
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   HATA: Push sirasinda bir hata olustu.
    echo   Lutfen yukaridaki hata mesajini inceleyin.
    echo ========================================================
)

echo.
pause
