"""Gait / movement stability (optional)."""
from typing import List, Optional
from ..pose.landmark_utils import LandmarkDict
from .velocity import compute_velocity


def gait_stability(
    landmarks_history: List[Optional[LandmarkDict]],
    timestamps: List[float],
    keypoint: str = "nose",
) -> float:
    """
    Simple stability: inverse of velocity variance over the window.
    Higher = more stable. Returns 0-1 scale (1 = very stable).
    """
    if len(landmarks_history) < 3 or len(timestamps) < 3:
        return 1.0
    speeds: List[float] = []
    for i in range(1, len(landmarks_history)):
        dt = timestamps[i] - timestamps[i - 1]
        if dt <= 0:
            continue
        v = compute_velocity(landmarks_history[: i + 1], dt, keypoint)
        speeds.append(v)
    if not speeds:
        return 1.0
    mean = sum(speeds) / len(speeds)
    var = sum((s - mean) ** 2 for s in speeds) / len(speeds)
    # Map variance to 0-1 stability (high var -> low stability)
    return max(0.0, min(1.0, 1.0 - min(1.0, var * 10)))
