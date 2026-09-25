from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "2.0.0"
    timestamp: str
    services: Dict[str, str]
    config: Dict[str, Any]

class BoundingBox(BaseModel):
    x_min: float = Field(..., ge=0.0, le=1.0)
    y_min: float = Field(..., ge=0.0, le=1.0)
    x_max: float = Field(..., ge=0.0, le=1.0)
    y_max: float = Field(..., ge=0.0, le=1.0)

class DetectionEvent(BaseModel):
    id: str
    frame_id: int
    timestamp: str
    category: str
    label: str
    display_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    bounding_box: BoundingBox
    metadata: Dict[str, Any]

class DetectRequest(BaseModel):
    frame_id: Optional[int] = 1
    image_base64: str
    confidence_threshold: Optional[float] = Field(0.50, ge=0.1, le=1.0)

class DetectResponse(BaseModel):
    success: bool
    frame_id: int
    timestamp: str
    inference_time_ms: float
    timing_breakdown_ms: Optional[Dict[str, float]] = None
    detections_count: int
    detections: List[DetectionEvent]
    active_alert: Optional[Dict[str, Any]] = None

class HeadPose(BaseModel):
    pitch: float = 0.0
    yaw: float = 0.0
    roll: float = 0.0

class DriverStatusRequest(BaseModel):
    image_base64: Optional[str] = None
    timestamp: Optional[str] = None

class DriverStatusResponse(BaseModel):
    timestamp: str
    state: str  # ATTENTIVE, ATTENTION_WARNING, DROWSINESS_WARNING, FACE_NOT_DETECTED, UNKNOWN
    severity: str  # INFO, WARNING, CRITICAL
    confidence: float
    reason: str
    duration_ms: int
    face_detected: bool
    ear_average: float
    eyes_closed: bool
    head_pose: HeadPose
    alert_required: bool
    active_alert: Optional[Dict[str, Any]] = None

class Coordinates(BaseModel):
    latitude: float
    longitude: float

class RoadContextResponse(BaseModel):
    timestamp: str
    data_source: str = "DEMO_DATA"  # Explicitly labeled per safety requirement
    coordinates: Coordinates
    road_name: str
    road_type: str
    current_speed_kmh: int
    active_speed_limit_kmh: int
    speed_delta_kmh: int
    construction_zone: bool
    traffic_status: str
    hazard_warnings: List[str]

class GarageItem(BaseModel):
    id: str
    name: str
    distance_meters: int
    address: str
    coordinates: Coordinates
    lat: Optional[float] = None
    lon: Optional[float] = None
    phone: Optional[str] = None
    open_now: bool = True
    rating: Optional[float] = 4.8

class GaragesResponse(BaseModel):
    search_center: Coordinates
    radius_meters: int
    data_source: str = "DEMO_DATA"  # Explicitly labeled per safety requirement
    count: int
    garages: List[GarageItem]

class EventItem(BaseModel):
    id: str
    timestamp: str
    category: str
    label: str
    severity: str
    priority: int
    title: str
    confidence: float
    speech_text: str
    visual_only: bool

class EventsResponse(BaseModel):
    total: int
    limit: int
    events: List[EventItem]

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    code: str
    timestamp: str
