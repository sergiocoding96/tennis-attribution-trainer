"""Sliding temporal windows (3-5 seconds)."""
from typing import Any, List, Tuple


def sliding_windows(
    num_frames: int,
    fps: float,
    window_seconds: float = 4.0,
    stride_seconds: float = 2.0,
) -> List[Tuple[int, int, float, float]]:
    """
    Yield (start_index, end_index, start_time, end_time) for each window.
    window_seconds: length of window in seconds (e.g. 3-5).
    stride_seconds: step between window starts.
    """
    if fps <= 0 or num_frames <= 0:
        return []
    window_frames = max(1, int(round(window_seconds * fps)))
    stride_frames = max(1, int(round(stride_seconds * fps)))
    out: List[Tuple[int, int, float, float]] = []
    start = 0
    while start + window_frames <= num_frames:
        end = start + window_frames
        t_start = start / fps
        t_end = end / fps
        out.append((start, end, t_start, t_end))
        start += stride_frames
    if not out and num_frames > 0:
        out.append((0, min(window_frames, num_frames), 0.0, min(window_seconds, num_frames / fps)))
    return out
