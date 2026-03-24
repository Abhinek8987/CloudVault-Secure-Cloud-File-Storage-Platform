@echo off
title Cloud Storage - Backend
echo Starting Cloud Storage Backend...

set "JAVA_HOME=D:\Android Studio Internship\jbr"
set "PATH=%JAVA_HOME%\bin;C:\Windows\System32\WindowsPowerShell\v1.0;%PATH%"

echo Java version:
java -version
echo.

cd /d "%~dp0backend"
call mvnw.cmd spring-boot:run
pause
