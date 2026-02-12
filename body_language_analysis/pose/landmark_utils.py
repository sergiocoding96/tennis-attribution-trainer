"""Normalize and structure pose landmarks."""
from typing import Any, Dict, List, Optional

LandmarkDict = Dict[str, Dict[str, float]]


def _point_val(pt: Any, key: str, default: float = 0.0) -> float:
    """Get x/y/z/visibility from a landmark point (MediaPipe protobuf or dict)."""
    if isinstance(pt, dict):
        return float(pt.get(key, default))
    return float(getattr(pt, key, default))


def normalize_landmarks(
    landmarks: Any,
    frame_width: int,
    frame_height: int,
    visibility_threshold: float = 0.5,
) -> LandmarkDict:
    """
    Convert pose landmarks to normalized dict: name -> {x, y, z, visibility}.
    x, y in [0, 1] normalized; z relative depth; visibility in [0, 1].
    """
    # MediaPipe pose returns protobuf landmarks (no .get()); dicts use .get()
    result: LandmarkDict = {}
    names = _get_landmark_names()
    raw = _landmarks_to_list(landmarks)
    for i, name in enumerate(names):
        if i >= len(raw):
            break
        pt = raw[i]
        result[name] = {
            "x": _point_val(pt, "x", 0.0),
            "y": _point_val(pt, "y", 0.0),
            "z": _point_val(pt, "z", 0.0),
            "visibility": _point_val(pt, "visibility", 1.0),
        }
    return result


def _get_landmark_names() -> List[str]:
    """MediaPipe Pose landmark names (33 points)."""
    return [
        "nose",
        "left_eye_inner",
        "left_eye",
        "left_eye_outer",
        "right_eye_inner",
        "right_eye",
        "right_eye_outer",
        "left_ear",
        "right_ear",
        "mouth_left",
        "mouth_right",
        "left_shoulder",
        "right_shoulder",
        "left_elbow",
        "right_elbow",
        "left_wrist",
        "right_wrist",
        "left_pinky",
        "right_pinky",
        "left_index",
        "right_index",
        "left_thumb",
        "right_thumb",
        "left_hip",
        "right_hip",
        "left_knee",
        "right_knee",
        "left_ankle",
        "right_ankle",
        "left_heel",
        "right_heel",
        "left_foot_index",
        "right_foot_index",
    ]


def _landmarks_to_list(landmarks: Any) -> List[Any]:
    """Convert various landmark formats to list of points."""
    if hasattr(landmarks, "landmark"):
        return list(landmarks.landmark)
    if isinstance(landmarks, (list, tuple)):
        return list(landmarks)
    return []
