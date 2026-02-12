"""Load video from file and provide frame access."""
import cv2
from pathlib import Path
from typing import Optional, Tuple


class VideoLoader:
    """Loads video from path and provides basic metadata and frame iteration."""

    def __init__(self, path: str) -> None:
        self.path = Path(path)
        if not self.path.exists():
            raise FileNotFoundError(f"Video not found: {path}")
        self._cap: Optional[cv2.VideoCapture] = None

    def open(self) -> "VideoLoader":
        """Open the video file. Prefer FFmpeg backend for reliable frame count and reading."""
        self._cap = cv2.VideoCapture(str(self.path), cv2.CAP_FFMPEG)
        if not self._cap.isOpened():
            self._cap = cv2.VideoCapture(str(self.path))
        if not self._cap.isOpened():
            raise IOError(f"Could not open video: {self.path}")
        return self

    def close(self) -> None:
        """Release the video capture."""
        if self._cap is not None:
            self._cap.release()
            self._cap = None

    def __enter__(self) -> "VideoLoader":
        return self.open()

    def __exit__(self, *args) -> None:
        self.close()

    def _get_prop(self, prop_id: int, default: float) -> float:
        """Get OpenCV capture property; use default if invalid or missing."""
        if self._cap is None:
            raise RuntimeError("Video not opened")
        try:
            v = self._cap.get(prop_id)
            if v is None or (isinstance(v, (int, float)) and v <= 0 and prop_id != cv2.CAP_PROP_FPS):
                return default
            return float(v)
        except Exception:
            return default

    @property
    def fps(self) -> float:
        """Frames per second."""
        v = self._get_prop(cv2.CAP_PROP_FPS, 30.0)
        return v if v > 0 else 30.0

    @property
    def width(self) -> int:
        """Frame width in pixels."""
        return int(self._get_prop(cv2.CAP_PROP_FRAME_WIDTH, 640))

    @property
    def height(self) -> int:
        """Frame height in pixels."""
        return int(self._get_prop(cv2.CAP_PROP_FRAME_HEIGHT, 480))

    @property
    def frame_count(self) -> int:
        """Total number of frames."""
        return int(self._get_prop(cv2.CAP_PROP_FRAME_COUNT, 0))

    @property
    def duration_seconds(self) -> float:
        """Duration in seconds."""
        return self.frame_count / self.fps if self.frame_count and self.fps else 0.0

    def read_frame(self) -> Tuple[bool, Optional["cv2.Mat"]]:
        """Read next frame. Returns (success, frame). Frame is BGR numpy array or None."""
        if self._cap is None:
            raise RuntimeError("Video not opened")
        return self._cap.read()

    def seek_to_frame(self, frame_index: int) -> bool:
        """Seek to frame by index. Returns True on success."""
        if self._cap is None:
            raise RuntimeError("Video not opened")
        return self._cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)
