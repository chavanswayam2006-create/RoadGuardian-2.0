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

- **Traffic Sign Detection mAP@0.5**: `NOT VERIFIED`
- **GTSRB Classification Accuracy**: `NOT VERIFIED`
- **Driver Monitoring Frame Processing FPS**: `NOT VERIFIED`
- **End-to-End Inference Latency**: `NOT VERIFIED`
- **Hardware Profile**: CPU default (`INFERENCE_DEVICE=cpu`)

---

## 4. Model Training & Export Strategy (Planned)
- Training scripts will reside in `ml/training/`.
- Inference wrappers will reside in `ml/inference/`.
- Evaluation and benchmark scripts will reside in `ml/evaluation/`.
- Export formats to be evaluated: PyTorch `.pt` for rapid prototyping, ONNX for optimized local inference.
