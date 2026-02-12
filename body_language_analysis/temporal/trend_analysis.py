"""Trend (rising/falling/stable) over a window of scalar values."""
from typing import List


def trend_over_window(values: List[float]) -> str:
    """
    Simple linear trend: 'rising', 'falling', or 'stable'.
    Uses first vs last half mean.
    """
    if len(values) < 2:
        return "stable"
    n = len(values)
    first_half = values[: n // 2]
    second_half = values[n // 2 :]
    m1 = sum(first_half) / len(first_half) if first_half else 0.0
    m2 = sum(second_half) / len(second_half) if second_half else 0.0
    diff = m2 - m1
    if diff > 0.02:
        return "rising"
    if diff < -0.02:
        return "falling"
    return "stable"
