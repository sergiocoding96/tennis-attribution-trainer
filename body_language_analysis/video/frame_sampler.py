"""Sample frames from video at a given FPS or step."""
from typing import Generator, List, Optional, Tuple
import cv2
from .video_loader import VideoLoader


class FrameSampler:
    """Samples frames from a video at target FPS or fixed step."""

    def __init__(
        self,
        video: VideoLoader,
        target_fps: Optional[float] = None,
        step_frames: Optional[int] = None,
        max_frames: Optional[int] = None,
    ) -> None:
        """
        Args:
            video: Opened VideoLoader.
            target_fps: If set, sample at this FPS (e.g. 10 for 10 frames per second).
            step_frames: If set, sample every N frames. Ignored if target_fps is set.
            max_frames: Cap total frames sampled (e.g. for long videos).
        """
        self.video = video
        self.target_fps = target_fps
        self.step_frames = step_frames or 1
        self.max_frames = max_frames

    def _sample_indices(self) -> List[int]:
        """Compute frame indices to sample."""
        fps = self.video.fps
        total = self.video.frame_count
        if total <= 0:
            return []

        if self.target_fps is not None and self.target_fps > 0:
            step = max(1, int(round(fps / self.target_fps)))
        else:
            step = max(1, self.step_frames)

        indices = list(range(0, total, step))
        if self.max_frames is not None and len(indices) > self.max_frames:
            # Uniformly subsample to max_frames
            step = len(indices) / self.max_frames
            indices = [indices[int(i * step)] for i in range(self.max_frames)]
        return indices

    def _frames_streaming(
        self,
    ) -> Generator[Tuple[int, float, "cv2.Mat"], None, None]:
        """Yield (frame_index, timestamp, frame) by reading sequentially. Use when frame_count is wrong/missing."""
        fps = self.video.fps
        if self.target_fps is not None and self.target_fps > 0:
            step = max(1, int(round(fps / self.target_fps)))
        else:
            step = max(1, self.step_frames)
        if not self.video.seek_to_frame(0):
            return
        n = 0
        yielded = 0
        consecutive_failures = 0
        max_failures_before_stop = 30  # stop only after many consecutive failed reads
        while True:
            ok, frame = self.video.read_frame()
            if not ok or frame is None:
                consecutive_failures += 1
                if consecutive_failures >= max_failures_before_stop:
                    break
                # Try seeking forward (next keyframe) to recover from codec glitches
                recovered = False
                for offset in range(1, 6):
                    if self.video.seek_to_frame(n + offset):
                        ok2, frame2 = self.video.read_frame()
                        if ok2 and frame2 is not None:
                            n = n + offset
                            frame = frame2
                            consecutive_failures = 0
                            recovered = True
                            break
                if not recovered:
                    continue
            else:
                consecutive_failures = 0
            if n % step == 0 and frame is not None:
                t = n / fps
                yield n, t, frame
                yielded += 1
                if self.max_frames is not None and yielded >= self.max_frames:
                    break
            n += 1

    def frames_with_timestamps(
        self,
    ) -> Generator[Tuple[int, float, "cv2.Mat"], None, None]:
        """Yield (frame_index, timestamp_seconds, frame) for each sampled frame.
        Uses sequential read so the full video is processed even when OpenCV
        reports wrong or missing frame count (common with some codecs/containers).
        """
        yield from self._frames_streaming()

    def all_frames_list(self) -> List[Tuple[int, float, "cv2.Mat"]]:
        """Return list of (frame_index, timestamp_seconds, frame) for all sampled frames."""
        return list(self.frames_with_timestamps())
