@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Installing microphone packages for JARVIS...
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3.12 -m pip install "SpeechRecognition[audio]>=3.10,<4"
) else (
  python -m pip install "SpeechRecognition[audio]>=3.10,<4"
)
echo Microphone speech recognition sends recordings to Google.
pause
