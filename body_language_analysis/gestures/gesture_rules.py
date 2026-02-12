"""Rule definitions for tennis body language gestures."""
import math
from typing import Any, Callable, Dict, List, Optional
from ..pose.landmark_utils import LandmarkDict

# Default scale when body size cannot be computed (normalized coords, ~0.2 = typical shoulder width)
_DEFAULT_SCALE = 0.2


def _get_scale(lm: LandmarkDict) -> float:
    """Body scale from shoulder width (scale-invariant thresholds)."""
    ls = lm.get("left_shoulder")
    rs = lm.get("right_shoulder")
    if not ls or not rs or ls.get("visibility", 0) < 0.3 or rs.get("visibility", 0) < 0.3:
        return _DEFAULT_SCALE
    dx = rs["x"] - ls["x"]
    dy = rs["y"] - ls["y"]
    w = math.hypot(dx, dy)
    return max(w, 0.08) if w else _DEFAULT_SCALE


def _wrist_above_shoulder(lm: LandmarkDict, side: str) -> bool:
    shoulder = lm.get(f"{side}_shoulder")
    wrist = lm.get(f"{side}_wrist")
    if not shoulder or not wrist or shoulder.get("visibility", 0) < 0.5 or wrist.get("visibility", 0) < 0.5:
        return False
    return wrist["y"] < shoulder["y"]


def _wrist_raised_quick(lm: LandmarkDict, side: str, margin: float = 0.15) -> bool:
    wrist = lm.get(f"{side}_wrist")
    hip = lm.get(f"{side}_hip")
    if not wrist or not hip or wrist.get("visibility", 0) < 0.5 or hip.get("visibility", 0) < 0.5:
        return False
    return wrist["y"] < hip["y"] + margin


def _arms_low(lm: LandmarkDict, margin: float = 0.15) -> bool:
    """Both wrists at or below hip level (arms not raised)."""
    return not _wrist_raised_quick(lm, "right", margin) and not _wrist_raised_quick(lm, "left", margin)


def _head_down(lm: LandmarkDict, scale: Optional[float] = None) -> bool:
    nose = lm.get("nose")
    l_shoulder = lm.get("left_shoulder")
    r_shoulder = lm.get("right_shoulder")
    if not nose or not l_shoulder or not r_shoulder:
        return False
    mid_y = (l_shoulder["y"] + r_shoulder["y"]) / 2
    offset = 0.08 * ((scale or _get_scale(lm)) / _DEFAULT_SCALE)
    return nose["y"] > mid_y + offset


def _shoulder_slump(lm: LandmarkDict, scale: Optional[float] = None) -> bool:
    """Shoulders dropped relative to hips (collapsed posture)."""
    ls = lm.get("left_shoulder")
    rs = lm.get("right_shoulder")
    lh = lm.get("left_hip")
    rh = lm.get("right_hip")
    if not all((ls, rs, lh, rh)):
        return False
    if ls.get("visibility", 0) < 0.5 or rs.get("visibility", 0) < 0.5:
        return False
    mid_shoulder_y = (ls["y"] + rs["y"]) / 2
    mid_hip_y = (lh["y"] + rh["y"]) / 2
    offset = 0.12 * ((scale or _get_scale(lm)) / _DEFAULT_SCALE)
    return mid_shoulder_y > mid_hip_y + offset


def _hands_on_hips(lm: LandmarkDict, scale: Optional[float] = None) -> bool:
    """Wrists near hips (same side) in x and similar y."""
    s = scale or _get_scale(lm)
    k = s / _DEFAULT_SCALE
    dx_lim = 0.08 * k
    dy_lim = 0.12 * k
    for side in ("left", "right"):
        wrist = lm.get(f"{side}_wrist")
        hip = lm.get(f"{side}_hip")
        if not wrist or not hip or wrist.get("visibility", 0) < 0.5 or hip.get("visibility", 0) < 0.5:
            continue
        dx = abs(wrist["x"] - hip["x"])
        dy = abs(wrist["y"] - hip["y"])
        if dx < dx_lim and dy < dy_lim:
            return True
    return False


def _head_shake_from_window(landmarks_list: List[Optional[LandmarkDict]], timestamps: List[float]) -> bool:
    """Detect horizontal head shake: nose x oscillates over the window."""
    xs = []
    for lm in landmarks_list:
        if not lm:
            continue
        nose = lm.get("nose")
        if nose and nose.get("visibility", 0) >= 0.5:
            xs.append(nose["x"])
    if len(xs) < 6:
        return False
    # Variance of x (horizontal movement)
    mean_x = sum(xs) / len(xs)
    var = sum((x - mean_x) ** 2 for x in xs) / len(xs)
    if var < 0.0008:
        return False
    # Sign changes in successive differences (oscillation)
    diffs = [xs[i + 1] - xs[i] for i in range(len(xs) - 1)]
    sign_changes = sum(1 for i in range(len(diffs) - 1) if (diffs[i] * diffs[i + 1]) < 0)
    return sign_changes >= 2


def _head_down_check(lm: LandmarkDict) -> bool:
    return _head_down(lm, None)


def _shoulder_slump_check(lm: LandmarkDict) -> bool:
    return _shoulder_slump(lm, None)


def _hands_on_hips_check(lm: LandmarkDict) -> bool:
    return _hands_on_hips(lm, None)


def _fist_pump_both(lm: LandmarkDict) -> bool:
    """Both wrists above shoulders (stricter celebration)."""
    return _wrist_above_shoulder(lm, "right") and _wrist_above_shoulder(lm, "left")


GESTURE_RULES: Dict[str, Dict[str, Any]] = {
    "fist_pump": {
        "description": "Wrist raised above shoulder (celebration)",
        "check": lambda lm: _wrist_above_shoulder(lm, "right") or _wrist_above_shoulder(lm, "left"),
        "valence": "positive",
    },
    "fist_pump_both": {
        "description": "Both wrists above shoulders (celebration, stricter)",
        "check": _fist_pump_both,
        "valence": "positive",
    },
    "racket_drop": {
        "description": "Arms low with negative posture (defeated / resigned)",
        "check": lambda lm: _arms_low(lm) and (_shoulder_slump(lm) or _head_down(lm)),
        "valence": "negative",
    },
    "head_down": {
        "description": "Head below shoulder line",
        "check": _head_down_check,
        "valence": "negative",
    },
    "shoulder_slump": {
        "description": "Shoulders dropped (collapsed posture)",
        "check": _shoulder_slump_check,
        "valence": "negative",
    },
    "hands_on_hips": {
        "description": "Hands on hips stance",
        "check": _hands_on_hips_check,
        "valence": "neutral",
    },
}

# Temporal gestures: require full window (landmarks_list, timestamps). Check returns bool.
TEMPORAL_GESTURE_RULES: Dict[str, Dict[str, Any]] = {
    "head_shake": {
        "description": "Horizontal head shake (disbelief / no)",
        "check": _head_shake_from_window,
        "valence": "negative",
    },
}
