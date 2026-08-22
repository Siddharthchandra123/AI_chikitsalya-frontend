# AI Chikitsalya — Deployment Ready Prototype

## Stack
- Next.js 16 + React 19 + Tailwind CSS
- FastAPI model service
- scikit-learn Logistic Regression
- Docker Compose

## Run locally
1. `npm ci`
2. Start the model API: `cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000`
3. In another terminal: `npm run dev`
4. Open `http://localhost:3000/ai-detection`

On Windows PowerShell, use `backend\.venv\Scripts\pip` and `backend\.venv\Scripts\uvicorn`.

## Production
`docker compose up --build -d`

The frontend proxies `/api/predict` to the FastAPI service, so the model URL is not exposed to the browser.

## Important model note
The included model is a deterministic software/demo fixture trained from synthetic symptom prototypes. It is **not clinically validated**, and its scores must not be interpreted as disease probabilities or used for diagnosis, treatment, or emergency triage. For a real clinical deployment, replace the fixture with a properly licensed, clinically validated dataset/model, external validation, calibration, bias testing, monitoring, and appropriate regulatory/privacy controls.

OPD bookings use a named Docker volume (`opd-data`) so the demo booking store survives container restarts. For a high-scale production deployment, replace it with a managed database and add authentication, audit logging, rate limiting, encryption, and observability.

