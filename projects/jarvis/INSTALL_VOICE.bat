@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo JARVIS 3.0 - installing voice, audio and foreground UI dependencies...
echo Neural voice sends text to Microsoft. Microphone recognition sends audio to Google.
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3.12 -m pip install -r requirements.txt
) else (
  python -m pip install -r requirements.txt
)
if errorlevel 1 (
  echo Installation failed. Check internet connection and Python 3.12.
) else (
  echo Installation successful. Start START_JARVIS.bat.
)
pause
