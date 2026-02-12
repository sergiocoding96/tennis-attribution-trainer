"""Map valence + intensity to emotion label (joy, frustration, relief, calm, etc.)."""
import os
from typing import Any, Dict, List

# Default rules if YAML not found or invalid
_DEFAULT_GESTURE_EMOTIONS = {"fist_pump": "joy", "head_down": "frustration", "racket_drop": "defeat"}
_DEFAULT_VALENCE_INTENSITY = {
    "positive": {"high": "excitement", "medium": "relief", "low": "calm"},
    "negative": {"high": "anger", "medium": "frustration", "low": "disappointment"},
    "neutral": "neutral",
}
_DEFAULT_INTENSITY_THRESHOLDS = {"high": 7, "medium": 4}


def _load_emotion_rules() -> Dict[str, Any]:
    """Load emotion_rules.yaml from config; return empty dict on failure."""
    try:
        import yaml
        config_path = os.path.join(os.path.dirname(__file__), "..", "config", "emotion_rules.yaml")
        if os.path.isfile(config_path):
            with open(config_path) as f:
                return yaml.safe_load(f) or {}
    except Exception:
        pass
    return {}


def _intensity_bucket(intensity: float, thresholds: Dict[str, int]) -> str:
    """Return 'high', 'medium', or 'low' from 1-10 intensity."""
    if intensity >= thresholds.get("high", 7):
        return "high"
    if intensity >= thresholds.get("medium", 4):
        return "medium"
    return "low"


def map_to_emotion_label(valence: str, intensity: float, gesture_names: List[str]) -> str:
    """
    Rule-based emotion label from valence, intensity, and detected gestures.
    Uses emotion_rules.yaml when available; falls back to built-in rules.
    """
    rules = _load_emotion_rules()
    gesture_emotions = rules.get("gesture_emotions") or _DEFAULT_GESTURE_EMOTIONS
    valence_intensity = rules.get("valence_intensity") or _DEFAULT_VALENCE_INTENSITY
    intensity_thresholds = rules.get("intensity_thresholds") or _DEFAULT_INTENSITY_THRESHOLDS

    # Gesture-override: first matching gesture wins
    for g in gesture_names:
        if g in gesture_emotions:
            return gesture_emotions[g]

    # Valence + intensity bucket
    bucket = _intensity_bucket(intensity, intensity_thresholds)
    vi = valence_intensity.get(valence)
    if isinstance(vi, dict):
        return vi.get(bucket, "neutral")
    if isinstance(vi, str):
        return vi
    return "neutral"
