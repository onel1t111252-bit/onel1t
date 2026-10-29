# ONEL1T Cyber Lab AI API

FastAPI backend for the Cyber Lab chat. The Gemini API key is read only from the server environment and must never be committed to Git.

## Deploy to Render

1. In Google AI Studio, create a replacement Gemini API key if you revoked the previously exposed one.
2. In Render, create a new Blueprint and select this repository. The blueprint file is `cyber-lab-api/render.yaml`.
3. When prompted, set `GEMINI_API_KEY` in the Render environment settings. Do not put it in frontend code, GitHub files, or chat.
4. Deploy. The service URL will look like `https://your-service-name.onrender.com`.
5. Test `https://your-service-name.onrender.com/health`; it should return JSON with status `ok`.
6. Add the service URL to the Cyber Lab frontend configuration as `https://your-service-name.onrender.com/api/chat`.

The free hosting tier may sleep when idle. Gemini free-tier availability and limits depend on the model, region, account and current Google terms. Free-tier prompts may be used to improve Google products; do not send real secrets or confidential production logs.

## Local development

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
# Set GEMINI_API_KEY as an environment variable before starting.
uvicorn main:app --reload --port 8000
```

Set `APP_ORIGIN` to your exact frontend origin if using a custom domain. The in-memory rate limit is a basic guard, not a substitute for production abuse protection.
