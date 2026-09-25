import cv2
import time
import uuid
import os
import numpy as np
from PIL import Image
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Union, Generator

from ml.inference.detector import TrafficSignDetector
from ml.inference.classifier import GTSRBClassifier
from ml.inference.label_manager import LabelManager

class TrafficSignPipeline:
    """
    Incremental Traffic Sign Recognition Pipeline:
    INPUT FRAME -> PREPROCESSING -> DETECTION -> SIGN CROP -> CLASSIFICATION -> CONFIDENCE -> NORMALIZED EVENT
    """
    def __init__(
        self,
        classifier_path: str = "ml/models/gtsrb_baseline.pt",
        default_confidence_threshold: float = 0.50
    ):
        self.detector = TrafficSignDetector()
        self.classifier = GTSRBClassifier.get_instance(model_path=classifier_path)
        self.label_manager = LabelManager.get_instance()
        self.default_confidence_threshold = default_confidence_threshold

    def process_frame(
        self,
        frame_input: Union[np.ndarray, Image.Image, str],
        confidence_threshold: Optional[float] = None,
        frame_id: int = 1
    ) -> Dict[str, Any]:
        """
        Executes the full pipeline on a single frame.
        Handles image paths, PIL Images, or raw BGR numpy arrays.
        """
        t_start = time.perf_counter()
        threshold = confidence_threshold if confidence_threshold is not None else self.default_confidence_threshold

        # Step 1: Preprocessing & Ingestion
        t_pre_start = time.perf_counter()
        frame_bgr, error_msg = self._preprocess_input(frame_input)
        t_pre_ms = (time.perf_counter() - t_pre_start) * 1000

        if frame_bgr is None:
            return {
                "frame_id": frame_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "success": False,
                "error": error_msg or "Failed to decode input frame",
                "inference_time_ms": round(t_pre_ms, 2),
                "detections": []
            }

        h_frame, w_frame = frame_bgr.shape[:2]

        # Step 2: Detection (Candidate localization)
        t_det_start = time.perf_counter()
        candidates = self.detector.detect_candidates(frame_bgr)
        t_det_ms = (time.perf_counter() - t_det_start) * 1000

        # Steps 3, 4, 5, 6: Sign Crop -> Classification -> Confidence Gating -> Event Normalization
        t_cls_start = time.perf_counter()
        detections: List[Dict[str, Any]] = []

        for cand in candidates:
            category = cand["category"]
            box = cand["normalized_box"]

            if category == "TRAFFIC_SIGNAL":
                # Signal fixture already has lamp classification
                conf = cand.get("confidence", 0.0)
                if conf >= threshold:
                    state = cand.get("signal_state", "SIGNAL_UNKNOWN")
                    display = "Red Light" if state == "SIGNAL_RED" else (
                        "Yellow Light" if state == "SIGNAL_YELLOW" else "Green Light"
                    )
                    det_event = {
                        "id": f"sig_{uuid.uuid4().hex[:8]}",
                        "frame_id": frame_id,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "category": "TRAFFIC_SIGNAL",
                        "label": state,
                        "display_name": display,
                        "confidence": conf,
                        "bounding_box": box,
                        "metadata": {
                            "signal_state": state,
                            "action_required": "STOP_PREPARE" if state == "SIGNAL_RED" else "PROCEED",
                            "severity": "CRITICAL" if state == "SIGNAL_RED" else (
                                "WARNING" if state == "SIGNAL_YELLOW" else "INFO"
                            )
                        }
                    }
                    detections.append(det_event)

            elif category == "TRAFFIC_SIGN":
                crop = cand["crop"]
                if crop is not None and crop.shape[0] > 5 and crop.shape[1] > 5:
                    cls_result = self.classifier.classify_crop(crop)
                    conf = cls_result["confidence"]

                    # Confidence filtering
                    if conf >= threshold:
                        det_event = {
                            "id": f"det_{uuid.uuid4().hex[:8]}",
                            "frame_id": frame_id,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "category": "TRAFFIC_SIGN",
                            "label": cls_result["label"],
                            "display_name": cls_result["display_name"],
                            "confidence": conf,
                            "bounding_box": box,
                            "metadata": {
                                "class_id": cls_result["class_id"],
                                "sign_category": cls_result["category"],
                                "speed_limit_kmh": cls_result["speed_limit_kmh"],
                                "severity": cls_result["severity"],
                                "action_required": "BRAKE" if cls_result["severity"] == "CRITICAL" else (
                                    "SLOW_DOWN" if cls_result["severity"] == "WARNING" else "ADVISORY"
                                )
                            }
                        }
                        detections.append(det_event)

        t_cls_ms = (time.perf_counter() - t_cls_start) * 1000
        t_total_ms = (time.perf_counter() - t_start) * 1000

        return {
            "frame_id": frame_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "success": True,
            "dimensions": {"width": w_frame, "height": h_frame},
            "timing_breakdown_ms": {
                "preprocessing": round(t_pre_ms, 2),
                "detection": round(t_det_ms, 2),
                "classification": round(t_cls_ms, 2),
                "total": round(t_total_ms, 2)
            },
            "inference_time_ms": round(t_total_ms, 2),
            "detections_count": len(detections),
            "detections": detections
        }

    def process_video(
        self,
        video_path: str,
        output_video_path: Optional[str] = None,
        confidence_threshold: Optional[float] = None,
        frame_stride: int = 1
    ) -> Dict[str, Any]:
        """
        Step 2 Requirement: Supports recorded video inputs.
        Processes video frame-by-frame and records detection summaries.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"Could not open video file: {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        writer = None
        if output_video_path:
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            writer = cv2.VideoWriter(output_video_path, fourcc, fps / frame_stride, (width, height))

        frame_idx = 0
        processed_count = 0
        all_detections = []
        latencies = []

        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                frame_idx += 1
                if frame_idx % frame_stride != 0:
                    continue

                processed_count += 1
                result = self.process_frame(frame, confidence_threshold=confidence_threshold, frame_id=frame_idx)
                latencies.append(result["inference_time_ms"])

                if result["detections"]:
                    all_detections.extend(result["detections"])

                if writer and frame is not None:
                    # Draw annotations
                    annotated = self._annotate_frame(frame, result["detections"])
                    writer.write(annotated)
        finally:
            cap.release()
            if writer:
                writer.release()

        avg_latency = float(np.mean(latencies)) if latencies else 0.0
        return {
            "video_path": video_path,
            "total_video_frames": total_frames,
            "processed_frames": processed_count,
            "fps": fps,
            "average_inference_time_ms": round(avg_latency, 2),
            "total_detections_found": len(all_detections),
            "events_sample": all_detections[:20]
        }

    def process_webcam_stream(
        self,
        camera_index: int = 0,
        confidence_threshold: Optional[float] = None
    ) -> Generator[Dict[str, Any], None, None]:
        """
        Step 3 Requirement: Supports webcam/live input stream generator.
        """
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            raise IOError(f"Unable to access camera index: {camera_index}")

        frame_id = 0
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                frame_id += 1
                result = self.process_frame(frame, confidence_threshold=confidence_threshold, frame_id=frame_id)
                result["annotated_frame"] = self._annotate_frame(frame, result["detections"])
                yield result
        finally:
            cap.release()

    def _preprocess_input(self, inp: Union[np.ndarray, Image.Image, str]) -> Tuple[Optional[np.ndarray], Optional[str]]:
        try:
            if isinstance(inp, str):
                if not os.path.exists(inp):
                    return None, f"File does not exist: {inp}"
                img = cv2.imread(inp)
                if img is None:
                    return None, "cv2.imread failed to read file"
                return img, None
            elif isinstance(inp, Image.Image):
                rgb = np.array(inp)
                bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
                return bgr, None
            elif isinstance(inp, np.ndarray):
                if len(inp.shape) == 2:
                    return cv2.cvtColor(inp, cv2.COLOR_GRAY2BGR), None
                elif len(inp.shape) == 3 and inp.shape[2] == 3:
                    return inp, None
                elif len(inp.shape) == 3 and inp.shape[2] == 4:
                    return cv2.cvtColor(inp, cv2.COLOR_BGRA2BGR), None
                return None, f"Unsupported numpy shape: {inp.shape}"
            return None, f"Unsupported input type: {type(inp)}"
        except Exception as e:
            return None, str(e)

    def _annotate_frame(self, frame_bgr: np.ndarray, detections: List[Dict[str, Any]]) -> np.ndarray:
        annotated = frame_bgr.copy()
        h, w = frame_bgr.shape[:2]

        for det in detections:
            box = det["bounding_box"]
            x1 = int(box["x_min"] * w)
            y1 = int(box["y_min"] * h)
            x2 = int(box["x_max"] * w)
            y2 = int(box["y_max"] * h)

            severity = det.get("metadata", {}).get("severity", "INFO")
            color = (0, 0, 255) if severity == "CRITICAL" else ((0, 165, 255) if severity == "WARNING" else (0, 255, 0))

            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            label_text = f"{det['display_name']} ({det['confidence']*100:.0f}%)"
            cv2.putText(annotated, label_text, (x1, max(18, y1 - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        return annotated
