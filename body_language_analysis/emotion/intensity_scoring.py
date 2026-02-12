"""Intensity 1-10 from posture and motion magnitude."""
from typing import Dict, List


def score_intensity(
    posture_metrics_list: List[Dict],
    velocity_magnitudes: List[float],
    gesture_count: int,
) -> float:
    """
    Map posture/motion/gesture activity to 1-10 intensity.
    Higher motion and more gestures -> higher intensity.
    """
    if not posture_metrics_list and not velocity_magnitudes:
        return 1.0
    # Torso expansion and deviation from neutral
    expansion_avg = 0.0
    for p in posture_metrics_list:
        expansion_avg += p.get("torso_expansion", 0.5)
    if posture_metrics_list:
        expansion_avg /= len(posture_metrics_list)
    # Motion
    vel_avg = sum(velocity_magnitudes) / len(velocity_magnitudes) if velocity_magnitudes else 0.0
    # Simple linear combo: 1-10
    base = 1.0 + expansion_avg * 3 + min(3.0, vel_avg * 5) + min(3.0, gesture_count * 0.5)
    return min(10.0, max(1.0, base))
