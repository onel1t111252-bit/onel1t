@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Installing JARVIS hands-free voice and Ukrainian neural voice...
echo Google handles microphone recognition online. Microsoft handles neural voice text online.
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3.12 -m pip install -r requirements.txt
) else (
  python -m pip install -r requirements.txt
)
if errorlevel 1 (
  echo Installation failed. Check Python 3.12 and your internet connection.
) else (
  echo Installation finished! Start START_JARVIS.bat.
)
pause
