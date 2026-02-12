"""Map valence + intensity to emotion label (joy, frustration, relief, calm, etc.)."""
from typing import List


def map_to_emotion_label(valence: str, intensity: float, gesture_names: List[str]) -> str:
    """
    Rule-based emotion label from valence, intensity, and detected gestures.
    """
    if "fist_pump" in gesture_names:
        return "joy"
    if "head_down" in gesture_names and valence == "negative":
        return "frustration"
    if "racket_drop" in gesture_names and valence == "negative":
        return "defeat" if intensity >= 5 else "resignation"
    if valence == "positive":
        if intensity >= 7:
            return "excitement"
        if intensity >= 4:
            return "relief"
        return "calm"
    if valence == "negative":
        if intensity >= 7:
            return "anger"
        if intensity >= 4:
            return "frustration"
        return "disappointment"
    return "neutral"
