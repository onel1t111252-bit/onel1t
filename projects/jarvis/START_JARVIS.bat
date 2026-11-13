@echo off
chcp 65001 >nul
cd /d "%~dp0"
REM Respect the model chosen and saved in JARVIS settings.json.
REM Override only when JARVIS_MODEL is explicitly set by the user.
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3.12 jarvis.py
) else (
  python jarvis.py
)
if errorlevel 1 (
  echo JARVIS failed to start. Check jarvis.log or Python installation.
  pause
)
