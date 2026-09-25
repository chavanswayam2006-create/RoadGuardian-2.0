# Test Results: RoadGuardian 2.0

## Test Run: 2026-09-25 (Project Initialization & Security Check)

### 1. Environment & Runtime Checks
- **Python**: `Python 3.14.7` — Verified
- **Node.js**: `v26.8.2` — Verified
- **npm**: `11.18.0` — Verified
- **Git Remote**: `https://github.com/chavanswayam2006-create/RoadGuardian-2.0.git` — Verified

### 2. Git Exclusion & Security Verification
| Target Path / Pattern | Rule in `.gitignore` | Command Output | Status |
| :--- | :--- | :--- | :--- |
| `archive.zip` (641MB) | `*.zip` (line 10) | Matched `.gitignore:10:*.zip` | **PASS (Ignored)** |
| `data/local/GTSRB/Meta.csv` | `data/local/` (line 6) | Matched `.gitignore:6:data/local/` | **PASS (Ignored)** |
| `.env` | `.env` (line 44) | Matched `.gitignore:44:.env` | **PASS (Ignored)** |
| `.env.local` | `*.local` (line 98) | Matched `.gitignore:98:*.local` | **PASS (Ignored)** |
| `ml/models/best.pt` | `ml/models/*.pt` (line 33) | Matched `.gitignore:33:ml/models/*.pt` | **PASS (Ignored)** |
| `.env.example` | `!.env.example` (line 50) | Negation tracked properly | **PASS (Tracked)** |

### 3. Skill & Tooling Verification
- `uipro init -a antigravity`: Executed cleanly; installed `.agents/skills/` with 7 skill directories:
  - `banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling`, `ui-ux-pro-max`.

---

## Test Run: 2026-09-26 (Live Backend, CORS & CAM Diagnostics Verification)

### 1. Backend Process & Routing
| Check | Method | Result | Status |
| :--- | :--- | :--- | :--- |
| Backend running | Port-8000 owner inspection | `python.exe backend/main.py` (pid 182608) | **PASS** |
| `GET /` (before fix) | `Invoke-WebRequest http://127.0.0.1:8000/` | 404 `Not Found` — no root route existed | **EXPECTED (not a fault)** |
| `GET /` (after fix) | same | 200 JSON service index | **PASS** |
| `GET /health` | `Invoke-WebRequest` | 200, `status: healthy`, `classes_loaded: 43` | **PASS** |
| `GET /docs` | `Invoke-WebRequest` | 200 (Swagger UI) | **PASS** |
| `GET /openapi.json` | `Invoke-WebRequest` | 200 (19,940 bytes) | **PASS** |

### 2. Real Inference (`POST /detect`, no fabricated values)
- Input: `frontend/public/samples/sample_stop.png` (bundled sample asset).
- Result: `label STOP`, `display_name "Stop"`, `class_id 14`, `confidence 0.9997`, `inference_time_ms 7.23`, normalized `bounding_box {0.05, 0.0619, 0.94, 1.0}`.
- Contract alias `POST /api/v1/vision/detect-frame` returned the identical schema.
- Invalid image payload -> `400 {"detail":"Invalid image input: Incorrect padding"}`.
- **Status: PASS** — model loaded and produced genuine predictions.

### 3. CORS Matrix (after repair)
| Origin | `Access-Control-Allow-Origin` | Status |
| :--- | :--- | :--- |
| `http://localhost:5173` | echoed | **PASS** |
| `http://127.0.0.1:5173` | echoed | **PASS** |
| `http://localhost:4173` | echoed | **PASS** |
| `http://127.0.0.1:4173` | echoed | **PASS** |
| `https://frontend-mu-tan-79.vercel.app` | echoed | **PASS** |
| `https://roadguardian-2-0-git-feature-x.vercel.app` | echoed (regex) | **PASS** |
| `https://evil-vercel.app.attacker.com` | absent | **PASS (correctly rejected)** |
| `Origin: null` | absent | **Expected** (serve over http://localhost, not `file://`) |

### 4. Frontend Build & Automated Tests
- `npx tsc -b --force` -> exit 0 (zero type errors).
- `npm run build` (frontend) -> exit 0, built in 845 ms.
- `python -m pytest tests -q` -> **16 passed** in 6.57 s.

### 5. Git Protection Re-verified
| Path | `git check-ignore -v` | Status |
| :--- | :--- | :--- |
| `data/local/GTSRB` | `.gitignore:6:data/local/` | **PASS (Ignored)** |
| `ml/models/gtsrb_baseline.pt` | `.gitignore:33:ml/models/*.pt` | **PASS (Ignored)** |
| `.env` | `.gitignore:44:.env` | **PASS (Ignored)** |
| `archive.zip` | `.gitignore:10:*.zip` | **PASS (Ignored)** |
| `frontend/.env` | `frontend/.gitignore:16:.env` | **PASS (Ignored)** |
| `frontend/.env.example` | negation rule tracked | **PASS (Tracked)** |

### 6. Not Covered By Automation (manual browser checks)
- Real webcam capture (permission prompt, live stream, stop/release) requires physical hardware and a user gesture — to be confirmed manually on the target machine.
- Backend-offline browser behaviour (camera stays active while model shows OFFLINE) is implemented and type-checked but requires a manual browser confirmation.

