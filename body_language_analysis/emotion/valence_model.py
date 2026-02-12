"""
Optional trained valence predictor. If body_language_analysis/models/valence_model.pkl exists,
the pipeline uses it for valence instead of (or blended with) rule-based classification.
"""
import os
from typing import Any, Dict, List, Optional

_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.path.join(_SCRIPT_DIR, "..", "models", "valence_model.pkl")

FEATURE_NAMES = [
    "shoulder_angle_deg",
    "head_tilt_deg",
    "torso_expansion",
    "velocity_nose_avg",
    "gait_stability",
    "intensity",
    "confidence_score",
    "gesture_fist_pump",
    "gesture_head_down",
    "gesture_racket_drop",
    "gesture_shoulder_slump",
    "gesture_hands_on_hips",
    "gesture_head_shake",
]

_cached: Optional[Dict[str, Any]] = None


def _load_model() -> Optional[Dict[str, Any]]:
    global _cached
    if _cached is not None:
        return _cached
    if not os.path.isfile(_MODEL_PATH):
        return None
    try:
        import pickle
        with open(_MODEL_PATH, "rb") as f:
            _cached = pickle.load(f)
        return _cached
    except Exception:
        return None


def _window_to_features(window: Dict[str, Any]) -> List[float]:
    """Build feature vector from pipeline window dict (same order as training)."""
    posture = window.get("posture_metrics") or {}
    motion = window.get("motion_metrics") or {}
    gesture_names = [g.get("gesture", g) if isinstance(g, dict) else g for g in window.get("detected_gestures") or []]
    gesture_set = set(gesture_names)
    return [
        float(posture.get("shoulder_angle_deg", 0)),
        float(posture.get("head_tilt_deg", 0)),
        float(posture.get("torso_expansion", 0)),
        float(motion.get("velocity_nose_avg", 0)),
        float(motion.get("gait_stability", 0)),
        float(window.get("intensity", 0)),
        float(window.get("confidence_score", 0)),
        1 if "fist_pump" in gesture_set else 0,
        1 if "head_down" in gesture_set else 0,
        1 if "racket_drop" in gesture_set else 0,
        1 if "shoulder_slump" in gesture_set else 0,
        1 if "hands_on_hips" in gesture_set else 0,
        1 if "head_shake" in gesture_set else 0,
    ]


def predict_valence(window: Dict[str, Any]) -> Optional[str]:
    """
    Predict valence (positive/neutral/negative) from a window dict if a trained model exists.
    Returns None if no model or prediction fails.
    """
    data = _load_model()
    if not data:
        return None
    model = data.get("model")
    scaler = data.get("scaler")
    if not model or not scaler:
        return None
    try:
        import numpy as np
        feat = _window_to_features(window)
        X = np.array([feat])
        X_scaled = scaler.transform(X)
        pred = model.predict(X_scaled)
        return str(pred[0])
    except Exception:
        return None
