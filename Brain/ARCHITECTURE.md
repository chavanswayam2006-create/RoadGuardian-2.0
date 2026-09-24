# Architecture Specification: RoadGuardian 2.0
**AI Traffic Sign Recognition & Driver Safety System**

## 1. System Architecture Overview

RoadGuardian 2.0 is designed around a modular, event-driven pipeline that decouples frame ingestion, neural inference, event deduplication, alerting, and tactical UI rendering.

```
+----------------------------------------------------------------------------------------------------+
|                                         INGESTION LAYER                                            |
|   +------------------------------------+          +------------------------------------+           |
|   | Forward Camera / Test Video Stream |          |  Cabin Webcam / Driver Face Stream  |           |
|   +-----------------+------------------+          +-----------------+------------------+           |
+---------------------|-----------------------------------------------|------------------------------+
                      v                                               v
+----------------------------------------------------------------------------------------------------+
|                                    FRAME PREPROCESSING & SYNC                                      |
|   - Resolution normalization (e.g. 640x640)         - Face ROI isolation                           |
|   - Timestamp tagging                               - Color conversion (BGR -> RGB)                |
+---------------------+-----------------------------------------------+------------------------------+
                      |                                               |
                      v                                               v
+--------------------------------------------------+ +-----------------------------------------------+
|         FORWARD VISION INFERENCE ENGINE          | |            DRIVER MONITORING ENGINE           |
|   Stage 1: Sign / Signal Detector (YOLO/SSD)    | |  - Facial Landmark Extraction (MediaPipe)   |
|   Stage 2: Sign Classification (GTSRB CNN)*      | |  - Eye Aspect Ratio (EAR) Calculation       |
|   Stage 3: Light State Classifier (RGB rules/CNN)| |  - Head Pose / Gaze Angle Estimation        |
|   *Pipeline structure: UNKNOWN - TO BE VERIFIED  | |  - Distraction / Drowsiness Classifier      |
+---------------------+----------------------------+ +----------------+------------------------------+
                      |                                               |
                      +-----------------------+-----------------------+
                                              |
                                              v
+----------------------------------------------------------------------------------------------------+
|                                      NORMALIZED EVENT EMITTER                                      |
|   Generates standardized `DetectionEvent` and `DriverStateEvent` payloads                          |
+---------------------------------------------+------------------------------------------------------+
                                              |
                                              v
+----------------------------------------------------------------------------------------------------+
|                               CONFIDENCE FILTER & DEDUPLICATION ENGINE                             |
|   - Drops detections below confidence threshold (e.g. < 0.50)                                      |
|   - Debounces repetitive consecutive detections (e.g. suppress duplicate alert within 5s window)   |
|   - Applies temporal smoothing across consecutive frames                                           |
+---------------------------------------------+------------------------------------------------------+
                                              |
                                              v
+----------------------------------------------------------------------------------------------------+
|                                         ALERT ENGINE                                               |
|   - Evaluates alert severity: `INFO` | `WARNING` | `CRITICAL`                                       |
|   - Prioritizes conflicting alerts (e.g. Drowsiness > Speed Limit Sign)                             |
|   - Dispatches visual cues and audio/voice payload strings                                         |
+---------------------------------------------+------------------------------------------------------+
                                              |
                     +------------------------+------------------------+
                     |                                                 |
                     v                                                 v
+---------------------------------------------+   +--------------------------------------------------+
|            TACTICAL HUD FRONTEND            |   |               PERSISTENCE & LOGGING              |
|  - React + Vite + Tailwind Cockpit UI       |   |  - In-Memory ring buffer (recent 100 events)     |
|  - Real-time Video Canvas + Bounding Boxes  |   |  - SQLite Telemetry DB (safety incident history) |
|  - Web SpeechSynthesis Voice Alert Trigger  |   |  - Event Query & Export API                      |
|  - Context Map (Leaflet / OpenStreetMap)    |   +--------------------------------------------------+
|  - Speedometer & Driver Status Indicators   |
+---------------------------------------------+
```

---

## 2. Core Data Flow Pipeline

```
Camera Frame
  └──> Frame Preprocessing (resize, RGB conversion, aspect ratio preservation)
        └──> AI Inference (Forward Signs/Signals + Cabin Face Mesh)
              └──> Normalized Detection Event & Driver State Generation
                    └──> Confidence Filtering (threshold gating)
                          └──> Event Deduplication (spatial IOU & temporal debouncing)
                                └──> Alert Engine (priority arbitration)
                                      ├──> UI Tactical HUD (live overlay & warnings)
                                      ├──> Voice Synthesizer (browser TTS)
                                      └──> History Logger (in-memory ring buffer & SQLite)
```

---

## 3. Subsystem Breakdown

### 3.1 Frontend (Cockpit Dashboard)
- **Framework**: React 18+ with Vite for rapid HMR.
- **Styling**: Tailwind CSS configured with a dark tactical mobility theme (generated via `ui-ux-pro-max-skill`).
- **Core Views**:
  - `VisionFeedView`: Dual canvas displaying forward road feed with real-time bounding boxes and cabin driver camera thumbnail.
  - `AlertHUD`: Prominent visual banners (Safety Amber for warnings, Danger Crimson for critical alerts).
  - `DriverTelemetry`: Gauge indicators for EAR, blink frequency, gaze direction, and distraction status.
  - `RoadContextMap`: Leaflet/MapLibre map showing current vehicle location, speed limit markers, and nearby garage pins.
  - `EventHistoryLog`: Chronological timeline of safety events with timestamps and confidence tags.
- **Audio Output**: Web SpeechSynthesis API for low-latency client-side text-to-speech.

### 3.2 Backend (FastAPI Application)
- **Framework**: FastAPI (Python 3.14).
- **Communication Protocol**:
  - HTTP REST endpoints for configuration, single-frame inference, historical event queries, and context lookups.
  - WebSocket (`/ws/telemetry`) for streaming detection events, driver state updates, and alert triggers at high frame rates.
- **Configuration**: Pydantic BaseSettings loading from `.env` (dataset paths, port, thresholds).

### 3.3 Machine Learning Inference Pipeline
- **Forward Sign Pipeline**:
  - *Current Status*: UNKNOWN — TO BE VERIFIED.
  - *Architectural Option A*: End-to-end Object Detector (e.g. YOLOv8 fine-tuned on road signs).
  - *Architectural Option B*: Two-Stage Pipeline — Object Detector finds generic traffic sign bounding box -> GTSRB Classifier identifies specific class (e.g., 70 km/h, Stop, Construction).
- **Traffic Light Pipeline**:
  - Bounding box detection for traffic signal fixtures followed by HSV/RGB color centroid analysis or lightweight CNN classifier for `RED`, `YELLOW`, `GREEN`.
- **Inference Runtime**: PyTorch / ONNX Runtime / Ultralytics wrapper, configurable to `cpu` or `cuda`.

### 3.4 Driver Monitoring Pipeline (DMS)
- **Framework**: MediaPipe Face Mesh or OpenCV facial landmark detector.
- **Eye Aspect Ratio (EAR)**:
  $$\text{EAR} = \frac{||p_2 - p_6|| + ||p_3 - p_5||}{2 \times ||p_1 - p_4||}$$
  - Trigger `DROWSINESS_WARNING` if $\text{EAR} < 0.25$ for consecutive frames exceeding threshold (e.g. 1.5 seconds).
- **Head Pose Estimation**:
  - SolvePnP with standard 3D facial model to calculate Pitch, Yaw, and Roll.
  - Trigger `DISTRACTION_WARNING` if $|Yaw| > 25^\circ$ or $|Pitch| > 20^\circ$ for > 2 seconds.

### 3.5 Context & Geo-Layer
- **Road Context**: Map matching using OpenStreetMap Nominatim or Overpass API (*integration details: UNKNOWN — TO BE VERIFIED*).
- **Speed Limit Cross-Referencing**: Compare recognized traffic sign speed limit with OpenStreetMap road maxspeed tag or vehicle telemetry.
- **Nearby Garages**: Query Overpass API for `amenity=car_repair` or `shop=car_repair` within a designated search radius. Fallback to mock dataset if API is throttled or offline.

### 3.6 Alert Engine & Arbitration
- **Priority Matrix**:
  1. `CRITICAL` (Priority 1): Driver Drowsiness (eyes closed > 1.5s), Red Light collision risk.
  2. `WARNING` (Priority 2): Driver Distraction (gaze away > 2s), Speed Limit exceeded by > 15 km/h, Stop sign approaching.
  3. `INFO` (Priority 3): Speed limit recognized, Construction zone ahead, Nearby garage within 1 km.
- **Debouncing Rules**: Identical events within a cooldown period (e.g., 5000 ms) are merged to avoid alert fatigue.

### 3.7 Persistence Layer
- **In-Memory Ring Buffer**: Stores recent 200 detection events for instant UI access.
- **SQLite Database**: Local lightweight database (`backend/data/roadguardian.db` - git-ignored) for session logs, safety incident audit trails, and trip summaries.

---

## 4. Normalized Data Models

### 4.1 Normalized Detection Object (`DetectionEvent`)
```json
{
  "id": "det_8f9a2b1c",
  "timestamp": "2026-09-25T01:45:00.120Z",
  "frame_id": 1420,
  "category": "TRAFFIC_SIGN",
  "label": "SPEED_LIMIT_50",
  "display_name": "Speed Limit 50 km/h",
  "confidence": 0.942,
  "bounding_box": {
    "x_min": 0.421,
    "y_min": 0.315,
    "x_max": 0.485,
    "y_max": 0.412
  },
  "metadata": {
    "speed_limit_kmh": 50,
    "stage": "GTSRB_CLASSIFIER",
    "distance_estimate_meters": null
  }
}
```

### 4.2 Driver State Object (`DriverState`)
```json
{
  "timestamp": "2026-09-25T01:45:00.120Z",
  "face_detected": true,
  "ear_left": 0.18,
  "ear_right": 0.19,
  "ear_average": 0.185,
  "eyes_closed": true,
  "eyes_closed_duration_ms": 1600,
  "head_pose": {
    "pitch": 4.2,
    "yaw": -3.1,
    "roll": 1.0
  },
  "attention_state": "DROWSY",
  "confidence": 0.88,
  "alert_required": true
}
```

### 4.3 Road Context Object (`RoadContext`)
```json
{
  "timestamp": "2026-09-25T01:45:00.120Z",
  "coordinates": {
    "latitude": 48.137154,
    "longitude": 11.576124
  },
  "road_name": "Bayerstraße",
  "road_type": "primary",
  "current_speed_kmh": 58,
  "active_speed_limit_kmh": 50,
  "speed_delta_kmh": 8,
  "construction_zone": false,
  "nearby_garages": [
    {
      "id": "garage_001",
      "name": "Auto Service Zentrum",
      "distance_meters": 450,
      "address": "Sonnenstraße 12",
      "latitude": 48.136500,
      "longitude": 11.568000
    }
  ]
}
```

---

## 5. Error Handling & Edge Cases

| Failure Scenario | Detection Mechanism | Mitigation Strategy |
| :--- | :--- | :--- |
| Camera disconnect / frame timeout | Frame grab returns empty / None | Emits `FEED_OFFLINE` event; UI displays standby pattern with sample video clip fallback. |
| Inadequate lighting / low contrast | Mean luminance check on frame | Emits `LOW_VISIBILITY_WARNING`; decreases confidence threshold or triggers sensor alert. |
| External Geo/Map API offline | HTTP 429 / 5xx / timeout | Falls back to cached local road metadata and offline simulated route. |
| High inference latency (>300ms) | Backend frame queue timer | Drops intermediate frames; maintains latest frame processing to avoid backlog. |
| Model weights missing | FileNotFoundError on boot | Fails startup fast with informative error guiding developer to run download/setup script. |

---

## 6. Testing Strategy
- **Unit Tests**:
  - Preprocessing functions (aspect ratio, cropping, bounding box transformations).
  - EAR calculation formulas with synthetic eye landmark vectors.
  - Alert debouncing logic and priority arbitration.
- **Integration Tests**:
  - API endpoint contracts (`/api/v1/vision/detect-frame`, `/api/v1/driver/analyze`).
  - WebSocket event streaming round-trip tests.
- **Benchmark / Smoke Tests**:
  - FPS throughput evaluation on standard test video clip.
  - Privacy check verifying `data/local/` exclusion.
