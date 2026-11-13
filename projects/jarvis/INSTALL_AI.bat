@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ONEL1T JARVIS - NEW LOCAL AI (Qwen3.5 4B)
echo Free local model via Ollama. Download is approximately 3.3-4.0 GB.
echo Existing old "jarvis" model and settings will NOT be deleted.
where ollama >nul 2>nul
if errorlevel 1 (
  echo Ollama is missing. Install it from https://ollama.com/download
  pause
  exit /b 1
)
ollama show qwen3.5:4b >nul 2>nul
if not errorlevel 1 (
  echo Qwen3.5 4B is already installed.
  echo Select "AI: QWEN3.5:4B" in JARVIS if needed.
  pause
  exit /b 0
)
ollama pull qwen3.5:4b
if errorlevel 1 (
  echo Model download failed. Check internet and free disk space.
  pause
  exit /b 1
)
echo.
echo Qwen3.5 4B installed. Start JARVIS and press CHECK AI.
echo Select "AI: QWEN3.5:4B" in the Intelligence card if necessary.
pause
