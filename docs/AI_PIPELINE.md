# AI Perception & Inference Pipeline: RoadGuardian 2.0

---

## 1. Executive Summary

RoadGuardian 2.0 deploys two dedicated vision subsystems running concurrently on CPU:
1. **Forward Perception Pipeline**: Detects candidate traffic sign contours and classifies them into 43 German Traffic Sign Recognition Benchmark (GTSRB) categories, plus traffic light status.
2. **In-Cabin Driver Monitoring System (DMS)**: Tracks face position and eye aspect ratios to detect driver distraction, micro-sleep, and fatigue.

---

## 2. Forward Perception: GTSRB Classifier & Candidate Detector

### 2.1 Stage 1: Candidate Detector (`ml/inference/detector.py`)
- **Status**: **REAL IMPLEMENTATION**
- **Methodology**: HSV color thresholding combined with geometric contour analysis.
  - Red mask: Extracts circular/triangular danger and prohibition signs (Speed limits, Stop, Yield, No Entry).
  - Blue mask: Extracts mandatory directional signs.
  - Yellow mask: Extracts construction and warning diamond signs.
  - Aspect Ratio & Area Filtering: Drops candidates with area < 100 pixels or aspect ratio deviating heavily from 1:1.
- **Crop Extraction**: Crops candidates with a 10% padding margin and passes them to Stage 2.

### 2.2 Stage 2: Neural Network Classifier (`ml/models/baseline_cnn.py`)
- **Status**: **REAL IMPLEMENTATION**
- **Architecture**: `GTSRBBaselineCNN`
  - Input: 3 x 48 x 48 RGB tensor (normalized with mean `[0.3403, 0.3121, 0.3214]` and std `[0.2724, 0.2608, 0.2669]`).
  - Block 1: `Conv2D(3->32)` -> `BatchNorm2D` -> `Conv2D(32->32)` -> `BatchNorm2D` -> `MaxPool2D(2,2)` -> `Dropout2D(0.20)`. Output: 32 x 24 x 24.
  - Block 2: `Conv2D(32->64)` -> `BatchNorm2D` -> `Conv2D(64->64)` -> `BatchNorm2D` -> `MaxPool2D(2,2)` -> `Dropout2D(0.25)`. Output: 64 x 12 x 12.
  - Block 3: `Conv2D(64->128)` -> `BatchNorm2D` -> `MaxPool2D(2,2)` -> `Dropout2D(0.30)`. Output: 128 x 6 x 6.
  - Fully Connected: `Linear(4608->256)` -> `BatchNorm1D` -> `Dropout(0.50)` -> `Linear(256->43)`.
  - Parameters: ~1.3 million parameters (5.34 MB model file `gtsrb_baseline.pt`).

### 2.3 Benchmark Evaluation Metrics (`ml/models/test_evaluation_metrics.json`)
The trained baseline model was independently evaluated on the full, uncompressed GTSRB test set:
- **Evaluation Dataset**: GTSRB `Test.csv`
- **Total Test Samples**: **12,630 images**
- **Top-1 Accuracy**: **98.67%** (12,462 / 12,630 correct classifications)
- **Top-5 Accuracy**: **99.87%**
- **Average Inference Latency**: **1.39 ms** per crop on standard CPU
- **Macro Average F1-Score**: **0.9801**
- **Weighted Average F1-Score**: **0.9867**

Sample Per-Class Precision & Recall:
| Sign Class | Name | Precision | Recall | F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Class 0 | Speed Limit 20 km/h | 1.0000 | 1.0000 | 1.0000 | 60 |
| Class 1 | Speed Limit 30 km/h | 0.9889 | 0.9903 | 0.9896 | 720 |
| Class 2 | Speed Limit 50 km/h | 0.9947 | 0.9973 | 0.9960 | 750 |
| Class 14 | Stop Sign | 0.9963 | 1.0000 | 0.9981 | 270 |
| Class 13 | Yield Sign | 0.9958 | 0.9944 | 0.9951 | 720 |
| Class 25 | Road Work | 0.9705 | 0.9792 | 0.9748 | 480 |

---

## 3. In-Cabin Driver Monitoring System (DMS)

- **Status**: **REAL IMPLEMENTATION**
- **Module**: `ml/inference/driver_monitor.py`

### 3.1 Face & Eye Tracking
- Utilizes pre-trained Haar Cascades (`haarcascade_frontalface_default.xml` and `haarcascade_eye.xml`) stored in `ml/models/cascades/`.
- Zero cloud reliance; runs entirely in local Python runtime.

### 3.2 Eye Aspect Ratio (EAR) Formulation
$$\text{EAR} = \frac{\text{Eye Height}}{\text{Eye Width}}$$
- When eye region is open: $\text{EAR} \approx 0.28 - 0.35$.
- When eyelids close: $\text{EAR} < 0.20$.
- **Temporal Drowsiness Classifier**: If $\text{EAR} < 0.20$ persists for $> 1200\text{ ms}$ (consecutive closed frames), the system transitions to `DROWSINESS_WARNING` and dispatches a high-priority voice alarm.

### 3.3 Head Pose & Gaze Drift Estimation
- Estimates relative horizontal displacement ($X_{face} - X_{center}$) and vertical displacement ($Y_{face} - Y_{center}$) normalized against frame dimensions:
  $$\text{Yaw} = (X_{norm} - 0.5) \times 60^\circ$$
  $$\text{Pitch} = (Y_{norm} - 0.5) \times 50^\circ$$
- **Distraction Classifier**: If $|\text{Yaw}| > 20^\circ$ or $\text{Pitch} > 15^\circ$ (looking down at mobile device) for $> 2000\text{ ms}$, the system triggers an `ATTENTION_WARNING`.

---

## 4. Ground Truth vs Simulation Declarations

- **Forward Sign Recognition**: **REAL IMPLEMENTATION** using trained PyTorch weights.
- **DMS Tracking**: **REAL IMPLEMENTATION** using OpenCV Haar Cascades with synthetic test bench controls for demonstration.
- **Traffic Signal Red Light Color Centroid**: **REAL IMPLEMENTATION** using HSV spatial segmentation.
- **MediaPipe 468-point Face Mesh**: **FUTURE FEATURE** (Haar Cascade implementation was selected for reliability and zero external C++ build dependencies on Windows).
