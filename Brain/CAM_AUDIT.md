# Brain Audit: CAM & Traffic Sign Recognition Pipeline

## 1. Executive Summary & Audit Overview
- **Audit Date**: 2026-09-26
- **Auditor**: Lead Architect & ML Perception Engineer
- **Component**: CAM / Live Vision Workstation (`frontend/src/pages/LiveDetectionPage.tsx`, `frontend/src/components/VisionCanvas.tsx`, `backend/services.py`, `ml/inference/`)
- **Key Finding**: The existing system already possessed a genuine, trained PyTorch CNN model (`ml/models/gtsrb_baseline.pt`) capable of 43-class German Traffic Sign Recognition (GTSRB), along with a two-stage color/geometry contour detector (`ml/inference/detector.py`). However, the UI was largely displaying hardcoded fallback detection info ("SPEED LIMIT (50KM/H)", 98% confidence, static coordinates [480, 140, 560, 220], and fake mean confidence values) even when no real sign was in view or when user opened the webcam. Furthermore, image upload was completely missing from the CAM page, and the camera interface was overcrowded with synthetic road animations and simulated telemetry.

---

## 2. Repository & Model Audit Findings

### A. ML Model Inspection
- **Model File**: `ml/models/gtsrb_baseline.pt` (PyTorch state dict).
- **Architecture**: `GTSRBBaselineCNN` defined in `ml/models/baseline_cnn.py`.
  - 3-stage convolutional network with Batch Normalization, Max Pooling, and Dropout.
  - Final classification layer: `Linear(128 * 6 * 6, 256) -> BatchNorm1d(256) -> Dropout(0.5) -> Linear(256, 43)`.
  - Input resolution: `3 x 48 x 48` normalized with `mean=[0.3403, 0.3121, 0.3214]` and `std=[0.2724, 0.2608, 0.2669]`.
- **Classification vs Detection**:
  - The CNN model is strictly an **Image Classifier** trained on cropped German Traffic Sign Recognition Benchmark (GTSRB) signs across 43 classes.
  - It expects a cropped image of a sign (or tightly bounded sign region).
- **Localization/Detection**:
  - Located in `ml/inference/detector.py` (`TrafficSignDetector`).
  - Proposes candidate regions using HSV color masking (Red, Blue, Yellow) and contour morphology with aspect ratio filtering.
  - Also contained a naive traffic signal detector that previously had a flaw: dark interior contours of circular speed limit signs (such as the number inside a red border) were erroneously being classified as a "Red Light" candidate. Suppressing signal candidates that overlap sign candidates resolves this issue cleanly.
- **Direct Crop vs Full Scene Recognition**:
  - When an image is a direct crop of a traffic sign (e.g. from GTSRB dataset, or when a user uploads a cropped sign image), the direct classifier achieves **99.6% - 100% confidence** on valid test signs (e.g. Test 00000: 99.9%, Test 00001: 100.0%, Test 00093 Stop: 99.9%).
  - On non-sign images (blank, white, random noise, hero portrait), the model confidence remains very low (< 35%), allowing clear distinction between valid traffic signs and non-sign imagery.

### B. Backend API Audit (`backend/`)
- **FastAPI Endpoints**:
  - `POST /detect` and `POST /api/v1/detect` (and `POST /api/v1/vision/detect-frame`).
  - Accepts `DetectRequest`: `{ image_base64: str, confidence_threshold: float, frame_id: int }`.
  - Currently decodes base64, runs `TrafficSignPipeline.process_frame(image_bgr)`, and returns `DetectResponse`:
    - `inference_time_ms`, `detections`, `detections_count`, `active_alert`.
- **Performance**:
  - Backend model loading is a singleton (`InferenceService.get_instance()`). Model weights are loaded **once** at server startup and retained in memory.
  - Measured inference latency on CPU: **~9.5 ms** for pipeline processing, **~18 ms** total FastAPI request processing.

### C. Frontend CAM Audit (`frontend/src/`)
- **Components & Pages**:
  - `frontend/src/pages/LiveDetectionPage.tsx`:
    - Displayed `VisionCanvas` on the left and "DETECTION INSPECTOR" on the right.
    - Contained hardcoded fallbacks:
      - Defaulted to `activeDetection` initialized with fake `SPEED LIMIT (50KM/H)` at 98% confidence.
      - Displayed static coordinates: `480 px, 140 px` / `560 px, 220 px`.
      - Displayed hardcoded `MEAN CONF: 96.4%` in bottom telemetry.
      - Mode switch between `SIM` and `CAM` had no dedicated stop/start control or manual upload.
  - `frontend/src/components/VisionCanvas.tsx`:
    - Had simulated animated road loop running continuously.
    - When webcam mode was selected, it initialized `getUserMedia` but still carried over the synthetic canvas overlays.
    - Missing: clear camera controls (Start Camera, Stop Camera, Upload Image, Optical Reticle Guide, Snapshot), status indicators (● ACTIVE / ● OFFLINE), and graceful camera permission denial/error handling.
    - Missing: Drag & drop and file picker upload pipeline.

---

## 3. Discovered Flaws & Fake Data to Remove
1. **Fake Initial Detections in `App.tsx` & `LiveDetectionPage.tsx`**:
   - Initial state had fake detection: `class_name: 'Speed limit (50km/h)', confidence: 0.98, bbox: [480, 140, 560, 220]`.
   - Replaced by empty state `[]` or strictly genuine recognition result.
2. **Fake Coordinate Inspector in `LiveDetectionPage.tsx`**:
   - Hardcoded strings `480 px, 140 px` and `1.00 (SQUARE)`.
   - Replaced with genuine measured normalized/pixel bounding coordinates or crop metadata from the backend response.
3. **Fake Mean Confidence**:
   - Hardcoded `96.4%`.
   - Replaced with measured inference confidence from the active detection or real running mean.
4. **Traffic Signal False Positive in Red Border Signs**:
   - Dark numbers inside red speed limit signs were triggering `_detect_traffic_signals` as a `Red Light`.
   - Fixed by filtering out signal candidates whose bounding box significantly overlaps a detected traffic sign candidate.
5. **Direct Crop Upload vs Scene Support**:
   - If user uploads a cropped traffic sign directly, the two-stage detector might not find outer contours if the sign fills 100% of the image. The pipeline should fall back to directly classifying the image if no outer scene candidates are proposed.

---

## 4. Verification Check
- Model weights: `ml/models/gtsrb_baseline.pt` exists and is ignored by Git (`git check-ignore`).
- Dataset: `data/local/GTSRB/` exists and is ignored by Git (`git check-ignore`).
- Class mapping: `ml/models/class_mapping.json` (43 classes) matches GTSRB class IDs exactly.
- Test Suite: 11 pytest tests passing.

---

## 5. Round 2 Audit — Backend Reachability, CORS & Camera Diagnostics (2026-09-26)

### A. Live Backend Verification (evidence-based)
- A backend process was already running: `C:\Program Files\Python314\python.exe backend/main.py` (pid 182608 at audit time; restarted as pid 183292 after the fixes).
- `GET /` -> **404** (no root route existed — the application itself was healthy, not broken).
- `GET /health` -> **200**: `status: healthy`, `gtsrb_classifier: active`, `classes_loaded: 43`, device `cpu`.
- `GET /docs` -> **200**; `GET /openapi.json` -> **200** (19,940 bytes).
- Registered routes: `/health`, `/detect`, `/driver-status`, `/road-context`, `/garages`, `/events` plus all `/api/v1/*` aliases. `/predict` and `/inference` do **not** exist; the canonical inference endpoint is **`POST /detect`**.

### B. Real Inference Smoke Test (no fabricated values)
- Image: `frontend/public/samples/sample_stop.png` (bundled sample asset).
- `POST /detect` -> 200: `label STOP`, `display_name "Stop"`, `metadata.class_id 14`, `confidence 0.9997`, `bounding_box {0.05, 0.0619, 0.94, 1.0}` (normalized), `inference_time_ms 7.23` (`preprocessing 0.01`, `detection 0.40`, `classification 6.81`).
- Contract alias `POST /api/v1/vision/detect-frame` returned the identical schema.
- Invalid payload -> `400 {"detail":"Invalid image input: Incorrect padding"}`.

### C. CORS Matrix (before -> after)
| Origin | Before | After |
| :--- | :--- | :--- |
| `http://localhost:5173` | allowed | allowed |
| `http://127.0.0.1:5173` | allowed | allowed |
| `http://localhost:4173` (vite preview) | **rejected** | allowed |
| `https://<anything>.vercel.app` | **rejected** (`*.vercel.app` was a literal string) | allowed (regex) |
| `https://evil-vercel.app.attacker.com` | rejected | rejected (regex anchored) |
| `Origin: null` (`file://`) | rejected | rejected (by design; serve over http://localhost) |

### D. Root Causes Recorded
1. **`MODEL SERVICE OFFLINE` despite a healthy backend** — the page was loaded from an origin outside the CORS allow-list (e.g. `vite preview` on 4173, a LAN IP, or `file://` -> `Origin: null`), or from a deployment without `VITE_API_BASE_URL` set (falling back to the viewer's own `http://localhost:8000`).
2. **Camera "No camera sensor detected"** — that message is only produced on a genuine browser `NotFoundError`; no code path couples camera state to backend state. Robustness gaps (facingMode constraints, secure-context, device enumeration) were still addressed.
3. **Fabricated results still present** — `DashboardPage.tsx` (Speed limit 50 km/h @ 98%), `VisionCanvas.tsx` (95% fallback), `App.tsx` (seeded "GTSRB verified 50 km/h" event). All removed in this round.

### E. Frontend API Configuration
- `frontend/src/services/api.ts` reads `import.meta.env.VITE_API_BASE_URL` with local fallback `http://localhost:8000`; a `getBaseUrl()` accessor now exposes the resolved target to the UI.
- Added `frontend/.env.example` documenting local vs. production usage and stating that a public HTTPS backend is **REQUIRED** for the deployed frontend.
- Offline states in the CAM page display the resolved API target for instant diagnosis.


