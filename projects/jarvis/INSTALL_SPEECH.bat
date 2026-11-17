@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Installing local Whisper speech recognition. Close JARVIS first.
echo Downloads a multilingual model of roughly 500 MB once. Internet required.
echo After installation, speech is recognized locally; Google remains a fallback on errors.
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3.12 -m pip install "faster-whisper>=1.1,<2"
  if errorlevel 1 goto failed
  py -3.12 speech_input.py --install
) else (
  python -m pip install "faster-whisper>=1.1,<2"
  if errorlevel 1 goto failed
  python speech_input.py --install
)
if errorlevel 1 goto failed
echo Installation complete. Run START_JARVIS.bat.
pause
exit /b 0
:failed
echo Installation failed. Google recognition remains available. Check errors above.
pause
exit /b 1
