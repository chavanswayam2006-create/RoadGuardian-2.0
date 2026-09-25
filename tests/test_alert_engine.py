import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.alert_engine import AlertEngine, AlertSeverity

def test_alert_engine_priority_and_deduplication():
    engine = AlertEngine(default_cooldown_ms=1000, min_voice_confidence=0.60)

    # 1. Stop sign detection
    det_stop = {
        "id": "det_001",
        "category": "TRAFFIC_SIGN",
        "label": "STOP",
        "display_name": "Stop",
        "confidence": 0.95,
        "metadata": {"severity": "CRITICAL", "sign_category": "MANDATORY"}
    }
    alert1 = engine.process_detection(det_stop)
    assert alert1 is not None
    assert alert1["severity"] == AlertSeverity.CRITICAL
    assert alert1["priority"] == 1
    assert alert1["speech_text"] == "Stop sign ahead."
    print("\n[PASS] Stop sign alert created with concise speech")

    # 2. Duplicate within cooldown should return None
    alert_dup = engine.process_detection(det_stop)
    assert alert_dup is None
    print("[PASS] Duplicate Stop sign suppressed within cooldown")

    # 3. Speed limit detection with speeding
    det_speed = {
        "id": "det_002",
        "category": "TRAFFIC_SIGN",
        "label": "SPEED_LIMIT_50",
        "display_name": "Speed limit (50km/h)",
        "confidence": 0.92,
        "metadata": {"severity": "INFO", "sign_category": "SPEED_LIMIT", "speed_limit_kmh": 50}
    }
    alert_speed = engine.process_detection(det_speed, current_speed_kmh=68)
    assert alert_speed is not None
    assert alert_speed["severity"] == AlertSeverity.WARNING
    assert "Reduce speed" in alert_speed["speech_text"]
    print("[PASS] Speed limit alert with overspeed warning passed")

    # 4. Driver drowsiness warning
    driver_event = {
        "state": "DROWSINESS_WARNING",
        "confidence": 0.90,
        "reason": "Prolonged eye closure",
        "duration_ms": 1800
    }
    driver_alert = engine.process_driver_state(driver_event)
    assert driver_alert is not None
    assert driver_alert["severity"] == AlertSeverity.CRITICAL
    assert driver_alert["priority"] == 1
    assert "drowsiness" in driver_alert["speech_text"].lower()
    print("[PASS] Drowsiness alert created with priority 1")

    # 5. Low confidence visual only check
    det_low_conf = {
        "id": "det_003",
        "category": "TRAFFIC_SIGN",
        "label": "ROUNDABOUT_MANDATORY",
        "display_name": "Roundabout mandatory",
        "confidence": 0.52,  # Below 0.60
        "metadata": {"severity": "INFO"}
    }
    alert_low = engine.process_detection(det_low_conf)
    assert alert_low is not None
    assert alert_low["visual_only"] is True
    assert alert_low["speech_text"] == ""
    print("[PASS] Low confidence detection marked visual_only")

if __name__ == "__main__":
    import pytest
    pytest.main(["-s", __file__])
