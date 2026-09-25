import csv
import os
import sys

import cv2
import numpy as np
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.inference.pipeline import DIRECT_CROP_MIN_CONFIDENCE, TrafficSignPipeline
from ml.inference.detector import TrafficSignDetector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
GTSRB_DIR = os.path.join(ROOT, "data", "local", "GTSRB")
SAMPLES_DIR = os.path.join(ROOT, "frontend", "public", "samples")
THRESHOLD = 0.45

# GTSRB class ids used by the frontend sample assets / validation set.
TARGET_CLASSES = {14: "Stop", 1: "Speed limit (30km/h)", 38: "Keep right"}

requires_gtsrb = pytest.mark.skipif(
    not os.path.exists(os.path.join(GTSRB_DIR, "Test.csv")),
    reason="Local GTSRB dataset not available (data/local/GTSRB is git-ignored)",
)


@pytest.fixture(scope="module")
def pipeline():
    return TrafficSignPipeline(classifier_path="ml/models/gtsrb_baseline.pt")


def _gtsrb_sample_paths():
    """One Test-set image path per target class, taken from Test.csv."""
    samples = {}
    with open(os.path.join(GTSRB_DIR, "Test.csv"), newline="") as fh:
        for row in csv.DictReader(fh):
            cid = int(row["ClassId"])
            if cid in TARGET_CLASSES and cid not in samples:
                samples[cid] = os.path.join(GTSRB_DIR, row["Path"].replace("/", os.sep))
            if len(samples) == len(TARGET_CLASSES):
                break
    return samples


def _top_detection(result):
    detections = result.get("detections", [])
    if not detections:
        return None, None
    top = detections[0]
    return top, top.get("metadata", {})


@requires_gtsrb
def test_real_gtsrb_signs_are_classified_correctly(pipeline):
    """Genuine GTSRB test images must map to their ground-truth class."""
    samples = _gtsrb_sample_paths()
    for cid, name in TARGET_CLASSES.items():
        path = samples.get(cid)
        assert path and os.path.exists(path), f"GTSRB sample for class {cid} ({name}) missing"

        result = pipeline.process_frame(path, confidence_threshold=THRESHOLD)
        top, meta = _top_detection(result)

        assert top is not None, f"No detection for genuine sign class {cid} ({name})"
        assert meta.get("class_id") == cid, (
            f"Expected class {cid} ({name}), got {meta.get('class_id')} "
            f"('{top['display_name']}') at conf {top['confidence']:.3f}"
        )
        assert top["confidence"] >= 0.90


def test_frontend_sample_assets_are_recognised(pipeline):
    """The images served from /samples/ must classify to their real class ids."""
    for fname, cid in (
        ("sample_stop.png", 14),
        ("sample_speed30.png", 1),
        ("sample_keep_right.png", 38),
    ):
        path = os.path.join(SAMPLES_DIR, fname)
        assert os.path.exists(path), f"Sample asset missing: {path}"

        result = pipeline.process_frame(path, confidence_threshold=THRESHOLD)
        top, meta = _top_detection(result)

        assert top is not None, f"No detection for sample asset {fname}"
        assert meta.get("class_id") == cid, (
            f"{fname}: expected class {cid}, got {meta.get('class_id')}"
        )
        assert top["confidence"] >= 0.90


def test_negative_controls_produce_no_detections(pipeline):
    """Non-sign imagery must never yield a detection above the threshold."""
    rng = np.random.default_rng(7)
    noise = rng.integers(0, 255, (480, 640, 3), dtype=np.uint8)
    flat = np.full((480, 640, 3), 127, dtype=np.uint8)
    scene = np.full((480, 640, 3), 90, dtype=np.uint8)
    cv2.rectangle(scene, (120, 180), (300, 340), (40, 40, 40), -1)
    cv2.line(scene, (400, 60), (560, 260), (200, 200, 200), 6)
    gradient = np.tile(np.arange(256, dtype=np.uint8), (256, 1)).reshape(256, 256, 1).repeat(3, axis=2)

    for label, img in (
        ("random noise", noise),
        ("flat gray", flat),
        ("cluttered non-sign scene", scene),
        ("soft gradient", gradient),
    ):
        result = pipeline.process_frame(img, confidence_threshold=THRESHOLD)
        assert result["detections_count"] == 0, (
            f"False positive on {label}: {result['detections']}"
        )


@requires_gtsrb
def test_padded_sign_is_found_by_region_detection(pipeline):
    """A sign placed inside a larger frame must be localised by the detector."""
    path = _gtsrb_sample_paths().get(14)
    assert path and os.path.exists(path)

    sign = cv2.resize(cv2.imread(path), (160, 160), interpolation=cv2.INTER_CUBIC)
    frame = np.full((480, 640, 3), 70, dtype=np.uint8)
    frame[160:320, 240:400] = sign

    result = pipeline.process_frame(frame, confidence_threshold=THRESHOLD)
    top, meta = _top_detection(result)

    assert top is not None, "Sign pasted into a larger frame was not detected"
    assert meta.get("class_id") == 14


def test_direct_crop_fallback_accepts_confident_crop(pipeline):
    """A tightly-cropped sign with no detectable contour must use DIRECT_CROP.

    The grayscale conversion removes all colour saliency, so the HSV colour masks in
    the candidate detector yield zero candidates and the whole-image fallback runs.
    """
    path = os.path.join(SAMPLES_DIR, "sample_stop.png")
    assert os.path.exists(path), f"Sample asset missing: {path}"

    sign = cv2.resize(cv2.imread(path), (256, 256), interpolation=cv2.INTER_CUBIC)
    grayscale = cv2.cvtColor(cv2.cvtColor(sign, cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR)

    result = pipeline.process_frame(grayscale, confidence_threshold=THRESHOLD)
    top, meta = _top_detection(result)

    assert top is not None, "Confident tight crop was rejected by the pipeline"
    assert meta.get("ingestion_mode") == "DIRECT_CROP", (
        f"Expected DIRECT_CROP ingestion, got {meta.get('ingestion_mode', 'REGION_DETECTION')}"
    )
    assert top["confidence"] >= DIRECT_CROP_MIN_CONFIDENCE
    assert meta.get("class_id") == 14

