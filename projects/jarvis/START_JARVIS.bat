@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "JARVIS_MODEL=jarvis"
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3.12 jarvis.py
) else (
  python jarvis.py
)
if errorlevel 1 (
  echo JARVIS failed to start. Check jarvis.log.
  pause
)
