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
- [ ] Inspect `archive.zip` contents when authorized by user.
- [ ] Verify directory structure, annotations, labels, and classes.
- [ ] Determine whether GTSRB supports bounding box detection or classification only.
- [ ] Formulate concrete model architecture based on verified dataset structure.
- [ ] Update `Brain/DATASET.md` and `Brain/AI_MODELS.md` with verified facts.

---

## Phase 3: Backend Scaffolding & API Contracts
- [ ] Create Python virtual environment and configure `requirements.txt`.
- [ ] Scaffold FastAPI backend application structure in `backend/`.
- [ ] Implement REST endpoints according to `Brain/API_CONTRACT.md`.
- [ ] Implement WebSocket endpoint (`/ws/telemetry`) for real-time telemetry streaming.
- [ ] Implement in-memory ring buffer and SQLite persistence for event logging.

---

## Phase 4: In-Cabin Driver Monitoring Pipeline (DMS)
- [ ] Implement facial landmark extraction using MediaPipe Face Mesh.
- [ ] Implement Eye Aspect Ratio (EAR) calculator with configurable blink/closure thresholds.
- [ ] Implement head pose / gaze estimation (Pitch, Yaw, Roll).
- [ ] Implement distraction and drowsiness state classifiers.
- [ ] Write unit tests for EAR and pose calculation.

---

## Phase 5: Road Context & Garage Mapping Integration
- [ ] Implement road context connector (reverse geocoding and road classification).
- [ ] Implement nearby repair garages provider with Overpass API and offline fallback.
- [ ] Integrate speed limit cross-referencing logic.

---

## Phase 6: Tactical Cockpit UI Development
- [ ] Initialize React + Vite application in `frontend/`.
- [ ] Configure Tailwind CSS with dark tactical cockpit color tokens.
- [ ] Implement `VisionCanvas` with live video stream and SVG bounding box overlay.
- [ ] Implement `DriverGauge` with EAR and gaze reticles.
- [ ] Implement `ContextMap` with Leaflet for vehicle route and garage markers.
- [ ] Implement client-side Web SpeechSynthesis audio alert engine with debounce logic.
- [ ] Implement `EventTicker` safety history timeline.

---

## Phase 7: System Integration & End-to-End Verification
- [ ] End-to-end integration test with sample driving video and webcam feed.
- [ ] Validate alert priority arbitration (Drowsiness vs Speed Warning).
- [ ] Conduct manual smoke test against Definition of Done checklist.
- [ ] Verify dataset remains Git-ignored prior to final commit.
