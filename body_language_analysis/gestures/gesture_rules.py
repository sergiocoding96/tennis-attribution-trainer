"""Rule definitions for tennis body language gestures."""
from typing import Any, Callable, Dict
from ..pose.landmark_utils import LandmarkDict


def _wrist_above_shoulder(lm: LandmarkDict, side: str) -> bool:
    shoulder = lm.get(f"{side}_shoulder")
    wrist = lm.get(f"{side}_wrist")
    if not shoulder or not wrist or shoulder.get("visibility", 0) < 0.5 or wrist.get("visibility", 0) < 0.5:
        return False
    return wrist["y"] < shoulder["y"]

def _wrist_raised_quick(lm: LandmarkDict, side: str) -> bool:
    wrist = lm.get(f"{side}_wrist")
    hip = lm.get(f"{side}_hip")
    if not wrist or not hip or wrist.get("visibility", 0) < 0.5 or hip.get("visibility", 0) < 0.5:
        return False
    return wrist["y"] < hip["y"] + 0.15

def _head_down(lm: LandmarkDict) -> bool:
    nose = lm.get("nose")
    l_shoulder = lm.get("left_shoulder")
    r_shoulder = lm.get("right_shoulder")
    if not nose or not l_shoulder or not r_shoulder:
        return False
    mid_y = (l_shoulder["y"] + r_shoulder["y"]) / 2
    return nose["y"] > mid_y + 0.08

def _head_shake_horizontal(history: list, lm: LandmarkDict) -> bool:
    """Requires temporal: nose x oscillating. Simplified: head tilt variance."""
    if len(history) < 5:
        return False
    return False  # Placeholder; full impl would use nose x over time

GESTURE_RULES: Dict[str, Dict[str, Any]] = {
    "fist_pump": {
        "description": "Wrist raised above shoulder (celebration)",
        "check": lambda lm: _wrist_above_shoulder(lm, "right") or _wrist_above_shoulder(lm, "left"),
        "valence": "positive",
    },
    "racket_drop": {
        "description": "Arms low, relaxed / defeated",
        "check": lambda lm: not _wrist_raised_quick(lm, "right") and not _wrist_raised_quick(lm, "left"),
        "valence": "negative",
    },
    "head_down": {
        "description": "Head below shoulder line",
        "check": _head_down,
        "valence": "negative",
    },
}
