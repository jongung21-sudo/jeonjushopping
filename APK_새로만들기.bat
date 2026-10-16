@echo off
chcp 65001 > nul
echo ========================================================
echo       전주이씨 안드로이드 APK 앱 빌드를 시작합니다
echo ========================================================

echo 1. 웹 리소스 최신 빌드 중...
call npm run build
if %errorlevel% neq 0 (
    echo [오류] 웹 빌드 실패
    pause
    exit /b %errorlevel%
)

echo 2. 안드로이드 프로젝트 동기화 중...
call npx cap sync android
if %errorlevel% neq 0 (
    echo [오류] 안드로이드 동기화 실패
    pause
    exit /b %errorlevel%
)

echo 3. 안드로이드 APK 생성 중 (Gradle)...
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "ANDROID_HOME=C:\Users\406\AppData\Local\Android\Sdk"

cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo [오류] APK 빌드 실패
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..

copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "전주이씨_쇼핑몰.apk"
echo.
echo ========================================================
echo   [성공] 전주이씨_쇼핑몰.apk 파일이 생성되었습니다!
echo   위치: %~dp0전주이씨_쇼핑몰.apk
echo ========================================================
pause
