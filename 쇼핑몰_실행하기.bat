@echo off
chcp 65001 > nul
title [전주이씨 JEONJU LEE] 공식 온라인 쇼핑몰

echo ===================================================
echo   [전주이씨 JEONJU LEE] 공식 온라인 쇼핑몰 실행기
echo ===================================================
echo.
echo 브라우저에서 쇼핑몰을 엽니다...
echo 접속 주소: http://localhost:3000/
echo.

start http://localhost:3000/

netstat -ano | findstr :3000 > nul
if %errorlevel% neq 0 (
    echo [안내] 개발 서버를 시작합니다. 창을 닫지 마세요...
    npm.cmd run dev
) else (
    echo [완료] 이미 서버가 실행 중이어서 브라우저 창을 띄웠습니다!
    timeout /t 3 > nul
)
