import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from collections import deque

class AlertSeverity:
    CRITICAL = "CRITICAL"  # Priority 1: Drowsiness, Red Light, Wrong Way / No Entry
    WARNING = "WARNING"    # Priority 2: Distraction, Speeding, Stop sign, Road work
    INFO = "INFO"          # Priority 3: Speed limit confirmation, Normal priority road

class AlertEngine:
    """
    Real-time safety alert engine.
    Arbitrates detections and driver states, applies confidence thresholds,
    deduplication cooldowns, interrupt behavior, and generates concise speech strings.
    """
    def __init__(
        self,
        default_cooldown_ms: int = 5000,
        min_voice_confidence: float = 0.65,
        user_muted: bool = False
    ):
        self.default_cooldown_ms = default_cooldown_ms
        self.min_voice_confidence = min_voice_confidence
        self.muted = user_muted

        # Cooldown tracking: key -> timestamp_ms
        self.last_fired: Dict[str, float] = {}

        # History buffer (last 200 events)
        self.history: deque = deque(maxlen=200)

        # Active alert
        self.active_alert: Optional[Dict[str, Any]] = None

    def set_muted(self, muted: bool):
        self.muted = muted

    def process_detection(self, detection: Dict[str, Any], current_speed_kmh: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """
        Processes a normalized detection event from forward vision.
        Applies importance, thresholding, deduplication, and speech generation.
        """
        conf = detection.get("confidence", 0.0)
        label = detection.get("label", "")
        category = detection.get("category", "")
        meta = detection.get("metadata", {})
        now_ms = time.time() * 1000

        # Signature for deduplication
        sig = f"{category}:{label}"
        last_time = self.last_fired.get(sig, 0)
        cooldown = self._get_cooldown_ms(label)

        if (now_ms - last_time) < cooldown:
            # Suppressed by cooldown
            return None

        # Determine severity and speech
        severity = AlertSeverity.INFO
        title = detection.get("display_name", label)
        speech_text = ""
        visual_only = (conf < self.min_voice_confidence) or self.muted

        if category == "TRAFFIC_SIGNAL":
            state = meta.get("signal_state", "")
            if state == "SIGNAL_RED":
                severity = AlertSeverity.CRITICAL
                speech_text = "Red light."
            elif state == "SIGNAL_YELLOW":
                severity = AlertSeverity.WARNING
                speech_text = "Caution, yellow light."
            else:
                severity = AlertSeverity.INFO
                visual_only = True

        elif category == "TRAFFIC_SIGN":
            sign_cat = meta.get("sign_category", "")
            speed_val = meta.get("speed_limit_kmh")

            if label in ("STOP", "NO_ENTRY"):
                severity = AlertSeverity.CRITICAL
                speech_text = "Stop sign ahead." if label == "STOP" else "No entry, wrong way."
            elif sign_cat == "SPEED_LIMIT" and speed_val:
                # Compare with current vehicle speed if available
                if current_speed_kmh and current_speed_kmh > speed_val + 10:
                    severity = AlertSeverity.WARNING
                    speech_text = f"Speed limit {speed_val}. Reduce speed."
                else:
                    severity = AlertSeverity.INFO
                    speech_text = f"Speed limit {speed_val}."
            elif label in ("ROAD_WORK", "PEDESTRIANS", "CHILDREN_CROSSING", "SLIPPERY_ROAD"):
                severity = AlertSeverity.WARNING
                speech_text = f"Caution, {title.lower()}."
            else:
                severity = meta.get("severity", AlertSeverity.INFO)
                visual_only = True

        # Build Alert payload
        alert = {
            "id": f"alt_{uuid.uuid4().hex[:8]}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source_id": detection.get("id"),
            "category": category,
            "label": label,
            "severity": severity,
            "priority": 1 if severity == AlertSeverity.CRITICAL else (2 if severity == AlertSeverity.WARNING else 3),
            "title": title,
            "confidence": conf,
            "speech_text": speech_text if not visual_only else "",
            "visual_only": visual_only,
            "audio_cue": f"chime_{severity.lower()}"
        }

        # Update last fired cooldown
        self.last_fired[sig] = now_ms
        self._register_alert(alert)
        return alert

    def process_driver_state(self, driver_event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Processes a driver monitoring event.
        Prioritizes safety alerts (DROWSINESS > DISTRACTION).
        """
        state = driver_event.get("state", "ATTENTIVE")
        now_ms = time.time() * 1000

        if state == "ATTENTIVE":
            return None

        sig = f"DRIVER:{state}"
        last_time = self.last_fired.get(sig, 0)
        cooldown = 7000 if state == "DROWSINESS_WARNING" else 5000

        if (now_ms - last_time) < cooldown:
            return None

        visual_only = self.muted
        if state == "DROWSINESS_WARNING":
            severity = AlertSeverity.CRITICAL
            speech_text = "Driver drowsiness alert. Stay alert or pull over."
            title = "Drowsiness Alert"
        elif state == "ATTENTION_WARNING":
            severity = AlertSeverity.WARNING
            speech_text = "Eyes on the road."
            title = "Distraction Warning"
        elif state == "FACE_NOT_DETECTED":
            severity = AlertSeverity.WARNING
            speech_text = "Driver face not visible."
            title = "Face Not Detected"
        else:
            return None

        alert = {
            "id": f"alt_{uuid.uuid4().hex[:8]}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source_id": None,
            "category": "DRIVER_STATE",
            "label": state,
            "severity": severity,
            "priority": 1 if severity == AlertSeverity.CRITICAL else 2,
            "title": title,
            "confidence": driver_event.get("confidence", 0.8),
            "speech_text": speech_text if not visual_only else "",
            "visual_only": visual_only,
            "audio_cue": "chime_critical" if severity == AlertSeverity.CRITICAL else "chime_warning"
        }

        self.last_fired[sig] = now_ms
        self._register_alert(alert)
        return alert

    def _register_alert(self, alert: Dict[str, Any]):
        # Interrupt lower-priority active alerts
        if self.active_alert is None or alert["priority"] <= self.active_alert.get("priority", 3):
            self.active_alert = alert
        self.history.appendleft(alert)

    def get_history(self, limit: int = 50, category: Optional[str] = None) -> List[Dict[str, Any]]:
        items = list(self.history)
        if category:
            items = [it for it in items if it.get("category") == category]
        return items[:limit]

    def _get_cooldown_ms(self, label: str) -> int:
        if label in ("STOP", "NO_ENTRY", "SIGNAL_RED"):
            return 3000
        return self.default_cooldown_ms
