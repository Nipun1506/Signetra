# SIGNETRA
**Your hands, your voice.**

A real-time symbolic sign language recognition platform for deaf and mute users. SIGNETRA utilizes localized Python and MediaPipe heuristics deployed alongside a modern React interface.

## Architecture

*   **Frontend**: React 18, Vite, TypeScript, TailwindCSS v3, Framer Motion, Zustand.
*   **Backend**: Python, FastAPI, MediaPipe (OpenCV), SQLite.
*   **Extension**: Chrome Manifest V3 Overlay.

## Quick Start (Docker)

1. Ensure Docker Desktop is running.
2. Run `docker-compose up --build -d`
3. Access Frontend at `http://localhost:5173`
4. Access Backend at `http://localhost:8000`

## Quick Start (Manual Development)

**1. Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**2. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**3. Extension:**
1. Open Chrome -> `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` directory.

## Features Built
1. **Live Translator Menu**: 640x480 webcam capture utilizing EdgeTTS speech capabilities and SVG bounding.
2. **Global Components**: LoaderOne, Globe Hero animation, Container scroll components.
3. **Admin & Logs**: Simulated Admin configuration panels for data exporting.
4. **Learning Library**: Simulated database tables to view symbol definitions.

## System Configuration Details
* Backend Camera input relies on index `0` by default. Can be modified in `.env`.
* Ensure Node 18+ and Python 3.9+ are installed natively if bypassing Docker.

---
*Built via Antigravity Agent*
