"""Output schema for body language pipeline (JSON contract)."""
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class WindowResult:
    """Per 3-5 second window output."""
    timestamp_start: float
    timestamp_end: float
    posture_metrics: Dict[str, float]
    motion_metrics: Dict[str, float]
    detected_gestures: List[Dict[str, Any]]
    valence: str
    intensity: float
    emotion: str
    confidence_score: float
    explanation_text: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        d: Dict[str, Any] = {
            "timestamp_start": self.timestamp_start,
            "timestamp_end": self.timestamp_end,
            "posture_metrics": self.posture_metrics,
            "motion_metrics": self.motion_metrics,
            "detected_gestures": self.detected_gestures,
            "valence": self.valence,
            "intensity": self.intensity,
            "emotion": self.emotion,
            "confidence_score": self.confidence_score,
        }
        if self.explanation_text is not None:
            d["explanation_text"] = self.explanation_text
        return d


@dataclass
class PipelineOutput:
    """Full pipeline output."""
    windows: List[WindowResult]
    video_fps: float
    video_duration_seconds: float
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "windows": [w.to_dict() for w in self.windows],
            "video_fps": self.video_fps,
            "video_duration_seconds": self.video_duration_seconds,
            "metadata": self.metadata,
        }
