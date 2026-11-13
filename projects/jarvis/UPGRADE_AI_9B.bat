@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ONEL1T JARVIS - OPTIONAL STRONGER LOCAL AI (Qwen3.5 9B)
echo WARNING: This model needs substantially more system RAM/VRAM.
echo Download size is approximately 6.6-7.6 GB. The 4B model is the default.
echo Your old models will not be deleted.
choice /C YN /N /M "Download the optional larger model? [Y/N] "
if errorlevel 2 exit /b 0
where ollama >nul 2>nul
if errorlevel 1 (
  echo Install Ollama first from https://ollama.com/download
  pause
  exit /b 1
)
ollama pull qwen3.5:9b
if errorlevel 1 (
  echo Download failed or disk space exhausted.
  pause
  exit /b 1
)
echo.
echo Qwen3.5 9B is installed. Open JARVIS and switch the AI button to 9B.
pause
