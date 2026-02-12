"""Trend (rising/falling/stable) over a window of scalar values; temporal smoothing."""
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


def smooth_valence_over_windows(valences: List[str], kernel_size: int = 3) -> List[str]:
    """
    Smooth valence list by majority vote over a sliding kernel.
    Reduces jitter (e.g. positive/negative/positive -> positive).
    """
    if not valences or kernel_size < 1:
        return list(valences)
    n = len(valences)
    half = kernel_size // 2
    out: List[str] = []
    for i in range(n):
        start = max(0, i - half)
        end = min(n, i + half + 1)
        window_vals = valences[start:end]
        counts: dict = {}
        for v in window_vals:
            counts[v] = counts.get(v, 0) + 1
        best = max(counts.items(), key=lambda x: x[1])
        out.append(best[0])
    return out
