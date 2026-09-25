# API Specification: RoadGuardian 2.0
**Base URL**: `http://127.0.0.1:8000` or `http://127.0.0.1:8000/api/v1`

---

## 1. System Health & Diagnostics

### `GET /health` or `GET /api/v1/health`
- **Implementation Status**: **REAL IMPLEMENTATION**
- **Description**: Returns live service status, inference execution device, and active model class counts.

#### Response (`200 OK`)
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "timestamp": "2026-09-25T07:22:08.052Z",
  "services": {
    "traffic_sign_detector": "active",
    "gtsrb_classifier": "active",
    "driver_monitor": "active",
    "alert_engine": "active"
  },
  "config": {
    "device": "cpu",
    "confidence_threshold": 0.50,
    "ear_threshold": 0.20,
    "classes_loaded": 43
  }
}
```

---

## 2. Forward Perception Inference

### `POST /detect` or `POST /api/v1/vision/detect-frame`
- **Implementation Status**: **REAL IMPLEMENTATION**
- **Description**: Ingests base64 encoded JPEG/PNG frame, runs candidate sign detector and GTSRB CNN classifier, filters by confidence, and evaluates alert priority.

#### Request Body
```json
{
  "frame_id": 101,
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "confidence_threshold": 0.40
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "frame_id": 101,
  "timestamp": "2026-09-25T07:22:15.120Z",
  "inference_time_ms": 16.4,
  "timing_breakdown_ms": {
    "preprocessing": 1.2,
    "detection": 4.5,
    "classification": 1.4,
    "total": 16.4
  },
  "detections_count": 1,
  "detections": [
    {
      "id": "det_7f8a9b0c",
      "frame_id": 101,
      "timestamp": "2026-09-25T07:22:15.120Z",
      "category": "TRAFFIC_SIGN",
      "label": "SPEED_LIMIT_50",
      "display_name": "Speed Limit 50 km/h",
      "confidence": 0.962,
      "bounding_box": {
        "x_min": 0.45,
        "y_min": 0.22,
        "x_max": 0.58,
        "y_max": 0.38
      },
      "metadata": {
        "class_id": 2,
        "sign_category": "SPEED_LIMIT",
        "speed_limit_kmh": 50,
        "severity": "INFO",
        "action_required": "ADVISORY"
      }
    }
  ],
  "active_alert": {
    "id": "alt_12049",
    "category": "ADVISORY",
    "priority": 3,
    "title": "SPEED LIMIT 50 KM/H",
    "message": "Speed limit 50 km/h detected ahead.",
    "speak_text": "Speed limit 50 kilometers per hour ahead"
  }
}
```

---

## 3. Driver Monitoring System (DMS)

### `POST /driver-status` or `POST /api/v1/driver/analyze`
- **Implementation Status**: **REAL IMPLEMENTATION**
- **Description**: Analyzes driver cabin face frame for Eye Aspect Ratio (EAR), eye closure duration, and head orientation.

#### Request Body
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2026-09-25T07:22:15.120Z"
}
```

#### Response (`200 OK`)
```json
{
  "timestamp": "2026-09-25T07:22:15.145Z",
  "state": "ATTENTIVE",
  "severity": "INFO",
  "confidence": 0.92,
  "reason": "Driver monitoring active (nominal)",
  "duration_ms": 0,
  "face_detected": true,
  "ear_average": 0.31,
  "eyes_closed": false,
  "head_pose": {
    "pitch": 1.2,
    "yaw": -0.8,
    "roll": 0.5
  },
  "alert_required": false,
  "active_alert": null
}
```

---

## 4. Geospatial Context & Service Centers

### `GET /road-context` or `GET /api/v1/context/road-info`
- **Implementation Status**: **SIMULATED DATA** (Explicitly tagged with `"data_source": "DEMO_DATA"`)
- **Query Parameters**: `lat` (float), `lon` (float)

#### Response (`200 OK`)
```json
{
  "timestamp": "2026-09-25T07:22:50.633Z",
  "data_source": "DEMO_DATA",
  "coordinates": { "latitude": 48.137154, "longitude": 11.576124 },
  "road_name": "Bayerstraße / Ludwigsvorstadt",
  "road_type": "primary_urban",
  "current_speed_kmh": 46,
  "active_speed_limit_kmh": 50,
  "speed_delta_kmh": -4,
  "construction_zone": false,
  "traffic_status": "MODERATE_FLOW",
  "hazard_warnings": ["School zone 200m ahead"]
}
```

### `GET /garages` or `GET /api/v1/context/nearby-garages`
- **Implementation Status**: **SIMULATED DATA** (Explicitly tagged with `"data_source": "DEMO_DATA"`)
- **Query Parameters**: `lat` (float), `lon` (float), `radius` (integer meters)

#### Response (`200 OK`)
```json
{
  "search_center": { "latitude": 48.137154, "longitude": 11.576124 },
  "radius_meters": 3000,
  "data_source": "DEMO_DATA",
  "count": 3,
  "garages": [
    {
      "id": "garage_001",
      "name": "Auto Service Zentrum München",
      "distance_meters": 420,
      "address": "Sonnenstraße 12, 80331 München",
      "coordinates": { "latitude": 48.136500, "longitude": 11.568000 },
      "lat": 48.136500,
      "lon": 11.568000,
      "rating": 4.8,
      "phone": "+49 89 2314560",
      "open_now": true
    }
  ]
}
```

---

## 5. Event History

### `GET /events` or `GET /api/v1/history/events`
- **Implementation Status**: **REAL IMPLEMENTATION** (In-memory ring buffer)
- **Query Parameters**: `limit` (integer, max 200), `category` (optional)

#### Response (`200 OK`)
```json
{
  "total": 3,
  "limit": 20,
  "events": [
    {
      "id": "evt_drowsy_01",
      "timestamp": "2026-09-25T07:22:10.000Z",
      "category": "DRIVER_STATE",
      "label": "DROWSINESS_WARNING",
      "severity": "CRITICAL",
      "priority": 1,
      "title": "DRIVER DROWSINESS DETECTED",
      "confidence": 0.94,
      "speech_text": "Warning: Drowsiness detected. Please stay awake and focus on the road.",
      "visual_only": false
    }
  ]
}
```
