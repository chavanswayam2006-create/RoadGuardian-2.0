# Hackathon Demo Flow: RoadGuardian 2.0
**Estimated Demo Duration**: 5–7 minutes

---

## Pre-Demo Setup Checklist

1. **Backend**: Ensure FastAPI is running at `http://127.0.0.1:8000`
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```
2. **Frontend**: Ensure Vite dev server is running at `http://localhost:5173`
   ```bash
   npm run dev --prefix frontend
   ```
3. **Verify Health**: Open `http://127.0.0.1:8000/health` — should return `"status": "healthy"` with `"classes_loaded": 43`.
4. **Browser**: Open Chrome/Edge to `http://localhost:5173`.
5. **Audio**: Ensure laptop speakers are on (voice alerts use Web SpeechSynthesis).

---

## Demo Script

### Act 1: System Boot & Overview (~1 min)

1. **Show the Cockpit HUD**: Point out the dark tactical theme. Explain the five panels:
   - **Header**: Live clock, backend connection status, speedometer, speed limit badge.
   - **Optical Canvas**: Forward road simulation with HUD reticle and detection overlays.
   - **Driver Gauge (DMS)**: Eye Aspect Ratio bar, gaze crosshair, state banner.
   - **Context Map**: Leaflet dark map with vehicle marker and nearby garages.
   - **Event Timeline**: Chronological safety event log with voice synthesis indicators.

2. **Highlight "BACKEND ONLINE"** indicator in header — proves live FastAPI connection.

### Act 2: Traffic Sign Detection (~1.5 min)

1. **Point to the Optical Canvas**: The synthetic road simulator shows a procedural perspective road with lane markings.
2. **Explain the Detection Pipeline**: "When a camera frame is captured, it goes through our two-stage pipeline — first, color-based candidate extraction using HSV thresholds, then classification via our custom GTSRB CNN trained on 39,000+ German traffic sign images."
3. **Show Bounding Box Overlays**: Notice the cyan reticle corners and confidence percentage on the detected speed limit sign.
4. **Change Speed Limit**: Click the "50", "70", "100" buttons in the Speed Bench to simulate different zones. Notice the speed limit badge in the header updates instantly.

### Act 3: Overspeed Warning (~1 min)

1. **Click "+5 KM/H" repeatedly** until vehicle speed exceeds the active limit by >5 km/h.
2. **Observe**: The amber WARNING banner pulses into view with the message "Vehicle speed exceeds active limit."
3. **Listen**: A voice alert says "Warning: Vehicle speed exceeds the posted speed limit."
4. **Check Event Timeline**: A new WARNING entry appears with a speaker icon indicating it was voiced.
5. **Click "-5 KM/H"** to bring speed back under the limit — the warning dismisses.

### Act 4: Driver Drowsiness Detection (~1.5 min)

1. **Locate the DMS Test Bench** at the bottom of the Driver Gauge panel.
2. **Click "DROWSY"**: The entire DMS panel shifts to crimson. The EAR gauge drops to 0.12 (well below the 0.20 threshold). The state banner reads "DROWSINESS WARNING: MICRO-SLEEP".
3. **Listen**: A critical voice alert fires: "Warning: Drowsiness detected. Please stay awake and focus on the road."
4. **Point Out**: The alert priority system ensures drowsiness (CRITICAL) overrides any speed limit advisory (INFO).
5. **Click "ATTENTIVE"** to restore the system to nominal green state.

### Act 5: Distraction Detection (~1 min)

1. **Click "DISTRACTED"**: The DMS gaze crosshair jumps to the far right (34.2° yaw). The state changes to amber ATTENTION DRIFT.
2. **Listen**: Voice alert: "Attention warning. Please focus your eyes on the road."
3. **Click "NO FACE"**: Shows what happens when the driver camera loses facial landmarks — an orange warning banner appears.
4. **Click "ATTENTIVE"** to return to normal.

### Act 6: Road Context & Garages (~1 min)

1. **Show the Leaflet Map**: Dark-themed map centered on Munich with a moving vehicle reticle.
2. **Point to Garage Markers**: Amber wrench icons with popup cards showing name, distance, rating, and phone number.
3. **Explain**: "In production, this connects to OpenStreetMap Overpass API. For the demo, we use realistic pre-verified Munich automotive service stations, explicitly labeled as DEMO_DATA."

### Act 7: Technical Deep Dive (~1 min)

1. **Show `http://127.0.0.1:8000/docs`**: FastAPI's auto-generated Swagger UI showing all REST endpoints.
2. **Highlight the API v1 Contract**: `/api/v1/health`, `/api/v1/vision/detect-frame`, `/api/v1/driver/analyze`, `/api/v1/context/road-info`.
3. **Mention Test Suite**: "We have 11 automated pytest tests covering health, detection, driver monitoring, alert engine, and API contract compliance — all passing."
4. **Show Model Accuracy**: "Our GTSRB classifier achieves 98.67% top-1 accuracy on 12,630 test images with 1.39ms average inference latency."

---

## Troubleshooting During Demo

| Issue | Quick Fix |
| :--- | :--- |
| Backend not connected | Restart: `python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000` |
| Map not loading | Check internet for tile server access; the rest of the app works without it |
| Voice not playing | Click anywhere on the page first (browser autoplay policy); check mute toggle |
| No detections showing | The simulated road has pre-placed sign candidates; switch to webcam mode for live |
