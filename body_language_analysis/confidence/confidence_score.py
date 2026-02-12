"""Per-window confidence score."""
from typing import List, Optional
from ..pose.landmark_utils import LandmarkDict
from .signal_quality import pose_visibility_score, occlusion_jitter_score


def window_confidence_score(
    landmarks_list: List[Optional[LandmarkDict]],
    timestamps: List[float],
    pose_confidences: List[float],
) -> float:
    """
    Combine visibility, occlusion/jitter, and pose confidence into one 0-1 score.
    """
    vis = pose_visibility_score(landmarks_list)
    occ = occlusion_jitter_score(landmarks_list, timestamps)
    pose_avg = sum(pose_confidences) / len(pose_confidences) if pose_confidences else 0.0
    return (vis * 0.4 + occ * 0.3 + pose_avg * 0.3)
