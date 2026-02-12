#!/usr/bin/env python3
"""
Body language analysis pipeline entrypoint.
Usage: python -m body_language_analysis.run <video_path> [--no-explanation]
Output: JSON to stdout (PipelineOutput).
"""
import argparse
import glob
import json
import os
import shutil
import subprocess
import sys
import tempfile
import traceback

import cv2

# Add parent so "body_language_analysis" is importable when run as script
_TOP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _TOP not in sys.path:
    sys.path.insert(0, _TOP)

from body_language_analysis.video import VideoLoader, FrameSampler
from body_language_analysis.pose import PoseEstimator, normalize_landmarks
from body_language_analysis.posture import compute_posture_metrics, BaselineModel
from body_language_analysis.motion import compute_velocity, gait_stability
from body_language_analysis.temporal import sliding_windows, trend_over_window
from body_language_analysis.gestures import GestureDetector
from body_language_analysis.gestures.gesture_rules import GESTURE_RULES
from body_language_analysis.emotion import classify_valence, score_intensity, map_to_emotion_label
from body_language_analysis.confidence import window_confidence_score
from body_language_analysis.explanation import generate_explanation
from body_language_analysis.output import PipelineOutput, WindowResult, export_json


VALID_PLAYER_REGIONS = ("left", "right", "top", "bottom")


def crop_frame_to_region(frame, region: str):
    """Crop frame to one half so only one player is analyzed. frame is numpy (h, w, c)."""
    h, w = frame.shape[:2]
    if region == "left":
        return frame[:, 0 : w // 2]
    if region == "right":
        return frame[:, w // 2 :]
    if region == "top":
        return frame[0 : h // 2, :]
    if region == "bottom":
        return frame[h // 2 :, :]
    return frame


def load_config():
    """Load config from YAML if available."""
    try:
        import yaml
        config_path = os.path.join(os.path.dirname(__file__), "config", "thresholds.yaml")
        if os.path.isfile(config_path):
            with open(config_path) as f:
                return yaml.safe_load(f) or {}
    except Exception:
        pass
    return {
        "video": {"target_fps": 10, "max_frames": 1500, "window_seconds": 4.0, "stride_seconds": 2.0},
        "pose": {"min_detection_confidence": 0.5, "min_tracking_confidence": 0.5},
    }


def extract_frames_ffmpeg(video_path, target_fps=10, max_frames=1500, timeout_sec=600):
    """
    Extract frames using FFmpeg so we get full video duration (avoids OpenCV cutoff).
    Returns (frames_list, fps, duration_sec) or (None, None, None) on failure.
    """
    tempdir = tempfile.mkdtemp(prefix="body_lang_frames_")
    try:
        duration_sec = None
        try:
            r = subprocess.run(
                [
                    "ffprobe", "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1", video_path,
                ],
                capture_output=True,
                text=True,
                timeout=10,
            )
            if r.returncode == 0 and r.stdout.strip():
                duration_sec = float(r.stdout.strip())
        except (FileNotFoundError, subprocess.TimeoutExpired, ValueError):
            pass

        out_pattern = os.path.join(tempdir, "frame_%04d.png")
        r = subprocess.run(
            ["ffmpeg", "-y", "-i", video_path, "-vf", f"fps={target_fps}", "-vsync", "vfr", out_pattern],
            capture_output=True,
            timeout=timeout_sec,
        )
        if r.returncode != 0:
            return None, None, None
        frames = sorted(glob.glob(os.path.join(tempdir, "frame_*.png")))
        if not frames:
            return None, None, None
        if len(frames) > max_frames:
            step = len(frames) / max_frames
            indices = [int(i * step) for i in range(max_frames)]
            frames = [frames[i] for i in indices]
        out = []
        for i, fpath in enumerate(frames):
            img = cv2.imread(fpath)
            if img is not None:
                t = i / target_fps
                out.append((i, t, img))
        if not out:
            return None, None, None
        fps = float(target_fps)
        if duration_sec is None:
            duration_sec = len(out) / fps
        return out, fps, duration_sec
    except (FileNotFoundError, subprocess.TimeoutExpired, Exception):
        return None, None, None
    finally:
        try:
            for f in glob.glob(os.path.join(tempdir, "*.png")):
                os.remove(f)
            os.rmdir(tempdir)
        except OSError:
            try:
                shutil.rmtree(tempdir, ignore_errors=True)
            except Exception:
                pass


def run_pipeline(
    video_path: str,
    include_explanation: bool = True,
    player_region=None,
) -> PipelineOutput:
    config = load_config()
    video_cfg = config.get("video", {})
    pose_cfg = config.get("pose", {})
    target_fps = video_cfg.get("target_fps", 10)
    max_frames = video_cfg.get("max_frames", 1500)

    # Prefer FFmpeg extraction so we get full video duration (avoids OpenCV cutoff)
    frames_with_ts, fps, duration = extract_frames_ffmpeg(video_path, target_fps, max_frames)
    if frames_with_ts is None or len(frames_with_ts) == 0:
        with VideoLoader(video_path) as video:
            fps = video.fps
            duration = video.duration_seconds
            sampler = FrameSampler(
                video,
                target_fps=target_fps,
                max_frames=max_frames,
            )
            frames_with_ts = list(sampler.frames_with_timestamps())
            if not frames_with_ts:
                return PipelineOutput(
                    windows=[],
                    video_fps=fps,
                    video_duration_seconds=duration,
                    metadata={"error": "no_frames", "path": video_path},
                )
            if duration <= 0:
                duration = len(frames_with_ts) / fps if fps > 0 else 0
    else:
        # FFmpeg path: duration from ffprobe or from frame count
        if duration is None or duration <= 0:
            duration = len(frames_with_ts) / fps if (fps and frames_with_ts) else 0

    pose_estimator = PoseEstimator(
        min_detection_confidence=pose_cfg.get("min_detection_confidence", 0.5),
        min_tracking_confidence=pose_cfg.get("min_tracking_confidence", 0.5),
    )
    gesture_detector = GestureDetector()
    baseline = BaselineModel(window_size=30)

    # Auto-detect closer player from first frame if no region was specified
    if player_region is None or player_region not in VALID_PLAYER_REGIONS:
        idx0, t0, frame0 = frames_with_ts[0]
        lm0, _ = pose_estimator.process_frame(frame0)
        if lm0:
            # Center of detected person (MediaPipe picks the most prominent = closer)
            xs = []
            for k in ("nose", "left_shoulder", "right_shoulder"):
                if lm0.get(k) and lm0[k].get("visibility", 0) >= 0.3:
                    xs.append(lm0[k]["x"])
            if xs:
                center_x = sum(xs) / len(xs)
                # Crop to the half that contains this person (left/right)
                player_region = "left" if center_x < 0.5 else "right"
            else:
                player_region = None
        else:
            player_region = None

    # Per-frame data
    frame_indices = [x[0] for x in frames_with_ts]
    timestamps = [x[1] for x in frames_with_ts]
    landmarks_per_frame = []
    pose_confidence_per_frame = []
    posture_per_frame = []
    velocity_per_frame = []

    for idx, t, frame in frames_with_ts:
        if player_region and player_region in VALID_PLAYER_REGIONS:
            frame = crop_frame_to_region(frame, player_region)
        lm, pose_conf = pose_estimator.process_frame(frame)
        landmarks_per_frame.append(lm)
        pose_confidence_per_frame.append(pose_conf)
        if lm:
            posture = compute_posture_metrics(lm)
            posture_per_frame.append(posture)
            baseline.update(posture)
        else:
            posture_per_frame.append({})

        # Velocity (need history)
        if len(landmarks_per_frame) >= 2 and timestamps:
            dt = timestamps[-1] - timestamps[-2] if len(timestamps) >= 2 else 1.0 / fps
            vel = compute_velocity(landmarks_per_frame, dt, "nose")
            velocity_per_frame.append(vel)
        else:
            velocity_per_frame.append(0.0)

    pose_estimator.close()

    # Sliding windows
    window_sec = video_cfg.get("window_seconds", 4.0)
    stride_sec = video_cfg.get("stride_seconds", 2.0)
    windows = sliding_windows(len(frames_with_ts), fps, window_seconds=window_sec, stride_seconds=stride_sec)

    results = []
    for start_idx, end_idx, t_start, t_end in windows:
        lm_slice = landmarks_per_frame[start_idx:end_idx]
        ts_slice = timestamps[start_idx:end_idx]
        posture_slice = [p for p in posture_per_frame[start_idx:end_idx] if p]
        vel_slice = velocity_per_frame[start_idx:end_idx]

        # Posture trend
        shoulder_angles = [p.get("shoulder_angle_deg", 0) for p in posture_slice]
        posture_trend = trend_over_window(shoulder_angles) if shoulder_angles else "stable"

        # Gestures
        gestures_in_window = gesture_detector.detect_window(lm_slice, ts_slice)
        gesture_valences = [GESTURE_RULES.get(g["gesture"], {}).get("valence", "neutral") for g in gestures_in_window]
        gesture_names = [g["gesture"] for g in gestures_in_window]

        # Intensity
        intensity = score_intensity(posture_slice, vel_slice, len(gestures_in_window))

        # Valence
        valence = classify_valence(posture_trend, gesture_valences, intensity)

        # Emotion label
        emotion = map_to_emotion_label(valence, intensity, gesture_names)

        # Confidence
        conf = window_confidence_score(lm_slice, ts_slice, pose_confidence_per_frame[start_idx:end_idx])

        # Posture/motion summary for window
        posture_avg = {}
        if posture_slice:
            for k in posture_slice[0]:
                posture_avg[k] = sum(p.get(k, 0) for p in posture_slice) / len(posture_slice)
        motion_avg = {
            "velocity_nose_avg": sum(vel_slice) / len(vel_slice) if vel_slice else 0,
        }

        # Optional explanation
        explanation_text = None
        window_dict = {
            "timestamp_start": t_start,
            "timestamp_end": t_end,
            "posture_metrics": posture_avg,
            "motion_metrics": motion_avg,
            "detected_gestures": gestures_in_window,
            "valence": valence,
            "intensity": round(min(10, max(1, intensity)), 1),
            "emotion": emotion,
            "confidence_score": round(conf, 4),
        }
        if include_explanation:
            explanation_text = generate_explanation(window_dict)

        results.append(
            WindowResult(
                timestamp_start=t_start,
                timestamp_end=t_end,
                posture_metrics=posture_avg,
                motion_metrics=motion_avg,
                detected_gestures=gestures_in_window,
                valence=valence,
                intensity=round(min(10, max(1, intensity)), 1),
                emotion=emotion,
                confidence_score=round(conf, 4),
                explanation_text=explanation_text,
            )
        )

    return PipelineOutput(
        windows=results,
        video_fps=fps,
        video_duration_seconds=duration,
        metadata={"path": video_path, "num_frames": len(frames_with_ts), "num_windows": len(results)},
    )


def main():
    parser = argparse.ArgumentParser(description="Body language analysis from tennis video")
    parser.add_argument("video_path", help="Path to video file (mp4, mov, avi)")
    parser.add_argument("--no-explanation", action="store_true", help="Skip LLM explanation")
    args = parser.parse_args()

    if not os.path.isfile(args.video_path):
        print(json.dumps({"error": "file_not_found", "path": args.video_path}), file=sys.stderr)
        sys.exit(1)

    try:
        output = run_pipeline(
            args.video_path,
            include_explanation=not args.no_explanation,
            player_region=None,  # auto-detect closer player from first frame
        )
        print(export_json(output))
    except Exception as e:
        tb = traceback.format_exc()
        err_msg = str(e)
        # Single JSON line so Node service can parse stderr
        print(json.dumps({
            "error": err_msg,
            "error_type": type(e).__name__,
            "path": args.video_path,
            "traceback": tb,
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
