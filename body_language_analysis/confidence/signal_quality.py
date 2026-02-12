"""Signal quality: visibility and jitter."""
from typing import List, Optional
from ..pose.landmark_utils import LandmarkDict


def pose_visibility_score(landmarks_list: List[Optional[LandmarkDict]]) -> float:
    """
    Average visibility of key landmarks over the window. 0-1.
    """
    if not landmarks_list:
        return 0.0
    scores = []
    keypoints = ["nose", "left_shoulder", "right_shoulder", "left_hip", "right_hip"]
    for lm in landmarks_list:
        if lm is None:
            scores.append(0.0)
            continue
        vis = [lm.get(k, {}).get("visibility", 0.0) for k in keypoints if lm.get(k)]
        scores.append(sum(vis) / len(vis) if vis else 0.0)
    return sum(scores) / len(scores) if scores else 0.0


def occlusion_jitter_score(
    landmarks_list: List[Optional[LandmarkDict]],
    timestamps: List[float],
) -> float:
    """
    Penalty for occlusion (many None) and jitter (large frame-to-frame jumps).
    Returns 0-1 where 1 = good (low occlusion, low jitter).
    """
    if len(landmarks_list) < 2:
        return 1.0
    valid_ratio = sum(1 for lm in landmarks_list if lm is not None) / len(landmarks_list)
    # Simple jitter: variance of nose x
    nose_x = []
    for lm in landmarks_list:
        if lm and lm.get("nose"):
            nose_x.append(lm["nose"]["x"])
    jitter = 0.0
    if len(nose_x) >= 2:
        diffs = [abs(nose_x[i] - nose_x[i - 1]) for i in range(1, len(nose_x))]
        jitter = sum(diffs) / len(diffs) if diffs else 0.0
    jitter_penalty = max(0, 1.0 - jitter * 5)
    return valid_ratio * 0.6 + jitter_penalty * 0.4
