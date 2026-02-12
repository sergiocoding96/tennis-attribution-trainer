"""Pose estimation via MediaPipe (or fallback stub)."""
from typing import Any, Dict, Optional, Tuple
import cv2
from .landmark_utils import LandmarkDict, normalize_landmarks

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    mp = None


class PoseEstimator:
    """Wrapper for MediaPipe Pose; returns normalized landmarks and confidence per frame."""

    def __init__(self, min_detection_confidence: float = 0.5, min_tracking_confidence: float = 0.5) -> None:
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence
        self._pose: Any = None
        if MEDIAPIPE_AVAILABLE and mp:
            self._pose = mp.solutions.pose.Pose(
                static_image_mode=False,
                model_complexity=1,
                min_detection_confidence=min_detection_confidence,
                min_tracking_confidence=min_tracking_confidence,
            )

    def process_frame(
        self,
        frame: "cv2.Mat",
    ) -> Tuple[Optional[LandmarkDict], float]:
        """
        Process a BGR frame. Returns (landmarks_dict, pose_confidence).
        If MediaPipe is not available, returns (None, 0.0).
        """
        if self._pose is None:
            return None, 0.0
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w = frame.shape[:2]
        results = self._pose.process(rgb)
        if not results.pose_landmarks:
            return None, 0.0
        landmarks = normalize_landmarks(results.pose_landmarks, w, h)
        # Overall confidence: average visibility of key points
        visibilities = [lm["visibility"] for lm in landmarks.values()]
        confidence = sum(visibilities) / len(visibilities) if visibilities else 0.0
        return landmarks, confidence

    def close(self) -> None:
        """Release resources."""
        if self._pose is not None:
            self._pose.close()
            self._pose = None
