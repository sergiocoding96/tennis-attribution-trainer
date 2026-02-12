"""Detect gesture events from landmark sequences."""
import os
from typing import List, Optional, Tuple
from ..pose.landmark_utils import LandmarkDict
from .gesture_rules import GESTURE_RULES, TEMPORAL_GESTURE_RULES


def _load_gesture_config() -> dict:
    """Load gestures section from thresholds.yaml."""
    try:
        import yaml
        config_path = os.path.join(os.path.dirname(__file__), "..", "config", "thresholds.yaml")
        if os.path.isfile(config_path):
            with open(config_path) as f:
                data = yaml.safe_load(f) or {}
                return data.get("gestures", {})
    except Exception:
        pass
    return {}


def _smooth_landmarks(
    landmarks_list: List[Optional[LandmarkDict]],
    window: int,
) -> List[Optional[LandmarkDict]]:
    """
    Temporal smoothing: each landmark (x, y) is averaged over a sliding window.
    Reduces jitter so one-frame spikes are less likely to trigger gestures.
    """
    if window < 2 or not landmarks_list:
        return list(landmarks_list)
    n = len(landmarks_list)
    half = window // 2
    result: List[Optional[LandmarkDict]] = []
    for i in range(n):
        start = max(0, i - half)
        end = min(n, i + half + 1)
        slice_lm = landmarks_list[start:end]
        valid = [lm for lm in slice_lm if lm]
        if not valid:
            result.append(landmarks_list[i])
            continue
        # Average x, y, z per key; visibility = max
        keys = set()
        for lm in valid:
            keys.update(lm.keys())
        smoothed: LandmarkDict = {}
        for k in keys:
            xs = [lm[k]["x"] for lm in valid if k in lm]
            ys = [lm[k]["y"] for lm in valid if k in lm]
            zs = [lm[k]["z"] for lm in valid if k in lm]
            vs = [lm[k].get("visibility", 1.0) for lm in valid if k in lm]
            if xs and ys:
                smoothed[k] = {
                    "x": sum(xs) / len(xs),
                    "y": sum(ys) / len(ys),
                    "z": sum(zs) / len(zs) if zs else 0.0,
                    "visibility": max(vs) if vs else 1.0,
                }
        result.append(smoothed if smoothed else landmarks_list[i])
    return result


class GestureDetector:
    """Detects predefined gestures per frame and temporal gestures over windows."""

    def __init__(
        self,
        min_confidence: float = 0.5,
        config: Optional[dict] = None,
    ) -> None:
        cfg = config if config is not None else _load_gesture_config()
        self.min_confidence = float(cfg.get("min_confidence", min_confidence))
        self.min_frames_ratio = float(cfg.get("min_frames_ratio", 0.25))
        self.min_consecutive_frames = int(cfg.get("min_consecutive_frames", 5))
        smooth = cfg.get("smooth_landmarks_frames", 0)
        self.smooth_landmarks_frames = int(smooth) if smooth else 0
        self.min_pose_confidence_for_gestures = float(cfg.get("min_pose_confidence_for_gestures", 0.0))
        self.fist_pump_require_motion = bool(cfg.get("fist_pump_require_motion", True))
        self.use_fist_pump_both_wrists = bool(cfg.get("use_fist_pump_both_wrists", True))

    def _get_check_for_name(self, name: str):
        """Return the rule check to use; substitute fist_pump_both when configured."""
        if name == "fist_pump" and self.use_fist_pump_both_wrists and "fist_pump_both" in GESTURE_RULES:
            return GESTURE_RULES["fist_pump_both"].get("check")
        return GESTURE_RULES.get(name, {}).get("check")

    def detect_frame(
        self,
        landmarks: Optional[LandmarkDict],
        timestamp: float,
    ) -> List[Tuple[str, float, float]]:
        """
        Returns list of (gesture_name, timestamp, confidence) for this frame.
        Uses fist_pump_both check when use_fist_pump_both_wrists is True.
        """
        if landmarks is None:
            return []
        out: List[Tuple[str, float, float]] = []
        for name in GESTURE_RULES:
            if name == "fist_pump_both":
                continue
            check = self._get_check_for_name(name)
            if not callable(check):
                continue
            try:
                if check(landmarks):
                    out.append((name, timestamp, self.min_confidence))
            except Exception:
                continue
        return out

    def _has_upward_wrist_motion(
        self,
        landmarks_list: List[Optional[LandmarkDict]],
        timestamps: List[float],
        min_drop: float = 0.02,
        span: int = 3,
    ) -> bool:
        """True if any wrist (y) moved upward by at least min_drop over span consecutive frames."""
        ys_left: List[float] = []
        ys_right: List[float] = []
        for lm in landmarks_list:
            if not lm:
                ys_left.append(float("nan"))
                ys_right.append(float("nan"))
                continue
            lw = lm.get("left_wrist")
            rw = lm.get("right_wrist")
            ys_left.append(lw["y"] if lw and lw.get("visibility", 0) >= 0.5 else float("nan"))
            ys_right.append(rw["y"] if rw and rw.get("visibility", 0) >= 0.5 else float("nan"))
        for i in range(len(ys_left) - span):
            for ys in (ys_left, ys_right):
                segment = [ys[i + k] for k in range(span + 1) if i + k < len(ys)]
                valid = [v for v in segment if v == v]  # exclude nan
                if len(valid) < span + 1:
                    continue
                if valid[0] - valid[-1] >= min_drop:
                    return True
        return False

    def detect_window(
        self,
        landmarks_list: List[Optional[LandmarkDict]],
        timestamps: List[float],
        pose_confidences: Optional[List[float]] = None,
    ) -> List[dict]:
        """
        Aggregate gestures over a window (per-frame + temporal). Only reports a
        frame-level gesture if it appears in >= min_frames_ratio of frames or
        in >= min_consecutive_frames in a row. Skips low pose-confidence frames
        when pose_confidences given. Optional: fist_pump requires upward wrist motion.
        """
        if not landmarks_list or not timestamps:
            return []

        # Optional smoothing
        if self.smooth_landmarks_frames >= 2:
            landmarks_list = _smooth_landmarks(landmarks_list, self.smooth_landmarks_frames)

        n_frames = len(landmarks_list)
        frame_level_names = [n for n in GESTURE_RULES if n != "fist_pump_both"]

        # Per-gesture: count frames where true and max consecutive (skip low-confidence frames)
        counts: dict = {name: 0 for name in frame_level_names}
        consecutive: dict = {name: 0 for name in frame_level_names}
        max_consecutive: dict = {name: 0 for name in frame_level_names}
        first_ts: dict = {}
        n_counted = 0

        for idx, (lm, t) in enumerate(zip(landmarks_list, timestamps)):
            if pose_confidences is not None and self.min_pose_confidence_for_gestures > 0:
                if idx >= len(pose_confidences) or pose_confidences[idx] < self.min_pose_confidence_for_gestures:
                    for name in frame_level_names:
                        consecutive[name] = 0
                    continue
            n_counted += 1
            frame_gestures = set()
            for name, _ts, _ in self.detect_frame(lm, t):
                frame_gestures.add(name)
            for name in frame_level_names:
                if name in frame_gestures:
                    counts[name] += 1
                    consecutive[name] += 1
                    max_consecutive[name] = max(max_consecutive[name], consecutive[name])
                    if name not in first_ts:
                        first_ts[name] = t
                else:
                    consecutive[name] = 0

        effective_frames = n_counted if n_counted > 0 else n_frames

        # Build result: include only if ratio or consecutive threshold met
        seen: dict = {}
        for name in frame_level_names:
            c = counts[name]
            mc = max_consecutive[name]
            if c == 0:
                continue
            if c >= self.min_frames_ratio * effective_frames or mc >= self.min_consecutive_frames:
                if name == "fist_pump" and self.fist_pump_require_motion:
                    if not self._has_upward_wrist_motion(landmarks_list, timestamps):
                        continue
                ratio = c / effective_frames if effective_frames else 0
                conf = min(1.0, self.min_confidence * (0.5 + 0.5 * ratio))
                ts = first_ts.get(name, timestamps[len(timestamps) // 2])
                seen[name] = {"gesture": name, "timestamp": ts, "confidence": round(conf, 4)}

        # Temporal gestures (require full window)
        mid_t = timestamps[len(timestamps) // 2] if timestamps else 0.0
        for name, rule in TEMPORAL_GESTURE_RULES.items():
            if name in seen:
                continue
            check = rule.get("check")
            if not callable(check):
                continue
            try:
                if check(landmarks_list, timestamps):
                    seen[name] = {"gesture": name, "timestamp": mid_t, "confidence": self.min_confidence}
            except Exception:
                continue
        return list(seen.values())
