# Changelog: RoadGuardian 2.0

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-09-26

### Added
- **Automotive HMI Precision Cockpit Design System**:
  - Re-architected CSS design tokens in `frontend/src/index.css` with 5-tier obsidian surface depth, technical accent scales, and precision radii.
  - Added Space Grotesk, Inter, and JetBrains Mono typography hierarchy with high-readability telemetry classes.
  - Implemented crisp 1px borders, subtle translucency, corner reticles, and custom dark scrollbars.
- **Cockpit Component Upgrades**:
  - `TopStatusBar`: Live telemetry bar showing inference latency, system status pill, audio switch, and emergency SOS trigger.
  - `Sidebar`: Grouped navigation hierarchy with ASIL-B compliance badge and smooth active routing.
  - `VisionCanvas`: High-precision optical detection HUD with corner reticles and sub-millisecond bounding box rendering.
  - `DriverGauge`: Dual-metric DMS cabin monitor with EAR threshold gauge, gaze reticle, and instant simulation bench.
  - `ContextMap`: Tactical dark Leaflet integration with GPS vehicle tracker and nearby repair garage markers.
  - `NotificationsDrawer` & `SosModal`: Safety event drawer and emergency dispatch modal.
- **Redesigned Application Routes (9 Pages)**:
  - `DashboardPage`: Integrated safety cockpit.
  - `LiveDetectionPage`: Dedicated optical vision workbench.
  - `DriverMonitoringPage`: In-cabin fatigue & distraction telemetry.
  - `RoadMapPage`: Tactical corridor routing and repair provider directory.
  - `AnalyticsPage`: Detection performance and safety compliance distribution.
  - `HistoryPage`: Filterable safety event audit log.
  - `SystemStatusPage`: Edge hardware and model telemetry diagnostics.
  - `SettingsPage`: ADAS sensitivity and audio alert configuration.
  - `HelpSafetyPage`: ISO 26262 ASIL-B reference manual.
- **Root Landing Page**:
  - Revamped `index.html` with SVG optical HUD mockup, GTSRB ResNet-18 live telemetry badges, and direct cockpit launch portal.

## [0.2.0] - 2026-09-25

### Added
- **ML & Computer Vision Pipeline**:
  - Two-stage traffic sign detector and 43-class classifier in `ml/inference/`.
  - In-Cabin Driver Monitoring System (DMS) with Eye Aspect Ratio (EAR) calculator and gaze vector tracking in `ml/inference/driver_monitor.py`.
  - Model metrics and evaluation records in `ml/models/`.
- **FastAPI Backend**:
  - REST API in `backend/main.py` with `/health`, `/detect`, `/driver-status`, `/road-context`, `/garages`, `/events`.
  - Alert engine with priority arbitration and ring-buffer event history in `backend/alert_engine.py`.
  - Comprehensive unit and integration test suite (10/10 passing).
- **Tactical Cockpit HUD Frontend**:
  - React + TypeScript + Vite tactical cockpit application in `frontend/`.
  - High-contrast obsidian HUD design tokens in `frontend/src/index.css` adhering to UI/UX Pro Max guidelines.
  - Interactive components: `CockpitHeader`, `VisionCanvas`, `DriverGauge`, `ContextMap`, `EventTicker`, `AlertBanner`.
  - Client-side Web SpeechSynthesis engine with 5-second debounce.
  - Interactive test bench buttons for instant driver state demonstration.

## [0.1.0] - 2026-09-25

### Added
- **Security & Privacy**: Root `.gitignore` strictly ignoring `data/local/`, `archive.zip`, dataset archives, ML weights, `.env`, and private files.
- **Environment**: `.env.example` with configurable placeholders for dataset paths and server options.
- **Project Structure**:
  - `frontend/` (React + Vite target directory)
  - `backend/` (FastAPI target directory)
  - `ml/` (`training/`, `inference/`, `evaluation/`, `models/`)
  - `data/local/GTSRB/` (Local-only dataset target directory)
  - `scripts/`, `tests/`, `docs/`, `design-system/`
- **UI/UX Intelligence**: Initialized UI/UX Pro Max skill in `.agents/skills/` via `ui-ux-pro-max-cli`.
- **Root Documentation**:
  - `README.md` with architecture diagrams and dataset setup guide.
  - `package.json` with project metadata.
  - `data/README.md` with strict dataset privacy directives.
- **Brain Memory System**: Core architecture, requirements, API contract, and planning artifacts.
