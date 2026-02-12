"""Valence: positive / neutral / negative from posture, motion, gestures."""
from typing import List


def classify_valence(
    posture_trend: str,
    gesture_valences: List[str],
    intensity: float,
    is_reaction_window: bool = True,
) -> str:
    """
    Deterministic valence from posture trend, gesture valences, and intensity.
    When is_reaction_window is False (high motion / stroke), gesture valences
    are ignored and only posture_trend + intensity are used (reduces false
    positives from strokes being misread as gestures).
    Returns 'positive', 'neutral', or 'negative'.
    """
    if not is_reaction_window:
        # High-motion window: don't trust gestures; use posture and intensity only
        if intensity < 4:
            return "neutral"
        if posture_trend == "rising":
            return "positive"
        if posture_trend == "falling":
            return "negative"
        return "neutral"

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
