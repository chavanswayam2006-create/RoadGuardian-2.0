# Architecture Decision Records (ADR): RoadGuardian 2.0

## ADR 001: Strict Dataset Isolation and Git Exclusion
- **Date**: 2026-09-25
- **Status**: Accepted
- **Context**: The GTSRB traffic sign dataset is private/local. Accidentally pushing hundreds of megabytes of raw images, labels, or archives to GitHub violates project rules and security hygiene.
- **Decision**: Configure root `.gitignore` to strictly exclude `data/local/`, `archive.zip`, all archives (`*.zip`, `*.tar`, `*.tar.gz`), model binaries, and `.env`. Ensure `.env.example` provides generic placeholders (`GTSRB_DATASET_PATH`). Run Git verification prior to any milestone completion.
- **Consequences**: Developers must place datasets locally in `data/local/GTSRB/` manually. Zero dataset files will ever be tracked by Git.

---

## ADR 002: Modular Two-Stage Processing Hypothesis for Sign Detection
- **Date**: 2026-09-25
- **Status**: Proposed / Pending Verification
- **Context**: GTSRB benchmark historically contains cropped traffic sign images rather than whole-scene bounding boxes. Assuming it supports object detection directly may fail.
- **Decision**: Await manual inspection of the unzipped dataset before finalizing training architecture. Plan for a decoupled pipeline: upstream detector (YOLO or SSD) crops candidate signs, and downstream GTSRB classifier categorizes the specific sign class.
- **Consequences**: Prevents premature architectural lock-in and avoids hallucinating dataset capabilities.

---

## ADR 003: Tactical Mobility Cockpit Aesthetics via UI/UX Pro Max
- **Date**: 2026-09-25
- **Status**: Accepted
- **Context**: Hackathon demos often suffer from generic SaaS templates with pale pastel colors and poor contrast, which are unsuited for automotive safety HUDs.
- **Decision**: Initialize `ui-ux-pro-max-skill` and establish a high-contrast obsidian slate theme with crimson/amber semantic alerts and monospace telemetry typography.
- **Consequences**: The application will present a state-of-the-art mobility cockpit design.

---

## ADR 004: Client-Side Web SpeechSynthesis for Voice Alerts
- **Date**: 2026-09-25
- **Status**: Accepted
- **Context**: Driver voice alerts require real-time playback without cloud API costs, API key exposure, or network latency.
- **Decision**: Leverage the HTML5 Web SpeechSynthesis API directly in the React frontend. Manage debounce locks to prevent speech queue saturation.
- **Consequences**: Zero latency, zero cloud costs, 100% offline-capable voice synthesis.

---

## ADR 005: Source of Truth Hierarchy & Anti-Hallucination Protocol
- **Date**: 2026-09-25
- **Status**: Accepted
- **Context**: AI agents often hallucinate benchmark numbers, nonexistent APIs, or outdated documentation.
- **Decision**: Enforce strict priority:
  1. Actual source code
  2. Actual configuration files
  3. Actual tests
  4. Actual dataset/files
  5. Brain documentation
  6. Previous AI assumptions
  Mark any unverified claim as `UNKNOWN — REQUIRES VERIFICATION`.
- **Consequences**: Absolute architectural integrity and verifiable engineering progress.
