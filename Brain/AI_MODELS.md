# AI Models Specification: RoadGuardian 2.0

## 1. Model Overview & Inventory

| Subsystem | Model Role | Candidate Architecture | Weights / Artifact | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Traffic Sign Detection** | Locate sign bounding boxes in driving scene | YOLOv8n / SSD MobileNet | `ml/models/sign_detector.pt` | UNKNOWN — REQUIRES VERIFICATION |
| **Traffic Sign Classifier** | Classify cropped sign into GTSRB class | Custom CNN / ResNet-18 / MobileNetV3 | `ml/models/gtsrb_classifier.pt` | UNKNOWN — REQUIRES VERIFICATION |
| **Traffic Signal Detector** | Detect traffic light fixtures and signal state | YOLOv8n / Color heuristic | `ml/models/traffic_light.pt` | UNKNOWN — REQUIRES VERIFICATION |
| **Driver Monitoring (DMS)**| Facial landmark mesh, eye aspect ratio, head pose | MediaPipe Face Mesh / Dlib 68-landmark | Runtime library bundle | UNKNOWN — REQUIRES VERIFICATION |

---

## 2. Storage & Git Exclusion Policy
- **Directory**: `ml/models/`
- **Exclusion**: All model weight binaries (`*.pt`, `*.pth`, `*.onnx`, `*.engine`, `*.tflite`, `*.h5`) are strictly ignored by `.gitignore`.
- **Allowed in Git**: Lightweight configuration YAML files, class label maps (`classes.json`), and architecture definition code.

---

## 3. Performance & Benchmark Metrics

> [!NOTE]
> In compliance with the **No Hallucination Policy**, no accuracy, mAP, FPS, or latency numbers are fabricated.

- **Traffic Sign Detection mAP@0.5**: `NOT VERIFIED` (no labeled detection benchmark has been executed)
- **GTSRB Classification Accuracy**: `MEASURED` — offline metrics in `ml/models/test_evaluation_metrics.json`; live smoke check 2026-09-26: bundled Stop sample classified as GTSRB class 14 "Stop" at `0.9997` confidence
- **Single-frame inference latency (CPU, live backend)**: `MEASURED 2026-09-26` — `inference_time_ms 7.23` (`preprocessing 0.01`, `detection 0.40`, `classification 6.81`) for a 640x480-equivalent sample via `POST /detect`
- **Driver Monitoring Frame Processing FPS**: `NOT VERIFIED`
- **Hardware Profile**: CPU default (`INFERENCE_DEVICE=cpu`)

---

## 5. Verified Model I/O Contract (2026-09-26)

### 5.1 Stage 1 - TrafficSignDetector (localization, classical CV - no ML weights)
- **Input**: BGR image (full road frame or upload), any resolution.
- **Method**: HSV color masks (red / blue / yellow) + contour and aspect-ratio filtering; traffic-light candidates overlapping a sign candidate are suppressed.
- **Output**: candidate bounding boxes with color category. If nothing is proposed, no detection is reported (never fabricated).

### 5.2 Stage 2 - GTSRBClassifier (PyTorch CNN)
- **Weights**: `ml/models/gtsrb_baseline.pt` (state dict under `model_state_dict`, loaded once at process start).
- **Architecture**: `GTSRBBaselineCNN` (3 conv stages with BatchNorm + MaxPool + Dropout -> Linear(256) -> Linear(43)).
- **Input tensor**: `3 x 48 x 48` RGB, normalized with `mean=[0.3403, 0.3121, 0.3214]`, `std=[0.2724, 0.2608, 0.2669]`.
- **Output**: 43-class softmax; response carries `class_id`, `label`, `display_name`, `category`, `confidence`, `severity`, `speed_limit_kmh` (all from `ml/models/class_mapping.json`).

### 5.3 DIRECT_CROP fallback (tight uploads / centered frames)
- If the detector proposes no candidate region, the whole image is classified directly and tagged `metadata.ingestion_mode = "DIRECT_CROP"`.
- The fallback is accepted only at `confidence >= max(caller_threshold, DIRECT_CROP_MIN_CONFIDENCE = 0.65)`; this gate was raised from 0.45 after measuring that degenerate inputs (soft gradients ~0.49, blurred textures ~0.49) scored far below genuine sign crops (0.95-1.00).

### 5.4 Verified live response (ground truth)
- `POST /detect` with `frontend/public/samples/sample_stop.png` -> `label STOP`, `display_name "Stop"`, `class_id 14`, `confidence 0.9997`, `inference_time_ms 7.23`, normalized `bounding_box {x_min 0.05, y_min 0.0619, x_max 0.94, y_max 1.0}`.
- The classifier is **classification only**; localization comes from the classical detector above. The pipeline is validated on cropped sign imagery - accuracy on arbitrary real-world photos has not been benchmarked, so no accuracy claim is made.

---

## 6. Model Training & Export Strategy (Planned)
- Training scripts will reside in `ml/training/`.
- Inference wrappers will reside in `ml/inference/`.
- Evaluation and benchmark scripts will reside in `ml/evaluation/`.
- Export formats to be evaluated: PyTorch `.pt` for rapid prototyping, ONNX for optimized local inference.
