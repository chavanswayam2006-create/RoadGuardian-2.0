# Project Overview: RoadGuardian 2.0
**AI Traffic Sign Recognition & Driver Safety System**

## 1. Executive Summary
- **Project Name**: RoadGuardian 2.0
- **Scope**: 3-Day Hackathon MVP (Functional demonstration, NOT production-ready).
- **Core Purpose**: An intelligent in-cabin and forward-road safety assistant combining real-time computer vision, driver attention analytics, contextual road intelligence, and voice feedback into a cohesive mobility safety dashboard.

---

## 2. Core Pillars

| Pillar | Focus | Technology Target |
| :--- | :--- | :--- |
| **Forward Perception** | Traffic Sign Recognition (GTSRB classes), Traffic Signals (Red/Yellow/Green), Speed Limit detection | Computer Vision, OpenCV, YOLO / CNN |
| **Driver Monitoring** | Facial landmark tracking, Eye Aspect Ratio (EAR) for drowsiness, head pose for distraction | MediaPipe / OpenCV |
| **Context & Geo-Layer** | Road context mapping, construction zone warnings, speed limit cross-referencing, nearby repair garages | OpenStreetMap / Leaflet |
| **Alert Engine** | Audio-visual warnings, alert de-duplication, safety priority scoring | Browser Web SpeechSynthesis / local audio |
| **Cockpit HUD** | High-contrast, tactical driver assistance interface | React, Vite, Tailwind CSS (UI/UX Pro Max) |

---

## 3. Strict Operating & Privacy Policies

### Dataset Privacy & Local Isolation
- **Rule**: The GTSRB dataset is PRIVATE/LOCAL project data and **MUST NEVER** be committed to Git or pushed to GitHub.
- **Enforcement**: Root `.gitignore` strictly ignores `data/local/`, `archive.zip`, all dataset archives (`*.zip`, `*.tar`, `*.tar.gz`), extracted frames, and ML model binaries.
- **Configurability**: No personal or local machine paths are hardcoded. Paths must resolve via environment variables (e.g., `GTSRB_DATASET_PATH`).

### Brain Operating Protocol & Source of Truth Priority
1. **Actual source code**
2. **Actual configuration files**
3. **Actual tests**
4. **Actual dataset/files**
5. **Brain documentation**
6. **Previous AI assumptions**

### No Hallucination Policy
- Never invent model accuracy, frames per second (FPS), dataset size, class distributions, benchmark metrics, or third-party API availability.
- Any unverified assumption or metric must be marked:
  `UNKNOWN — REQUIRES VERIFICATION` or `NOT VERIFIED`.
