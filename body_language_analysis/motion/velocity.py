"""Velocity of keypoints over time."""
from typing import Dict, List, Optional
from ..pose.landmark_utils import LandmarkDict


def compute_velocity(
    landmarks_history: List[Optional[LandmarkDict]],
    dt: float,
    keypoint: str = "nose",
) -> float:
    """
    Compute magnitude of velocity for a keypoint over the last two frames.
    dt = time step in seconds. Returns speed in normalized units per second.
    """
    if len(landmarks_history) < 2 or dt <= 0:
        return 0.0
    curr = landmarks_history[-1]
    prev = landmarks_history[-2]
    if curr is None or prev is None:
        return 0.0
    c = curr.get(keypoint)
    p = prev.get(keypoint)
    if not c or not p or c.get("visibility", 0) < 0.5 or p.get("visibility", 0) < 0.5:
        return 0.0
    dx = c["x"] - p["x"]
    dy = c["y"] - p["y"]
    return (dx * dx + dy * dy) ** 0.5 / dt
