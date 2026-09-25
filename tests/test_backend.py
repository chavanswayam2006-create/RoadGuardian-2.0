import os
import sys
import base64
import pytest
from fastapi.testclient import TestClient

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.main import app

client = TestClient(app)

def get_sample_test_image_base64() -> str:
    """Finds a real GTSRB image to use as test payload."""
    test_img_path = "data/local/GTSRB/Test/00000.png"
    if not os.path.exists(test_img_path):
        test_img_path = "data/local/GTSRB/Train/1/00001_00000_00000.png"
    
    if os.path.exists(test_img_path):
        with open(test_img_path, "rb") as f:
            return "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
    
    # Fallback synthetic 48x48 red square image
    import cv2
    import numpy as np
    dummy = np.zeros((48, 48, 3), dtype=np.uint8)
    dummy[:, :] = (0, 0, 255) # Red in BGR
    _, buffer = cv2.imencode(".png", dummy)
    return "data:image/png;base64," + base64.b64encode(buffer).decode("utf-8")


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert "services" in data
    assert data["services"]["traffic_sign_detector"] == "active"
    assert data["config"]["classes_loaded"] == 43
    print("\n[PASS] GET /health passed:", data["status"])


def test_detect_endpoint():
    b64 = get_sample_test_image_base64()
    payload = {
        "frame_id": 101,
        "image_base64": b64,
        "confidence_threshold": 0.40
    }
    response = client.post("/detect", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["frame_id"] == 101
    assert "inference_time_ms" in data
    assert isinstance(data["detections"], list)
    print(f"\n[PASS] POST /detect passed: {len(data['detections'])} detections, latency: {data['inference_time_ms']}ms")


def test_detect_invalid_input():
    payload = {
        "frame_id": 1,
        "image_base64": "not_a_valid_base64_string",
        "confidence_threshold": 0.50
    }
    response = client.post("/detect", json=payload)
    assert response.status_code == 400
    print("\n[PASS] POST /detect invalid input handled gracefully (400 Bad Request)")


def test_driver_status_endpoint():
    payload = {"timestamp": "2026-09-25T02:00:00Z"}
    response = client.post("/driver-status", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "state" in data
    assert data["state"] in ("ATTENTIVE", "ATTENTION_WARNING", "DROWSINESS_WARNING", "FACE_NOT_DETECTED", "UNKNOWN")
    assert "confidence" in data
    assert "ear_average" in data
    print(f"\n[PASS] POST /driver-status passed: State={data['state']}, EAR={data['ear_average']}")


def test_road_context_endpoint():
    response = client.get("/road-context?lat=48.137154&lon=11.576124")
    assert response.status_code == 200
    data = response.json()
    assert data["data_source"] == "DEMO_DATA"
    assert "road_name" in data
    assert "active_speed_limit_kmh" in data
    print("\n[PASS] GET /road-context passed with DEMO_DATA label:", data["road_name"])


def test_garages_endpoint():
    response = client.get("/garages?lat=48.137154&lon=11.576124&radius=3000")
    assert response.status_code == 200
    data = response.json()
    assert data["data_source"] == "DEMO_DATA"
    assert data["count"] > 0
    assert len(data["garages"]) == data["count"]
    print(f"\n[PASS] GET /garages passed with DEMO_DATA label: {data['count']} garages found")


def test_events_endpoint():
    response = client.get("/events?limit=20")
    assert response.status_code == 200
    data = response.json()
    assert "events" in data
    assert "total" in data
    print(f"\n[PASS] GET /events passed: {data['total']} events retrieved")


def test_api_v1_contract_compliance():
    """Verifies that all Brain/API_CONTRACT.md endpoints respond correctly under /api/v1/"""
    r_health = client.get("/api/v1/health")
    assert r_health.status_code == 200

    r_context = client.get("/api/v1/context/road-info?lat=48.137154&lon=11.576124")
    assert r_context.status_code == 200
    assert r_context.json()["data_source"] == "DEMO_DATA"

    r_garages = client.get("/api/v1/context/nearby-garages?lat=48.137154&lon=11.576124&radius=3000")
    assert r_garages.status_code == 200
    assert r_garages.json()["count"] > 0

    r_events = client.get("/api/v1/history/events?limit=10")
    assert r_events.status_code == 200

    b64 = get_sample_test_image_base64()
    r_detect = client.post("/api/v1/vision/detect-frame", json={"image_base64": b64, "confidence_threshold": 0.40})
    assert r_detect.status_code == 200
    assert r_detect.json()["success"] is True

    r_driver = client.post("/api/v1/driver/analyze", json={"timestamp": "2026-09-25T02:00:00Z"})
    assert r_driver.status_code == 200
    assert "state" in r_driver.json()
    print("\n[PASS] All /api/v1 contract endpoints verified successfully")

if __name__ == "__main__":
    pytest.main(["-s", __file__])
