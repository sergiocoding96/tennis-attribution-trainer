"""Prompt templates for coach-style explanation from metrics only."""
from typing import Any, Dict


def format_window_summary_for_llm(window: Dict[str, Any]) -> str:
    """
    Format a single window's metrics for LLM (no raw video). AI only sees numbers and labels.
    """
    lines = [
        f"Time: {window.get('timestamp_start', 0):.1f}s - {window.get('timestamp_end', 0):.1f}s",
        f"Valence: {window.get('valence', 'neutral')}",
        f"Intensity: {window.get('intensity', 0):.1f}/10",
        f"Emotion: {window.get('emotion', 'neutral')}",
        f"Confidence: {window.get('confidence_score', 0):.2f}",
    ]
    posture = window.get("posture_metrics", {})
    if posture:
        lines.append(
            f"Posture: shoulder_angle={posture.get('shoulder_angle_deg', 0):.1f} deg, "
            f"head_tilt={posture.get('head_tilt_deg', 0):.1f} deg, "
            f"torso_expansion={posture.get('torso_expansion', 0):.2f}"
        )
    gestures = window.get("detected_gestures", [])
    if gestures:
        names = [g.get("gesture", g) if isinstance(g, dict) else g for g in gestures]
        lines.append(f"Gestures: {', '.join(names)}")
    return "\n".join(lines)


COACH_SYSTEM_PROMPT = """You are a tennis performance coach. Given only numerical body language metrics and timestamps (no video), write one short, encouraging sentence of feedback. Reference posture, gestures, or emotion label. Do not invent details not present in the metrics. Keep it under 2 sentences."""
