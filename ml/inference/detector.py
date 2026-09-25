import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional

class TrafficSignDetector:
    """
    Stage 1 Detector: Locates traffic sign and traffic signal candidate bounding boxes
    in full driving frames (1080p, 720p, etc.).
    Uses color-geometry proposal and contour analysis to locate candidate ROIs.
    """
    def __init__(
        self,
        min_sign_size: int = 24,
        max_sign_size: int = 300,
        aspect_ratio_range: Tuple[float, float] = (0.6, 1.6),
        min_circularity_or_extent: float = 0.35
    ):
        self.min_sign_size = min_sign_size
        self.max_sign_size = max_sign_size
        self.aspect_ratio_range = aspect_ratio_range
        self.min_circularity_or_extent = min_circularity_or_extent

    def detect_candidates(self, frame_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Scans a driving frame and proposes bounding boxes for candidate traffic signs and signals.
        Returns list of dicts with:
          - 'box': (x1, y1, x2, y2) in pixel coordinates
          - 'normalized_box': (xmin, ymin, xmax, ymax) in [0, 1] relative coordinates
          - 'candidate_type': 'TRAFFIC_SIGN' or 'TRAFFIC_SIGNAL'
          - 'aspect_ratio': w / h
          - 'crop': cropped image patch (BGR)
        """
        h_frame, w_frame = frame_bgr.shape[:2]
        candidates = []

        hsv = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2HSV)

        # 1. Red masks (covers prohibitory, speed limit borders, stop signs, warning triangles)
        lower_red1 = np.array([0, 70, 50])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([160, 70, 50])
        upper_red2 = np.array([180, 255, 255])
        mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)
        mask_red = cv2.bitwise_or(mask_red1, mask_red2)

        # 2. Blue mask (covers mandatory signs: keep right, roundabout, etc.)
        lower_blue = np.array([95, 80, 50])
        upper_blue = np.array([135, 255, 255])
        mask_blue = cv2.inRange(hsv, lower_blue, upper_blue)

        # 3. Yellow mask (covers priority diamond, construction warnings)
        lower_yellow = np.array([18, 90, 80])
        upper_yellow = np.array([35, 255, 255])
        mask_yellow = cv2.inRange(hsv, lower_yellow, upper_yellow)

        # Combined candidate mask
        combined_mask = cv2.bitwise_or(mask_red, mask_blue)
        combined_mask = cv2.bitwise_or(combined_mask, mask_yellow)

        # Morphological filtering to clean noise and bridge sign borders
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        morphed = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        morphed = cv2.morphologyEx(morphed, cv2.MORPH_OPEN, kernel, iterations=1)

        # Find contours
        contours, _ = cv2.findContours(morphed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        seen_boxes = []

        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)

            if w < self.min_sign_size or h < self.min_sign_size:
                continue
            if w > self.max_sign_size or h > self.max_sign_size:
                continue

            ar = float(w) / float(h)
            if not (self.aspect_ratio_range[0] <= ar <= self.aspect_ratio_range[1]):
                continue

            area = cv2.contourArea(cnt)
            bbox_area = w * h
            extent = area / bbox_area if bbox_area > 0 else 0
            if extent < self.min_circularity_or_extent:
                continue

            # Add padding to ROI crop for context
            pad_x = int(w * 0.1)
            pad_y = int(h * 0.1)
            x1 = max(0, x - pad_x)
            y1 = max(0, y - pad_y)
            x2 = min(w_frame, x + w + pad_x)
            y2 = min(h_frame, y + h + pad_y)

            # Avoid significant box overlap (NMS-like check)
            overlap = False
            for bx1, by1, bx2, by2 in seen_boxes:
                ix1, iy1 = max(x1, bx1), max(y1, by1)
                ix2, iy2 = min(x2, bx2), min(y2, by2)
                inter_area = max(0, ix2 - ix1) * max(0, iy2 - iy1)
                union_area = (x2 - x1) * (y2 - y1) + (bx2 - bx1) * (by2 - by1) - inter_area
                iou = inter_area / union_area if union_area > 0 else 0
                if iou > 0.4:
                    overlap = True
                    break

            if overlap:
                continue

            seen_boxes.append((x1, y1, x2, y2))
            crop = frame_bgr[y1:y2, x1:x2]

            candidates.append({
                "box": (x1, y1, x2, y2),
                "normalized_box": {
                    "x_min": round(x1 / w_frame, 4),
                    "y_min": round(y1 / h_frame, 4),
                    "x_max": round(x2 / w_frame, 4),
                    "y_max": round(y2 / h_frame, 4)
                },
                "category": "TRAFFIC_SIGN",
                "aspect_ratio": round(ar, 3),
                "crop": crop
            })

        # 4. Traffic light detection (vertical aspect ratio 1:2 to 1:4 with high vertical contrast)
        # Only run on road scene frames (w_frame >= 200) to avoid false positives on cropped signs
        if w_frame >= 200 and h_frame >= 200:
            light_candidates = self._detect_traffic_signals(frame_bgr, hsv)
            # Filter out any traffic light candidate that lies inside a detected traffic sign
            valid_lights = []
            for sig in light_candidates:
                sx1, sy1, sx2, sy2 = sig["box"]
                inside_sign = False
                for sign in candidates:
                    tx1, ty1, tx2, ty2 = sign["box"]
                    ix1, iy1 = max(sx1, tx1), max(sy1, ty1)
                    ix2, iy2 = min(sx2, tx2), min(sy2, ty2)
                    inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
                    sig_area = (sx2 - sx1) * (sy2 - sy1)
                    if sig_area > 0 and (inter / sig_area) > 0.4:
                        inside_sign = True
                        break
                if not inside_sign:
                    valid_lights.append(sig)

            candidates.extend(valid_lights)

        return candidates

    def _detect_traffic_signals(self, frame_bgr: np.ndarray, hsv: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detects traffic light fixtures and determines active state (RED, YELLOW, GREEN).
        """
        h_frame, w_frame = frame_bgr.shape[:2]
        signals = []

        # Dark fixture mask (traffic light housing is dark grey/black)
        v_channel = hsv[:, :, 2]
        dark_mask = cv2.inRange(v_channel, 0, 80)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 7))
        morphed = cv2.morphologyEx(dark_mask, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(morphed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            if w < 16 or h < 35 or w > 120 or h > 300:
                continue
            ar = h / float(w)
            if not (1.8 <= ar <= 4.2):
                continue

            # Crop fixture region
            fixture_bgr = frame_bgr[y:y+h, x:x+w]
            fixture_hsv = hsv[y:y+h, x:x+w]

            # Analyze active lamp color
            state, confidence = self._classify_signal_lamp(fixture_hsv)
            if state is not None:
                signals.append({
                    "box": (x, y, x + w, y + h),
                    "normalized_box": {
                        "x_min": round(x / w_frame, 4),
                        "y_min": round(y / h_frame, 4),
                        "x_max": round((x + w) / w_frame, 4),
                        "y_max": round((y + h) / h_frame, 4)
                    },
                    "category": "TRAFFIC_SIGNAL",
                    "aspect_ratio": round(w / float(h), 3),
                    "signal_state": state,
                    "confidence": confidence,
                    "crop": fixture_bgr
                })

        return signals

    def _classify_signal_lamp(self, fixture_hsv: np.ndarray) -> Tuple[Optional[str], float]:
        """
        Classifies active illuminated lamp: SIGNAL_RED, SIGNAL_YELLOW, SIGNAL_GREEN.
        """
        if fixture_hsv.shape[0] < 10 or fixture_hsv.shape[1] < 5:
            return None, 0.0

        # Subdivide fixture into top (red), middle (yellow), bottom (green) thirds
        h = fixture_hsv.shape[0]
        top_third = fixture_hsv[:h//3, :]
        mid_third = fixture_hsv[h//3: 2*(h//3), :]
        bot_third = fixture_hsv[2*(h//3):, :]

        # Red mask in top third
        red1 = cv2.inRange(top_third, np.array([0, 100, 150]), np.array([12, 255, 255]))
        red2 = cv2.inRange(top_third, np.array([160, 100, 150]), np.array([180, 255, 255]))
        red_count = cv2.countNonZero(cv2.bitwise_or(red1, red2))

        # Yellow in middle third
        yel = cv2.inRange(mid_third, np.array([18, 120, 150]), np.array([36, 255, 255]))
        yel_count = cv2.countNonZero(yel)

        # Green in bottom third
        grn = cv2.inRange(bot_third, np.array([45, 100, 150]), np.array([85, 255, 255]))
        grn_count = cv2.countNonZero(grn)

        scores = [
            ("SIGNAL_RED", red_count),
            ("SIGNAL_YELLOW", yel_count),
            ("SIGNAL_GREEN", grn_count)
        ]
        scores.sort(key=lambda s: s[1], reverse=True)
        best_state, best_count = scores[0]

        total_pixels = (fixture_hsv.shape[0] // 3) * fixture_hsv.shape[1]
        ratio = best_count / float(total_pixels) if total_pixels > 0 else 0

        if ratio > 0.10:
            conf = min(0.98, 0.60 + ratio * 0.8)
            return best_state, round(conf, 3)

        return None, 0.0
