"""Valence: positive / neutral / negative from posture, motion, gestures."""
from typing import Dict, List


def classify_valence(
    posture_trend: str,
    gesture_valences: List[str],
    intensity: float,
) -> str:
    """
    Deterministic valence from posture trend, gesture valences, and intensity.
    Returns 'positive', 'neutral', or 'negative'.
    """
    pos_count = sum(1 for v in gesture_valences if v == "positive")
    neg_count = sum(1 for v in gesture_valences if v == "negative")
    if pos_count > neg_count and intensity >= 4:
        return "positive"
    if neg_count > pos_count and intensity >= 4:
        return "negative"
    if posture_trend == "rising" and intensity >= 3:
        return "positive"
    if posture_trend == "falling" and intensity >= 3:
        return "negative"
    if intensity >= 6:
        return "positive" if pos_count >= neg_count else "negative"
    return "neutral"
