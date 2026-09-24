# Integration Specification: RoadGuardian 2.0

## 1. System Integration Map

```
+------------------+         REST / JSON          +---------------------+
|                  |<---------------------------->|                     |
|                  |     WebSocket (/ws)          |   FastAPI Backend   |
|   React HUD      |<============================>|   (Python 3.14)     |
|   Frontend       |                              |                     |
|                  |--+                           +----------+----------+
+------------------+  |                                      |
                      | Web Speech API                       | Python calls
                      v (Client-Side)                        v
             [Browser Audio TTS]                  +---------------------+
                                                  |   ML Inference Engine|
                                                  |   - Forward Vision  |
                                                  |   - Driver Monitor  |
                                                  +----------+----------+
                                                             |
                                                             v
+------------------+         HTTP Queries         +---------------------+
|  OpenStreetMap   |<-----------------------------| Geo / Context       |
|  Nominatim API   |  (UNKNOWN - TO BE VERIFIED)  | Connector Layer     |
+------------------+                              +---------------------+
                                                             |
+------------------+         Overpass QL          |
|  Overpass API    |<-----------------------------+
|  (Car Garages)   |  (UNKNOWN - TO BE VERIFIED)
+------------------+
```

---

## 2. Component Integrations

### 2.1 Video Ingestion & Vision Inference
- **Input Sources**:
  1. Forward-Facing Live Camera (OpenCV VideoCapture index `0` or `1`).
  2. In-Cabin Driver Webcam (OpenCV VideoCapture index `1` or client-side MediaStream via WebRTC/Canvas base64 capture).
  3. Pre-recorded demonstration video files (located in local test fixtures).
- **Processing Loop**:
  - The inference engine runs in an asynchronous worker thread or background process to avoid blocking the FastAPI event loop.
  - Intermediate frames are dropped if inference latency exceeds the frame interval, ensuring the HUD displays zero backlog.

### 2.2 Driver Monitoring (DMS) Integration
- **Framework**: MediaPipe Face Mesh / OpenCV.
- **Data Flow**:
  - Cabin frames are mapped to 468 facial landmark coordinates.
  - Eye Aspect Ratio (EAR) is extracted for left and right eyes.
  - 3D pose vectors (yaw, pitch, roll) are computed using `cv2.solvePnP` with a standardized 3D facial feature model.
  - Driver status is updated continuously and dispatched to the Alert Engine.

### 2.3 Audio & Voice Synthesizer Integration
- **Mechanism**: Client-side **Browser Web SpeechSynthesis API**.
- **Rationale**:
  - Completely local; zero external API dependencies or cloud TTS billing.
  - Zero network latency for safety-critical voice cues.
  - Works seamlessly across modern desktop browsers.
- **Debounce Protocol**:
  - The frontend maintains an alert queue and speech lock.
  - An alert message cannot be repeated within a 5000 ms debounce window unless its severity is upgraded to `CRITICAL`.

### 2.4 External Geo & Context Integration
- **Geocoding & Speed Limits**:
  - OpenStreetMap Nominatim reverse geocoding: `https://nominatim.openstreetmap.org/reverse`
  - Overpass API for road speed metadata: `https://overpass-api.de/api/interpreter`
  - *Current Status*: `UNKNOWN — TO BE VERIFIED`.
  - *Fallback Strategy*: If network access is restricted or Overpass queries are rate-limited, provide a deterministic local mock provider (`mock_geo_provider.py`) pre-seeded with coordinates along a sample route.

### 2.5 Nearby Garages Integration
- **Query Strategy**:
  - Overpass QL query:
    ```
    [out:json][timeout:10];
    (
      node["shop"="car_repair"](around:2000, 48.137, 11.576);
      node["amenity"="car_repair"](around:2000, 48.137, 11.576);
    );
    out body;
    ```
  - *Current Status*: `UNKNOWN — TO BE VERIFIED`.
  - *Safety Guard*: Rate-limiting handler that caches queries for 10 minutes and falls back to offline sample garages if the external endpoint fails.

---

## 3. Integration Verification Checklist
- [ ] Backend health check responds `200 OK`.
- [ ] Frontend successfully establishes WebSocket connection to `/ws/telemetry`.
- [ ] Sample image uploaded to `/vision/detect-frame` yields valid bounding box schema.
- [ ] MediaPipe / DMS correctly computes EAR on sample portrait photo.
- [ ] Web Speech API produces audible utterance upon synthetic alert trigger.
- [ ] Geo-layer returns valid road name and garage list (or graceful fallback).
