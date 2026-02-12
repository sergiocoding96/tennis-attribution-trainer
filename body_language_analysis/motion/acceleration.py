"""Acceleration of keypoints over time."""
from typing import Dict, List, Optional
from ..pose.landmark_utils import LandmarkDict
from .velocity import compute_velocity


def compute_acceleration(
    landmarks_history: List[Optional[LandmarkDict]],
    timestamps: List[float],
    keypoint: str = "nose",
) -> float:
    """
    Approximate acceleration magnitude from last 3 frames (central difference).
    Returns magnitude in normalized units per second^2.
    """
    if len(landmarks_history) < 3 or len(timestamps) < 3:
        return 0.0
    dt1 = timestamps[-1] - timestamps[-2]
    dt2 = timestamps[-2] - timestamps[-3]
    if dt1 <= 0 or dt2 <= 0:
        return 0.0
    v1 = compute_velocity(landmarks_history[:-1], dt1, keypoint)
    v2 = compute_velocity(landmarks_history[:-2], dt2, keypoint)
    dt_avg = (dt1 + dt2) / 2
    if dt_avg <= 0:
        return 0.0
    return abs(v1 - v2) / dt_avg
