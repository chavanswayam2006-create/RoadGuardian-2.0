# Tech Stack Specification: RoadGuardian 2.0

## 1. Stack Matrix

| Layer | Technology | Version / Specification | Rationale & Status |
| :--- | :--- | :--- | :--- |
| **Language (Backend)** | Python | 3.14.7 (Installed) | Modern asynchronous backend, native ML ecosystem. |
| **Language (Frontend)** | TypeScript / JavaScript | Node.js v26.8.2 (Installed) | Type-safe, reactive UI development. |
| **Backend Framework** | FastAPI + Uvicorn | Planned | High-performance async API with native WebSocket support. |
| **Frontend Framework** | React 18+ via Vite | Planned | Ultra-fast HMR, component modularity. |
| **Styling** | Tailwind CSS | Planned | Utility-first styling configured with dark cockpit palette. |
| **Computer Vision** | OpenCV (`opencv-python`) | Planned | Frame acquisition, color space conversion, pose estimation. |
| **Object Detection** | Ultralytics YOLO | Planned | High-accuracy, real-time sign and signal candidate locator. |
| **Driver Monitoring** | MediaPipe | Planned | Lightweight 468-point face landmark mesh for EAR & gaze. |
| **Mapping & Context** | Leaflet / React-Leaflet | Planned | Zero-key interactive map rendering with OpenStreetMap tiles. |
| **Voice Synthesis** | Web SpeechSynthesis API | Planned | Client-side native TTS; zero network latency or external keys. |
| **Design Intelligence** | UI/UX Pro Max Skill | Installed (`.agents/skills/`) | Design reasoning engine for automotive safety cockpit aesthetic. |
| **Database** | SQLite3 | Planned | Local, zero-config telemetry and safety event storage. |

---

## 2. Dependency Management Rules
- Do **NOT** install libraries globally or indiscriminately.
- Dependencies will be installed only when their respective subsystem is actively under development.
- Python requirements will be isolated in virtual environment (`venv/`, git-ignored).
- Frontend dependencies will be locked via `package.json` in `frontend/`.
