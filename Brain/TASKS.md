# Task Board: RoadGuardian 2.0

## Phase 1: Project Setup, Inspection, & Security Initialization
- [x] Inspect existing workspace and detect untracked `archive.zip` (641MB).
- [x] Configure `.gitignore` with strict dataset, archive, secret, and model binary protections.
- [x] Verify Git ignore rules (`archive.zip`, `data/local/GTSRB/`, `.env`, `*.pt`).
- [x] Create `.env.example` with non-sensitive configurable placeholders.
- [x] Scaffold project directory tree (`frontend/`, `backend/`, `ml/`, `data/local/GTSRB/`, etc.).
- [x] Initialize UI/UX Pro Max design intelligence skill (`.agents/skills/`).
- [x] Establish root `package.json` and `README.md` with dataset setup instructions.
- [x] Author core Brain memory files.

---

## Phase 2: Dataset Inspection & ML Pipeline Verification
- [x] Inspect `archive.zip` contents and verify directory structure, annotations, labels, and classes.
- [x] Determine GTSRB two-stage architecture: candidate sign detector + ResNet-18 classifier (43 classes).
- [x] Establish baseline model definitions, label manager, and training pipeline (`ml/training/train_baseline.py`).
- [x] Verify model performance metrics (`ml/models/baseline_training_metrics.json`, `test_evaluation_metrics.json`).
- [x] Update `Brain/DATASET.md` and `Brain/AI_MODELS.md` with verified facts.

---

## Phase 3: Backend Scaffolding & API Contracts
- [x] Scaffold FastAPI backend application structure in `backend/` (`main.py`, `config.py`, `schemas.py`, `services.py`).
- [x] Implement REST endpoints according to `Brain/API_CONTRACT.md` (`/health`, `/detect`, `/driver-status`, `/road-context`, `/garages`, `/events`).
- [x] Implement alert prioritization engine (`backend/alert_engine.py`) with ring buffer event storage.
- [x] Author comprehensive backend test suite (`tests/test_backend.py`, `tests/test_alert_engine.py`) with 100% pass rate.

---

## Phase 4: In-Cabin Driver Monitoring Pipeline (DMS)
- [x] Implement facial landmark extraction and face detection (`ml/inference/driver_monitor.py`).
- [x] Implement Eye Aspect Ratio (EAR) calculator with configurable blink/closure thresholds (0.20 threshold).
- [x] Implement head pose and gaze estimation (Pitch, Yaw, Roll).
- [x] Implement distraction and drowsiness state temporal classifiers.
- [x] Write and pass unit tests for EAR and pose calculation (`tests/test_driver_monitor.py`).

---

## Phase 5: Road Context & Garage Mapping Integration
- [x] Implement road context connector (geocoding, speed limits, road classification with DEMO_DATA fallback).
- [x] Implement nearby repair garages provider with distance, rating, and contact information.
- [x] Integrate speed limit cross-referencing logic and overspeed alert triggers.

---

## Phase 6: Tactical Cockpit UI Development
- [x] Initialize React + TypeScript + Vite application in `frontend/`.
- [x] Configure tactical cockpit design system in `frontend/src/index.css` adhering to `Brain/UI_SYSTEM.md`.
- [x] Implement `VisionCanvas` with live video stream, synthetic road simulator, and SVG bounding box overlay.
- [x] Implement `DriverGauge` with EAR progress bar, 2D gaze reticle, and test bench state simulator.
- [x] Implement `ContextMap` with Leaflet dark map, live vehicle reticle, and nearby garage pins.
- [x] Implement client-side Web SpeechSynthesis audio alert engine with debounce logic (`useSpeechAlerts`).
- [x] Implement `EventTicker` safety history timeline with category filtering and audio indicators.

---

## Phase 7: System Integration & End-to-End Verification
- [x] End-to-end integration test with sample driving video and live backend.
- [x] Validate alert priority arbitration (Critical Drowsiness vs Warning Overspeed vs Advisory Signs).
- [x] Conduct test suite execution (10/10 pytest tests passing).
- [x] Build and compile frontend with zero errors (`tsc -b && vite build`).
- [x] Launch both servers concurrently (FastAPI at `http://127.0.0.1:8000`, Vite at `http://localhost:5173/`).
- [x] Verify dataset and secret files remain strictly Git-ignored.

---

## Phase 8: Automotive HMI Precision Cockpit Redesign
- [x] Full audit of all 9 routes, components, animations, colors, and typography.
- [x] Re-architect design tokens (`frontend/src/index.css`) with 5-tier obsidian surface depth, Space Grotesk/Inter/JetBrains Mono typography, and crisp telemetry utilities.
- [x] Redesign tactical components: `TopStatusBar`, `Sidebar`, `VisionCanvas`, `DriverGauge`, `ContextMap`, `AlertBanner`, `NotificationsDrawer`, `SosModal`, `BrandLogo`.
- [x] Redesign all 9 application routes: Dashboard, Live Detection, Driver Monitoring, Road Map, Analytics, History, System Status, Settings, Help & Safety.
- [x] Modernize root landing page (`index.html`) with live optical SVG HUD representation and technical cards.
- [x] Fix all TypeScript strict typing issues and verify zero compilation errors (`tsc -b && vite build`).


---

## Phase 9: Deployment Hardening & Error Boundary Resilience
- [x] Configure dual-target hosting support (GitHub Pages base path via `VITE_BASE_PATH` & Vercel rewrite configuration).
- [x] Expand backend CORS settings in `backend/config.py` for cloud-hosted frontend origins.
- [x] Embed dedicated `ErrorBoundary` components around high-risk dynamic canvas/map modules (`VisionCanvas`, `ContextMap`, and root routed page content).
- [x] Verify frontend builds cleanly (`npm run build`) and backend tests pass (11/11 tests).

