import os
import cv2
import time
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, List

class DriverAwarenessMonitor:
    """
    Driver Awareness Monitoring (DMS) Module.
    Estimates visible indicators of attention loss, prolonged eye closure, and head orientation.
    Uses temporal evidence across multiple frames to avoid false positives.

    NOTE: In strict adherence to safety specifications, this module does NOT diagnose
    medical conditions, sleep disorders, illness, or intoxication.
    """
    def __init__(
        self,
        cascade_dir: str = "ml/models/cascades",
        ear_closed_threshold: float = 0.20,
        drowsiness_duration_sec: float = 1.5,
        distraction_duration_sec: float = 2.0,
        face_lost_duration_sec: float = 1.5
    ):
        self.cascade_dir = os.path.abspath(cascade_dir)
        self.face_cascade_path = os.path.join(self.cascade_dir, "haarcascade_frontalface_default.xml")
        self.eye_cascade_path = os.path.join(self.cascade_dir, "haarcascade_eye.xml")

        self.face_cascade = cv2.CascadeClassifier(self.face_cascade_path) if os.path.exists(self.face_cascade_path) else None
        self.eye_cascade = cv2.CascadeClassifier(self.eye_cascade_path) if os.path.exists(self.eye_cascade_path) else None

        # Thresholds
        self.ear_closed_threshold = ear_closed_threshold
        self.drowsiness_duration_sec = drowsiness_duration_sec
        self.distraction_duration_sec = distraction_duration_sec
        self.face_lost_duration_sec = face_lost_duration_sec

        # Temporal Tracking State
        self.last_frame_timestamp: Optional[float] = None
        self.eyes_closed_start_time: Optional[float] = None
        self.distraction_start_time: Optional[float] = None
        self.face_lost_start_time: Optional[float] = None
        self.recent_blinks: List[float] = []  # timestamps of long blinks
        self.consecutive_closed_frames = 0
        self.consecutive_distracted_frames = 0

    def analyze_frame(self, frame_bgr: np.ndarray, timestamp_sec: Optional[float] = None) -> Dict[str, Any]:
        """
        Analyzes a single in-cabin camera frame and updates temporal driver state.
        """
        now = timestamp_sec if timestamp_sec is not None else time.time()
        dt = (now - self.last_frame_timestamp) if self.last_frame_timestamp else 0.033
        self.last_frame_timestamp = now

        if frame_bgr is None or frame_bgr.size == 0:
            return self._build_event("UNKNOWN", 0.0, "Empty or invalid frame", 0)

        h_frame, w_frame = frame_bgr.shape[:2]
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)

        # Detect face
        face_box = None
        if self.face_cascade and not self.face_cascade.empty():
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.15, minNeighbors=4, minSize=(60, 60))
            if len(faces) > 0:
                # Pick largest face
                faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
                face_box = faces[0]

        # 1. Check Face Detection
        if face_box is None:
            if self.face_lost_start_time is None:
                self.face_lost_start_time = now
            face_lost_dur = now - self.face_lost_start_time
            self.eyes_closed_start_time = None
            self.distraction_start_time = None

            if face_lost_dur >= self.face_lost_duration_sec:
                return self._build_event(
                    state="FACE_NOT_DETECTED",
                    confidence=0.85,
                    reason=f"Driver face not detected for {face_lost_dur:.1f}s",
                    duration_ms=int(face_lost_dur * 1000),
                    face_detected=False
                )
            else:
                return self._build_event(
                    state="ATTENTIVE",
                    confidence=0.60,
                    reason="Transient face occlusion",
                    duration_ms=int(face_lost_dur * 1000),
                    face_detected=False
                )

        # Face detected - reset face lost timer
        self.face_lost_start_time = None
        fx, fy, fw, fh = face_box
        face_roi_gray = gray[fy:fy+fh, fx:fx+fw]

        # 2. Estimate Head Pose (Yaw proxy from facial horizontal center)
        frame_center_x = w_frame / 2.0
        face_center_x = fx + (fw / 2.0)
        norm_center_offset = (face_center_x - frame_center_x) / (w_frame / 2.0)
        est_yaw = norm_center_offset * 40.0  # approximate yaw degrees

        # 3. Detect Eyes and Eye Aspect Ratio proxy
        # Eyes are located in upper 55% of face
        eyes_roi_gray = face_roi_gray[: int(fh * 0.55), :]
        eyes_found = []
        if self.eye_cascade and not self.eye_cascade.empty():
            detected_eyes = self.eye_cascade.detectMultiScale(eyes_roi_gray, scaleFactor=1.1, minNeighbors=3, minSize=(15, 15))
            if len(detected_eyes) >= 2:
                # Pick two most prominent
                eyes_found = sorted(detected_eyes, key=lambda e: e[2] * e[3], reverse=True)[:2]
            elif len(detected_eyes) == 1:
                eyes_found = detected_eyes

        # Compute Eye Aperture / EAR proxy
        ear_score = 0.30  # default open
        eyes_closed = False

        if len(eyes_found) > 0:
            apertures = []
            for (ex, ey, ew, eh) in eyes_found:
                # Vertical to horizontal aspect ratio of eye bounding box
                apertures.append(float(eh) / float(ew) if ew > 0 else 0.25)
            ear_score = float(np.mean(apertures))
            if ear_score < self.ear_closed_threshold:
                eyes_closed = True
        else:
            # If face is clearly visible but eyes cannot be detected in upper face,
            # this commonly correlates with closed eyelids or extreme downward pitch
            ear_score = 0.16
            eyes_closed = True

        # 4. Temporal Evaluation for Drowsiness
        if eyes_closed:
            self.consecutive_closed_frames += 1
            if self.eyes_closed_start_time is None:
                self.eyes_closed_start_time = now
            closed_dur = now - self.eyes_closed_start_time

            # Normal blink filter: blinks are < 0.4s
            if closed_dur >= self.drowsiness_duration_sec:
                return self._build_event(
                    state="DROWSINESS_WARNING",
                    confidence=min(0.95, 0.70 + (closed_dur - 1.5) * 0.1),
                    reason=f"Prolonged eye closure detected ({closed_dur:.1f}s)",
                    duration_ms=int(closed_dur * 1000),
                    face_detected=True,
                    ear_score=ear_score,
                    eyes_closed=True,
                    head_pose={"pitch": 0.0, "yaw": round(est_yaw, 1), "roll": 0.0}
                )
        else:
            # Eyes reopened
            if self.eyes_closed_start_time is not None:
                blink_dur = now - self.eyes_closed_start_time
                if 0.4 <= blink_dur < self.drowsiness_duration_sec:
                    # Record long blink
                    self.recent_blinks.append(now)
            self.eyes_closed_start_time = None
            self.consecutive_closed_frames = 0

        # Filter recent blinks within last 10 seconds
        self.recent_blinks = [t for t in self.recent_blinks if (now - t) <= 10.0]
        if len(self.recent_blinks) >= 3:
            return self._build_event(
                state="DROWSINESS_WARNING",
                confidence=0.82,
                reason="Frequent micro-sleep or repeated long blinks detected",
                duration_ms=int(sum(self.recent_blinks) * 100),
                face_detected=True,
                ear_score=ear_score,
                eyes_closed=False,
                head_pose={"pitch": 0.0, "yaw": round(est_yaw, 1), "roll": 0.0}
            )

        # 5. Temporal Evaluation for Distraction (Head Pose)
        is_distracted = abs(est_yaw) > 22.0
        if is_distracted:
            self.consecutive_distracted_frames += 1
            if self.distraction_start_time is None:
                self.distraction_start_time = now
            distracted_dur = now - self.distraction_start_time

            if distracted_dur >= self.distraction_duration_sec:
                return self._build_event(
                    state="ATTENTION_WARNING",
                    confidence=min(0.92, 0.75 + (distracted_dur - 2.0) * 0.08),
                    reason=f"Gaze oriented away from road ({distracted_dur:.1f}s)",
                    duration_ms=int(distracted_dur * 1000),
                    face_detected=True,
                    ear_score=ear_score,
                    eyes_closed=eyes_closed,
                    head_pose={"pitch": 0.0, "yaw": round(est_yaw, 1), "roll": 0.0}
                )
        else:
            self.distraction_start_time = None
            self.consecutive_distracted_frames = 0

        # Normal attentive state
        return self._build_event(
            state="ATTENTIVE",
            confidence=0.90,
            reason="Driver attentive to road",
            duration_ms=0,
            face_detected=True,
            ear_score=ear_score,
            eyes_closed=False,
            head_pose={"pitch": 0.0, "yaw": round(est_yaw, 1), "roll": 0.0}
        )

    def _build_event(
        self,
        state: str,
        confidence: float,
        reason: str,
        duration_ms: int,
        face_detected: bool = False,
        ear_score: float = 0.30,
        eyes_closed: bool = False,
        head_pose: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        severity = "CRITICAL" if state == "DROWSINESS_WARNING" else (
            "WARNING" if state in ("ATTENTION_WARNING", "FACE_NOT_DETECTED") else "INFO"
        )
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "state": state,
            "severity": severity,
            "confidence": round(confidence, 3),
            "reason": reason,
            "duration_ms": duration_ms,
            "face_detected": face_detected,
            "ear_average": round(ear_score, 3),
            "eyes_closed": eyes_closed,
            "head_pose": head_pose or {"pitch": 0.0, "yaw": 0.0, "roll": 0.0},
            "alert_required": severity in ("CRITICAL", "WARNING")
        }
