# Brain Plan: Real Camera Traffic Sign Recognition & Upload System

## 1. Current Architecture
- **Perception**: Two-stage pipeline (`TrafficSignPipeline` in `ml/inference/pipeline.py`):
  1. `TrafficSignDetector`: Proposes candidate bounding boxes via HSV color masking and contours.
  2. `GTSRBClassifier`: PyTorch CNN (`ml/models/gtsrb_baseline.pt`) that classifies 48x48 cropped patches into 43 GTSRB classes.
- **Backend**: FastAPI app (`backend/main.py`) exposing `/detect` taking `{ image_base64, confidence_threshold, frame_id }`.
- **Frontend**: React + TypeScript + Vite with `LiveDetectionPage` and `VisionCanvas`.

---

## 2. Identified Problems
1. **Hardcoded Fallbacks in UI**: Fake `SPEED LIMIT (50KM/H)` at 98% confidence was seeded in `App.tsx` and shown whenever `detections` had default items.
2. **Hardcoded Telemetry & Coordinates**: Inspector displayed static coordinates `480 px, 140 px` / `560 px, 220 px` and `MEAN CONF: 96.4%`.
3. **No Image Upload Pipeline**: Users could not upload images (JPG, PNG, WEBP) to test GTSRB images or custom signs.
4. **Camera Controls Incomplete**: No explicit Start / Stop camera button, no permission denial UX, no error state notifications.
5. **Direct Crop Ingestion Gap**: When user uploads a cropped sign image (like GTSRB test samples), contour detector might find 0 candidate boxes if the sign touches the edge.
6. **False Signal Detection**: Dark numbers inside red circular signs were triggering `_detect_traffic_signals` as a `Red Light`.

---

## 3. Proposed Architecture
```
Camera Frame (Webcam) OR Manual Image Upload (File / Drag & Drop)
                      │
                      ▼
             Image Preprocessing
    (Resolution sanity check, base64 / BGR decode)
                      │
                      ▼
           Candidate Localization
    1. Color & Contour Detector (Proposes ROIs)
    2. Overlap Arbitration (Filter signals inside signs)
                      │
        ┌─────────────┴─────────────┐
        │ Candidates Found?         │
       YES                          NO
        │                           │
        ▼                           ▼
Classify each crop ROI      Direct Whole-Image Evaluation
via GTSRBClassifier          (Handles tightly cropped sign
        │                     uploads or centered camera feeds)
        └─────────────┬─────────────┘
                      │
                      ▼
            Confidence Gating
   - High Confidence (>= 75%): VERIFIED SIGN
   - 50% - 74%: DETECTED
   - cutoff - 50%: MARGINAL (reported, flagged as uncertain)
   - 25% - cutoff: LOW CONFIDENCE (UNCERTAIN)
   - < 25% / none: NO TRAFFIC SIGN DETECTED
                      │
                      ▼
          Clean Automotive UI
  Left: Live Camera / Upload Viewport with Guide Reticle
  Right: Genuine RECOGNITION RESULT Panel
```

---

## 4. Implementation Steps
1. **Backend / ML Fixes**:
   - Update `TrafficSignDetector` in `ml/inference/detector.py`: Filter out traffic signal fixtures that overlap traffic signs.
   - Update `TrafficSignPipeline` in `ml/inference/pipeline.py`: Add direct crop fallback if candidate detector yields 0 candidates on an uploaded/cropped image (aspect ratio 0.5-2.0), gated at `max(threshold, DIRECT_CROP_MIN_CONFIDENCE = 0.65)` and tagged `ingestion_mode: "DIRECT_CROP"` so degenerate uploads (noise, gradients, blurred texture) are rejected.
2. **Frontend Camera & Upload Component**:
   - Refactor `LiveDetectionPage.tsx` to host genuine camera management (`getUserMedia`), drag-and-drop file upload, file validation (formats and size limit 10MB), and frame sampling.
   - Refactor `VisionCanvas.tsx` so the live camera feed is genuine and uncluttered.
3. **App.tsx State Cleanup**:
   - Remove fake initial detections. Initialize with empty array `[]`.
4. **Validation & Verification**:
   - Run backend pytest tests (`pytest tests`); `tests/test_live_detection.py` covers genuine GTSRB signs, the three served sample assets, the DIRECT_CROP fallback, region detection on padded signs, and negative controls (random noise, flat gray, cluttered scene, soft gradient).
   - Run frontend TypeScript check (`npx tsc --noEmit`) and build (`npm run build`).
   - Run real-world image tests with GTSRB test signs, non-sign noise, and webcam simulation.

