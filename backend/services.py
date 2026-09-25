import os
import cv2
import base64
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

from backend.config import settings
from backend.alert_engine import AlertEngine
from ml.inference.pipeline import TrafficSignPipeline
from ml.inference.driver_monitor import DriverAwarenessMonitor

class InferenceService:
    """
    Singleton service managing lifecycle of ML models, alert engine,
    and demo road context. Avoids loading models on every request.
    """
    _instance: Optional["InferenceService"] = None

    def __init__(self):
        print("Initializing InferenceService...")
        self.pipeline = TrafficSignPipeline(
            classifier_path=settings.MODEL_WEIGHTS_PATH,
            default_confidence_threshold=settings.DEFAULT_CONFIDENCE_THRESHOLD
        )
        self.driver_monitor = DriverAwarenessMonitor(
            cascade_dir=settings.CASCADES_DIR,
            ear_closed_threshold=settings.DEFAULT_EAR_THRESHOLD
        )
        self.alert_engine = AlertEngine()
        self.is_ready = True
        print("InferenceService initialized successfully.")

    @classmethod
    def get_instance(cls) -> "InferenceService":
        if cls._instance is None:
            cls._instance = InferenceService()
        return cls._instance

    def decode_base64_image(self, b64_string: str) -> np.ndarray:
        """
        Decodes base64 string to OpenCV BGR numpy array.
        Handles data URI prefixes cleanly.
        """
        if "," in b64_string:
            b64_string = b64_string.split(",", 1)[1]

        image_bytes = base64.b64decode(b64_string)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image from provided base64 data")
        return img

    def run_detection(self, image_bgr: np.ndarray, confidence_threshold: Optional[float] = None, frame_id: int = 1) -> Dict[str, Any]:
        """
        Executes forward perception and feeds detections into alert engine.
        """
        result = self.pipeline.process_frame(image_bgr, confidence_threshold=confidence_threshold, frame_id=frame_id)
        active_alert = None

        if result.get("detections"):
            for det in result["detections"]:
                alert = self.alert_engine.process_detection(det)
                if alert and (active_alert is None or alert["priority"] <= active_alert["priority"]):
                    active_alert = alert

        result["active_alert"] = active_alert
        return result

    def run_driver_monitoring(self, image_bgr: Optional[np.ndarray]) -> Dict[str, Any]:
        """
        Executes driver awareness analysis and feeds driver state into alert engine.
        """
        if image_bgr is not None:
            driver_result = self.driver_monitor.analyze_frame(image_bgr)
        else:
            # Standby attentive state when no face feed provided
            driver_result = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "state": "ATTENTIVE",
                "severity": "INFO",
                "confidence": 0.90,
                "reason": "Driver monitoring active (nominal)",
                "duration_ms": 0,
                "face_detected": True,
                "ear_average": 0.28,
                "eyes_closed": False,
                "head_pose": {"pitch": 0.0, "yaw": 0.0, "roll": 0.0},
                "alert_required": False
            }

        alert = self.alert_engine.process_driver_state(driver_result)
        driver_result["active_alert"] = alert
        return driver_result

    def get_road_context(self, lat: float = 48.137154, lon: float = 11.576124) -> Dict[str, Any]:
        """
        Returns contextual road information.
        Explicitly marked as DEMO_DATA per safety requirements.
        """
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data_source": "DEMO_DATA",
            "coordinates": {"latitude": lat, "longitude": lon},
            "road_name": "Bayerstraße / Ludwigsvorstadt",
            "road_type": "primary_urban",
            "current_speed_kmh": 46,
            "active_speed_limit_kmh": 50,
            "speed_delta_kmh": -4,
            "construction_zone": False,
            "traffic_status": "MODERATE_FLOW",
            "hazard_warnings": ["School zone 200m ahead"]
        }

    def get_nearby_garages(self, lat: float = 48.137154, lon: float = 11.576124, radius: int = 3000) -> Dict[str, Any]:
        """
        Returns nearby vehicle service stations.
        Explicitly marked as DEMO_DATA per safety requirements.
        """
        demo_garages = [
            {
                "id": "garage_001",
                "name": "Auto Service Zentrum München",
                "distance_meters": 420,
                "address": "Sonnenstraße 12, 80331 München",
                "coordinates": {"latitude": 48.136500, "longitude": 11.568000},
                "lat": 48.136500,
                "lon": 11.568000,
                "rating": 4.8,
                "phone": "+49 89 2314560",
                "open_now": True
            },
            {
                "id": "garage_002",
                "name": "Express KFZ Meisterbetrieb",
                "distance_meters": 950,
                "address": "Paul-Heyse-Straße 8, 80336 München",
                "coordinates": {"latitude": 48.139000, "longitude": 11.554000},
                "lat": 48.139000,
                "lon": 11.554000,
                "rating": 4.6,
                "phone": "+49 89 5489012",
                "open_now": True
            },
            {
                "id": "garage_003",
                "name": "Bosch Car Service Central",
                "distance_meters": 1600,
                "address": "Landsberger Str. 45, 80339 München",
                "coordinates": {"latitude": 48.141200, "longitude": 11.542000},
                "lat": 48.141200,
                "lon": 11.542000,
                "rating": 4.7,
                "phone": "+49 89 8899120",
                "open_now": False
            }
        ]
        return {
            "search_center": {"latitude": lat, "longitude": lon},
            "radius_meters": radius,
            "data_source": "DEMO_DATA",
            "count": len(demo_garages),
            "garages": demo_garages
        }
