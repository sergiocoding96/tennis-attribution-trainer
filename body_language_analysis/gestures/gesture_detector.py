"""Detect gesture events from landmark sequences."""
from typing import List, Optional, Tuple
from ..pose.landmark_utils import LandmarkDict
from .gesture_rules import GESTURE_RULES


class GestureDetector:
    """Detects predefined gestures per frame and aggregates over windows."""

    def __init__(self, min_confidence: float = 0.5) -> None:
        self.min_confidence = min_confidence

    def detect_frame(
        self,
        landmarks: Optional[LandmarkDict],
        timestamp: float,
    ) -> List[Tuple[str, float, float]]:
        """
        Returns list of (gesture_name, timestamp, confidence) for this frame.
        """
        if landmarks is None:
            return []
        out: List[Tuple[str, float, float]] = []
        for name, rule in GESTURE_RULES.items():
            check = rule.get("check")
            if not callable(check):
                continue
            try:
                if check(landmarks):
                    out.append((name, timestamp, self.min_confidence))
            except Exception:
                continue
        return out

    def detect_window(
        self,
        landmarks_list: List[Optional[LandmarkDict]],
        timestamps: List[float],
    ) -> List[dict]:
        """
        Aggregate gestures over a window. Returns list of
        { "gesture": name, "timestamp": t, "confidence": c } for unique gestures
        with highest confidence in window.
        """
        seen: dict = {}
        for lm, t in zip(landmarks_list, timestamps):
            for name, ts, conf in self.detect_frame(lm, t):
                if name not in seen or seen[name]["confidence"] < conf:
                    seen[name] = {"gesture": name, "timestamp": ts, "confidence": conf}
        return list(seen.values())
