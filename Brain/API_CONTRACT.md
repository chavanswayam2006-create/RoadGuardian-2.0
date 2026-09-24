# API Contract Specification: RoadGuardian 2.0
**Base URL**: `http://127.0.0.1:8000/api/v1`

---

## 1. System Health & Metadata

### `GET /health`
Returns current system health, active ML models, and configuration status.

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2026-09-25T01:45:00.000Z",
  "services": {
    "vision_detector": "active",
    "driver_monitor": "active",
    "map_context": "active",
    "database": "connected"
  },
  "config": {
    "inference_device": "cpu",
    "confidence_threshold": 0.50
  }
}
```

---

## 2. Forward Vision Endpoints

### `POST /vision/detect-frame`
Processes a single camera frame or base64 encoded image to detect traffic signs, traffic signals, and speed limits.

**Request**: `Content-Type: multipart/form-data` or `application/json`
```json
{
  "frame_id": 1042,
  "timestamp": "2026-09-25T01:45:01.100Z",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "confidence_threshold": 0.50
}
```

**Response**: `200 OK`
```json
{
  "frame_id": 1042,
  "inference_time_ms": 28.4,
  "detections": [
    {
      "id": "det_4a91b2c3",
      "category": "TRAFFIC_SIGN",
      "label": "SPEED_LIMIT_60",
      "display_name": "Speed Limit 60 km/h",
      "confidence": 0.952,
      "bounding_box": {
        "x_min": 0.512,
        "y_min": 0.284,
        "x_max": 0.578,
        "y_max": 0.395
      },
      "metadata": {
        "speed_limit_kmh": 60,
        "action_required": "ADVISORY"
      }
    },
    {
      "id": "det_4a91b2c4",
      "category": "TRAFFIC_SIGNAL",
      "label": "SIGNAL_RED",
      "display_name": "Red Light",
      "confidence": 0.912,
      "bounding_box": {
        "x_min": 0.620,
        "y_min": 0.180,
        "x_max": 0.655,
        "y_max": 0.260
      },
      "metadata": {
        "signal_color": "RED",
        "action_required": "STOP_PREPARE"
      }
    }
  ]
}
```

---

## 3. Driver Monitoring Endpoints

### `POST /driver/analyze`
Analyzes in-cabin facial landmarks, eye aspect ratios, and head orientation for signs of drowsiness or distraction.

**Request**: `application/json`
```json
{
  "timestamp": "2026-09-25T01:45:01.100Z",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response**: `200 OK`
```json
{
  "timestamp": "2026-09-25T01:45:01.125Z",
  "face_detected": true,
  "ear_average": 0.19,
  "eyes_closed": true,
  "eyes_closed_duration_ms": 1750,
  "head_pose": {
    "pitch": 5.1,
    "yaw": -2.3,
    "roll": 0.8
  },
  "attention_state": "DROWSY",
  "alert_required": true,
  "alert_payload": {
    "severity": "CRITICAL",
    "message": "Drowsiness detected! Pull over or take a break.",
    "audio_cue": "voice_alert_drowsiness"
  }
}
```

---

## 4. Road Context & Navigation Endpoints

### `GET /context/road-info?lat={latitude}&lon={longitude}`
Fetches contextual road information (current road name, speed limit, road type) for given coordinates.
*Implementation Note: Integrates with OpenStreetMap Nominatim / Overpass API (status: UNKNOWN — TO BE VERIFIED).*

**Response**: `200 OK`
```json
{
  "coordinates": {
    "latitude": 48.137154,
    "longitude": 11.576124
  },
  "road_name": "Bayerstraße",
  "road_type": "primary",
  "default_speed_limit_kmh": 50,
  "construction_zone": false,
  "hazard_warnings": []
}
```

### `GET /context/nearby-garages?lat={latitude}&lon={longitude}&radius={radius_meters}`
Finds nearby automotive repair garages or service centers within a radius.
*Implementation Note: Integrates with Overpass API or local mock database (status: UNKNOWN — TO BE VERIFIED).*

**Response**: `200 OK`
```json
{
  "search_center": {
    "latitude": 48.137154,
    "longitude": 11.576124
  },
  "radius_meters": 2000,
  "count": 2,
  "garages": [
    {
      "id": "garage_osm_101",
      "name": "Auto Service Zentrum München",
      "distance_meters": 450,
      "address": "Sonnenstraße 12, München",
      "coordinates": {
        "latitude": 48.136500,
        "longitude": 11.568000
      },
      "phone": "+49 89 123456"
    },
    {
      "id": "garage_osm_102",
      "name": "Express Reifen & KFZ",
      "distance_meters": 1120,
      "address": "Paul-Heyse-Straße 8, München",
      "coordinates": {
        "latitude": 48.139000,
        "longitude": 11.554000
      },
      "phone": null
    }
  ]
}
```

---

## 5. History & Persistence Endpoints

### `GET /history/events?limit=50&category={category}`
Retrieves chronological safety and detection events from the local SQLite log.

**Response**: `200 OK`
```json
{
  "total": 42,
  "limit": 50,
  "events": [
    {
      "id": "evt_99182",
      "timestamp": "2026-09-25T01:42:15.000Z",
      "category": "DRIVER_STATE",
      "severity": "CRITICAL",
      "message": "Drowsiness alert triggered (EAR: 0.17 for 1800ms)",
      "confidence": 0.92,
      "acknowledged": true
    }
  ]
}
```

### `POST /history/events`
Manually logs or acknowledges a safety event.

---

## 6. Real-Time Telemetry WebSocket

### `WS /ws/telemetry`
High-speed duplex stream sending live frame telemetry, combined detections, and receiving UI control commands (e.g. mute voice alerts, set sensitivity threshold).

**Client -> Server Message**:
```json
{
  "type": "CONFIG_UPDATE",
  "payload": {
    "confidence_threshold": 0.55,
    "ear_threshold": 0.24,
    "voice_muted": false
  }
}
```

**Server -> Client Message**:
```json
{
  "type": "TELEMETRY_UPDATE",
  "timestamp": "2026-09-25T01:45:02.040Z",
  "fps": 28.5,
  "latency_ms": 32.1,
  "active_detections": [ /* array of DetectionEvent */ ],
  "driver_state": { /* DriverState */ },
  "active_alert": {
    "severity": "WARNING",
    "message": "Speed Limit 50 km/h Ahead",
    "speech_text": "Speed limit 50 kilometers per hour ahead"
  }
}
```
