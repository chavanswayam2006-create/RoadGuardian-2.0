import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.inference.pipeline import TrafficSignPipeline
from ml.inference.label_manager import LabelManager

def test_ml_pipeline_image_processing():
    pipeline = TrafficSignPipeline(classifier_path="ml/models/gtsrb_baseline.pt")
    label_mgr = LabelManager.get_instance()

    test_img_path = "data/local/GTSRB/Test/00000.png"
    assert os.path.exists(test_img_path), f"Test image missing at {test_img_path}"

    res = pipeline.process_frame(test_img_path, confidence_threshold=0.30, frame_id=1)
    assert res["success"] is True
    assert "inference_time_ms" in res
    assert "timing_breakdown_ms" in res
    assert res["inference_time_ms"] > 0
    assert isinstance(res["detections"], list)

    print(f"\n[PASS] Pipeline processed image in {res['inference_time_ms']:.2f} ms")
    print(f"Timing breakdown: {res['timing_breakdown_ms']}")
    print(f"Detections found: {len(res['detections'])}")
    if res["detections"]:
        top_det = res["detections"][0]
        print(f"Top detection: {top_det['display_name']} (conf: {top_det['confidence']:.3f})")

if __name__ == "__main__":
    pytest.main(["-s", __file__])
