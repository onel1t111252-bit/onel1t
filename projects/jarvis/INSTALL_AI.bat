@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo JARVIS 4.3 - local AI model setup.
echo This step downloads about 2.5 GB if Qwen3 4B Instruct is not already installed.
echo If you already have Ollama model 'jarvis', you can skip this setup.
where ollama >nul 2>nul
if errorlevel 1 (
  echo Ollama is not installed. Install it first: https://ollama.com/download
  pause
  exit /b 1
)
ollama show jarvis >nul 2>nul
if not errorlevel 1 (
  echo JARVIS model is already installed. No changes made.
  pause
  exit /b 0
)
ollama pull qwen3:4b-instruct
if errorlevel 1 (
  echo Download failed. Try again while online.
  pause
  exit /b 1
)
ollama create jarvis -f Modelfile
if errorlevel 1 (
  echo Model creation failed.
) else (
  echo Model 'jarvis' is ready.
)
pause
