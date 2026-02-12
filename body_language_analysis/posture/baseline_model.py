"""Neutral baseline posture for normalization."""
from typing import Dict, List


class BaselineModel:
    """Tracks neutral (baseline) posture over a short window for comparison."""

    def __init__(self, window_size: int = 30) -> None:
        self.window_size = window_size
        self._shoulder_angles: List[float] = []
        self._head_tilts: List[float] = []
        self._torso_expansions: List[float] = []

    def update(self, posture: Dict[str, float]) -> None:
        """Add one frame's posture metrics."""
        self._shoulder_angles.append(posture.get("shoulder_angle_deg", 0.0))
        self._head_tilts.append(posture.get("head_tilt_deg", 0.0))
        self._torso_expansions.append(posture.get("torso_expansion", 0.0))
        if len(self._shoulder_angles) > self.window_size:
            self._shoulder_angles.pop(0)
            self._head_tilts.pop(0)
            self._torso_expansions.pop(0)

    @property
    def neutral_shoulder_angle(self) -> float:
        """Baseline shoulder angle (degrees)."""
        if not self._shoulder_angles:
            return 0.0
        return sum(self._shoulder_angles) / len(self._shoulder_angles)

    @property
    def neutral_head_tilt(self) -> float:
        """Baseline head tilt (degrees)."""
        if not self._head_tilts:
            return 0.0
        return sum(self._head_tilts) / len(self._head_tilts)

    @property
    def neutral_torso_expansion(self) -> float:
        """Baseline torso expansion."""
        if not self._torso_expansions:
            return 0.5
        return sum(self._torso_expansions) / len(self._torso_expansions)
