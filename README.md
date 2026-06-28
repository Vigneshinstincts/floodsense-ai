# FloodSense AI 🌧️ — Bengaluru Smart Commute Assistant

> Navigate Bengaluru safely during floods and heavy rain.

FloodSense AI answers one question: **"What is the safest, fastest, and most affordable route right now?"**

## Features
- 🌦️ Live weather + rain forecast
- 🚨 Flood risk scoring (Low / Medium / High)
- 🗺️ Safest route with interactive map (Leaflet.js)
- 🚌 Estimated BMTC bus fare
- 🚕 Estimated cab fare
- 🚦 Live traffic status overlay

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | HTML · CSS · JavaScript · Leaflet.js |
| Backend | Python · FastAPI |
| Database | MySQL (Clever Cloud free tier) |
| Data Processing | Pandas |
| Deployment | Vercel (frontend) · Render (backend) |

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in your API keys
uvicorn app.main:app --reload
```

### Frontend
Open `frontend/index.html` in your browser, or deploy to Vercel.

## Environment Variables
See `backend/.env.example` for all required variables.

## Live Demo
- Frontend: [Coming soon on Vercel]
- API Docs: [Coming soon on Render]

## License
MIT