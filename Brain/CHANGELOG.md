# Changelog: RoadGuardian 2.0

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **Brain Memory System**:
  - `Brain/PROJECT.md`
  - `Brain/REQUIREMENTS.md`
  - `Brain/ARCHITECTURE.md`
  - `Brain/TECH_STACK.md`
  - `Brain/DATASET.md`
  - `Brain/AI_MODELS.md`
  - `Brain/API_CONTRACT.md`
  - `Brain/UI_SYSTEM.md`
  - `Brain/DECISIONS.md`
  - `Brain/TASKS.md`
  - `Brain/BUGS.md`
  - `Brain/TEST_RESULTS.md`
  - `Brain/INTEGRATION.md`
  - `Brain/CHANGELOG.md`
  - `Brain/SESSION_LOG.md`
  - `Brain/DEFINITION_OF_DONE.md`
