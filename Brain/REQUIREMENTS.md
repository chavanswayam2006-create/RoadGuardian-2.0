# Requirements: RoadGuardian 2.0

## 1. Hackathon MVP Objectives
- Deliver a working, end-to-end demonstration within 3 days.
- Prioritize stable core user journeys over complex edge cases.
- Provide a clean demonstration experience with mock video streams or live webcams.

---

## 2. Functional Requirements

### FR-01: AI Traffic Sign Recognition
- **Description**: System detects and classifies road traffic signs from camera frames or test video clips.
- **Classes**: Target GTSRB classes (speed limits, stop, yield, pedestrian crossing, construction, no entry, etc.).
- **Detection Status**: UNKNOWN — REQUIRES VERIFICATION (GTSRB dataset structure and annotation format must be inspected first).

### FR-02: Traffic Signal Recognition
- **Description**: System detects traffic lights and determines their active state: `RED`, `YELLOW`, `GREEN`.
- **Alert**: Warn the driver if red light is detected or if rapid deceleration is recommended.

### FR-03: Speed Limit Detection & Advisory
- **Description**: Recognize numerical speed limits from signs and cross-reference with vehicle simulated/detected speed.
- **Alert**: Trigger overspeed audio and visual warning if current speed exceeds limit.

### FR-04: In-Cabin Driver Monitoring System (DMS)
- **Drowsiness Detection**: Compute Eye Aspect Ratio (EAR) across consecutive frames; trigger warning if eyes remain closed beyond threshold duration.
- **Distraction Detection**: Estimate head pitch/yaw/roll or gaze vector; trigger alert if driver looks away from the road for > 2 seconds.

### FR-05: Real-Time Voice Alerts & Audio Feedback
- **Description**: Spoken voice alerts (e.g., *"Speed limit 50 km/h ahead"*, *"Drowsiness detected, please focus on the road"*).
- **Deduplication**: Prevent alert spam; debounce identical alerts within a configurable time window (e.g., 5 seconds).

### FR-06: Road Context & Map HUD
- **Map Display**: Interactive road map showing current vehicle location marker.
- **Context Layer**: Display road type, construction zone alerts, and speed restrictions.
- **Nearby Garages / Service Centers**: Identify and plot vehicle repair garages or service points within a radius.

### FR-07: Safety Event History & Telemetry
- **Event Logging**: Record timestamps, event types (sign detected, drowsiness alert, overspeed), confidence scores, and thumbnail/crop references.
- **HUD Panel**: Live telemetry stream showing FPS, system latency, detection count, and event history feed.

---

## 3. Non-Functional Requirements

### NFR-01: Low Latency
- Inference and UI rendering latency should be suitable for a fluid interactive demo.
- Benchmark targets: `UNKNOWN — REQUIRES VERIFICATION`.

### NFR-02: Privacy & Data Isolation
- GTSRB dataset must remain strictly local in `data/local/GTSRB/`.
- No dataset images, frames, or annotations pushed to Git.

### NFR-03: Graceful Degradation
- If external map or geocoding APIs are unreachable, the UI must continue operating in local offline demo mode with fallback data.
- If webcam is unavailable, support sample video clip playback.

### NFR-04: Design Quality
- Adhere to modern, high-contrast automotive HUD aesthetics utilizing `ui-ux-pro-max-skill`. Avoid generic SaaS dashboard templates.
