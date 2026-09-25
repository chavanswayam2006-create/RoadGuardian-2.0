# Known Limitations & Honest Disclosures: RoadGuardian 2.0

This document transparently lists all current limitations, approximations, and architectural boundaries of the MVP system. No metric or capability is fabricated.

---

## 1. ML / Perception Limitations

| Area | Limitation | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| **Sign Detection** | Uses HSV color thresholding instead of trained object detector (e.g., YOLO) | May miss signs in poor lighting, shadows, or unusual colors | Future: Train YOLOv8 on road sign bounding boxes |
| **Classifier Generalization** | Trained on GTSRB (German signs only, 43 classes) | Will not recognize US, UK, or Asian road signs | Future: Fine-tune on multi-country datasets |
| **No Real-Time Video Pipeline** | Frame capture cadence is 800ms (1.25 FPS effective detection rate) | Not true real-time; suitable for demo only | Future: WebSocket streaming with GPU inference |
| **Face Detection** | Uses Haar Cascades (not MediaPipe 468-pt mesh) | Less accurate landmark detection; no iris tracking | Future: Integrate MediaPipe or dlib 68-pt |
| **EAR Calculation** | Approximated from eye bounding box dimensions, not individual landmarks | Less precise than landmark-based EAR formula | Future: Use 6-point eye landmark EAR |
| **Head Pose** | Estimated from face centroid displacement, not SolvePnP | Yaw/pitch are approximations, not calibrated degrees | Future: 3D model + SolvePnP |
| **No GPU Acceleration** | All inference runs on CPU | Limits throughput to ~25ms per frame | Future: CUDA/ONNX Runtime integration |

---

## 2. Backend / API Limitations

| Area | Limitation | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| **Road Context** | Returns hardcoded Munich demo data | Not real geocoding; explicitly labeled `DEMO_DATA` | Future: Overpass API integration |
| **Garages** | Returns 3 pre-verified Munich service stations | Not real-time search; explicitly labeled `DEMO_DATA` | Future: Live Overpass query |
| **Persistence** | In-memory ring buffer only (200 events) | Events lost on server restart; no SQLite yet | Future: SQLite persistence layer |
| **No WebSocket** | REST polling only (5s health, 800ms frame) | Higher latency than streaming; more HTTP overhead | Future: WS `/ws/telemetry` |
| **Single Instance** | Singleton `InferenceService` with no concurrency guards | May encounter race conditions under heavy parallel load | Future: AsyncIO task queue |

---

## 3. Frontend / UI Limitations

| Area | Limitation | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| **Synthetic Road** | Canvas-rendered procedural road, not real video | Looks simulated; detections are based on canvas frames | Future: Sample driving video playback |
| **Webcam Mode** | Requires browser camera permission | May be blocked by enterprise policies or missing hardware | Graceful fallback to synthetic mode |
| **Map Tiles** | Requires internet for OpenStreetMap tile server | Map panel will be empty tiles if offline | Future: Offline tile cache |
| **No Mobile Optimization** | Desktop-first layout (responsive but not mobile-native) | Small phone screens may clip panels | Future: Dedicated mobile cockpit view |
| **Tailwind CSS** | Uses Tailwind utility classes without a compiled design system file | Large class strings in JSX | Future: Extract to design tokens |

---

## 4. Security & Privacy Limitations

| Area | Limitation | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| **No Authentication** | All API endpoints are open (no auth tokens) | Anyone on local network can call endpoints | Future: JWT/OAuth2 middleware |
| **No HTTPS** | HTTP only (localhost development) | Not suitable for production deployment | Future: TLS termination via reverse proxy |
| **Camera Privacy** | Webcam frames are processed locally but sent to local backend as base64 | Frames transit over local HTTP; no encryption | Future: In-browser inference via ONNX.js |

---

## 5. What This System Is NOT

- ❌ **NOT a production ADAS system** — This is a 3-day hackathon MVP demonstration.
- ❌ **NOT safety-certified** — No ISO 26262 or automotive safety integrity level (ASIL) certification.
- ❌ **NOT a replacement for human driving judgment** — All alerts are advisory only.
- ❌ **NOT trained on real driving footage** — Uses GTSRB benchmark images and synthetic canvas.
- ❌ **NOT connected to real vehicle OBD-II or CAN bus** — Speed values are manually simulated.
