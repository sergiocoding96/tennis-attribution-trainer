"""Posture metrics: shoulders, head tilt, torso expansion."""
from typing import Dict, Optional
from ..pose.landmark_utils import LandmarkDict
import math


def _get(lm: LandmarkDict, name: str) -> Optional[tuple]:
    p = lm.get(name)
    if p is None or p.get("visibility", 0) < 0.5:
        return None
    return (p["x"], p["y"])


def _angle_deg(dx: float, dy: float) -> float:
    """Angle from horizontal (right = 0), in degrees."""
    return math.degrees(math.atan2(-dy, dx))


def compute_posture_metrics(landmarks: LandmarkDict) -> Dict[str, float]:
    """
    Compute shoulder level, head tilt, and torso expansion from landmarks.
    Returns dict with shoulder_angle_deg, head_tilt_deg, torso_expansion (0-1 scale).
    """
    out: Dict[str, float] = {
        "shoulder_angle_deg": 0.0,
        "head_tilt_deg": 0.0,
        "torso_expansion": 0.0,
    }
    ls = _get(landmarks, "left_shoulder")
    rs = _get(landmarks, "right_shoulder")
    nose = _get(landmarks, "nose")
    lh = _get(landmarks, "left_hip")
    rh = _get(landmarks, "right_hip")

    if ls and rs:
        dx = rs[0] - ls[0]
        dy = rs[1] - ls[1]
        out["shoulder_angle_deg"] = _angle_deg(dx, dy)

    if nose and ls and rs:
        mid_shoulder_x = (ls[0] + rs[0]) / 2
        mid_shoulder_y = (ls[1] + rs[1]) / 2
        dx = nose[0] - mid_shoulder_x
        dy = nose[1] - mid_shoulder_y
        out["head_tilt_deg"] = _angle_deg(dx, dy)

    if ls and rs and lh and rh:
        shoulder_width = math.hypot(rs[0] - ls[0], rs[1] - ls[1])
        hip_width = math.hypot(rh[0] - lh[0], rh[1] - lh[1])
        # Torso expansion: ratio of shoulder to hip width (normalized to typical range)
        if hip_width > 1e-6:
            ratio = shoulder_width / hip_width
            out["torso_expansion"] = min(1.0, max(0.0, (ratio - 0.8) / 0.6))

    return out
