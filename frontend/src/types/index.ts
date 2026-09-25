export type AlertCategory = 'CRITICAL' | 'WARNING' | 'ADVISORY' | 'INFO';

export type DriverState = 'ATTENTIVE' | 'ATTENTION_WARNING' | 'DROWSINESS_WARNING' | 'FACE_NOT_DETECTED' | 'UNKNOWN';

export interface Detection {
  class_id: number;
  class_name: string;
  category: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  is_red_light?: boolean;
  speed_limit_kmh?: number | null;
}

export interface DetectResponse {
  success: boolean;
  frame_id: number;
  timestamp: string;
  inference_time_ms: number;
  timing_breakdown_ms?: {
    preprocess_ms: number;
    detection_ms: number;
    classification_ms: number;
    postprocess_ms: number;
  };
  detections_count: number;
  detections: Detection[];
  active_alert?: {
    id: string;
    timestamp: string;
    category: AlertCategory;
    priority: number;
    title: string;
    message: string;
    action_required: string;
    speak_text?: string;
  } | null;
}

export interface DriverStatus {
  timestamp: string;
  state: DriverState;
  confidence: number;
  ear_average: number;
  ear_left?: number;
  ear_right?: number;
  eyes_closed: boolean;
  gaze_direction: string;
  head_pose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  alert_required: boolean;
  alert_message?: string | null;
}

export interface RoadContext {
  lat: number;
  lon: number;
  road_name: string;
  road_type: string;
  active_speed_limit_kmh: number;
  recommended_speed_kmh?: number;
  construction_warning: boolean;
  weather_condition: string;
  data_source: string;
}

export interface Garage {
  id: string;
  name: string;
  distance_meters: number;
  rating: number;
  open_now: boolean;
  services: string[];
  phone: string;
  lat: number;
  lon: number;
  address?: string;
}

export interface SafetyEvent {
  id: string;
  timestamp: string;
  category: AlertCategory;
  title: string;
  message: string;
  confidence?: number;
  source: 'TRAFFIC_VISION' | 'DRIVER_MONITOR' | 'ROAD_CONTEXT' | 'SYSTEM';
  spoken?: boolean;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'offline';
  version: string;
  timestamp: string;
  services: {
    traffic_sign_detector: string;
    gtsrb_classifier: string;
    driver_monitor: string;
    alert_engine: string;
  };
  config: {
    device: string;
    confidence_threshold: number;
    ear_threshold: number;
    classes_loaded: number;
  };
}
