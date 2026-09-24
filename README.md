# RoadGuardian 2.0
### AI Traffic Sign Recognition & Driver Safety System

[![Status: In Development](https://img.shields.io/badge/status-initialization-blue.svg)](#)
[![Hackathon MVP](https://img.shields.io/badge/hackathon-3--day--MVP-orange.svg)](#)
[![Privacy Enforced](https://img.shields.io/badge/dataset-local--only-red.svg)](#)

RoadGuardian 2.0 is an intelligent driver-assistance system that integrates real-time forward-facing camera analytics (traffic signs, signals, speed limits) and driver-facing monitoring (drowsiness, distraction) with context-aware navigation aids (road context, construction warnings, nearby garages, and voice alerts).

---

## Architecture Overview

```
                      +-----------------------------+
                      |       Video Feed / WebCam   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    Frame Preprocessing      |
                      +--------------+--------------+
                                     |
                  +------------------+------------------+
                  |                                     |
                  v                                     v
     +-------------------------+           +-------------------------+
     |   Forward Vision Pipeline|          | Driver Monitor Pipeline |
     |  - Traffic Sign Detect  |          | - Facial Landmark / Eye |
     |  - Traffic Light State  |          | - Head Pose / Attention |
     |  - Speed Limit Match    |          | - Drowsiness / Fatigue  |
     +------------+------------+           +------------+------------+
                  |                                     |
                  +------------------+------------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Normalized Event Stream   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | Confidence & Deduplication  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |       Alert Engine          |
                      | (Audio cues, Priority state)|
                      +--------------+--------------+
                                     |
                  +------------------+------------------+
                  |                                     |
                  v                                     v
     +-------------------------+           +-------------------------+
     |   Frontend UI Dashboard  |          | In-Memory / SQLite Log  |
     |  - Live Video Overlay   |          | - Detection History     |
     |  - Voice Synthesizer    |          | - Safety Event Log      |
     |  - Map & Context Panel  |          +-------------------------+
     +-------------------------+
```

---

## Dataset Privacy & Local Setup

> **CRITICAL SECURITY RULE:** The dataset (GTSRB) contains local project files and **MUST NEVER** be committed or pushed to Git/GitHub. All dataset files are git-ignored by default.

### Obtaining & Placing the Dataset Locally

1. Download the GTSRB dataset from Kaggle or the official benchmark portal (e.g., German Traffic Sign Recognition Benchmark).
2. Place the uncompressed dataset inside the local directory:
   ```
   data/
   └── local/
       └── GTSRB/
           ├── Meta/ (or Meta.csv)
           ├── Train/ (or Train.csv)
           └── Test/  (or Test.csv)
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Verify or adjust the path variable in `.env`:
   ```env
   GTSRB_DATASET_PATH=./data/local/GTSRB
   ```
5. Confirm Git ignore is active:
   ```bash
   git status
   ```
   *The `data/local/` directory and any archive files must not appear in untracked files.*

---

## Directory Structure

```
RoadGuardian-2.0/
│
├── Brain/                # Project brain & persistent architecture context
│   ├── PROJECT.md
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── TECH_STACK.md
│   ├── DATASET.md
│   ├── AI_MODELS.md
│   ├── API_CONTRACT.md
│   ├── UI_SYSTEM.md
│   ├── DECISIONS.md
│   ├── TASKS.md
│   ├── BUGS.md
│   ├── TEST_RESULTS.md
│   ├── INTEGRATION.md
│   ├── CHANGELOG.md
│   ├── SESSION_LOG.md
│   └── DEFINITION_OF_DONE.md
│
├── frontend/             # React + Vite + Tailwind CSS dashboard
├── backend/              # FastAPI server & streaming endpoints
├── ml/                   # Machine learning pipelines
│   ├── training/         # Dataset loaders, fine-tuning scripts
│   ├── inference/        # Runtime detectors & model wrappers
│   ├── evaluation/       # Accuracy, latency, benchmark tools
│   └── models/           # Architectures & weights (weights git-ignored)
├── data/
│   └── local/
│       └── GTSRB/        # Local-only GTSRB dataset (GIT-IGNORED)
├── scripts/              # Utility scripts for data setup and checks
├── tests/                # Unit and integration tests
├── docs/                 # Documentation assets
├── design-system/        # UI token configurations & design assets
├── .env.example          # Environment variable template
├── .gitignore            # Git exclusion rules
├── README.md             # Project documentation
└── package.json          # Root metadata
```

---

## Development Prerequisites

- **Python**: 3.10+ (Current environment: Python 3.14)
- **Node.js**: 18+ (Current environment: Node.js v26.8.2)
- **Git**

---

## Source of Truth Protocol

All contributors and AI agents must follow the **Brain Operating Protocol**:
1. Inspect implementation before relying on documentation.
2. Never invent benchmarks, dataset stats, or APIs without verification.
3. Label unverified components as `UNKNOWN — REQUIRES VERIFICATION`.
