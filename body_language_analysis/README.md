# Body Language Analysis Pipeline

Measurement-first body language and emotion analysis for tennis video. Physical signals (pose, posture, motion, gestures) are measured first; emotion and confidence are inferred from rules; optional LLM is used only for coach-style explanation text.

## Setup

```bash
cd body_language_analysis
pip install -r requirements.txt
```

Optional (for coach-style explanations): `pip install google-generativeai` and set `GEMINI_API_KEY` or `GOOGLE_API_KEY`.

## Run

From the **repository root**:

```bash
python -m body_language_analysis.run path/to/video.mp4
```

Output: JSON to stdout (windows with timestamp_start, timestamp_end, posture_metrics, motion_metrics, detected_gestures, valence, intensity, emotion, confidence_score, optional explanation_text).

Skip LLM explanation:

```bash
python -m body_language_analysis.run path/to/video.mp4 --no-explanation
```

## Environment

- `GEMINI_API_KEY` or `GOOGLE_API_KEY`: optional; used only for explanation text (Phase 5).

## Architecture

- **Video** → frame sampling → **Pose** (MediaPipe) → **Posture** + **Motion** → **Temporal** windows (3–5 s) → **Gestures** → **Emotion** (valence, intensity, label) → **Confidence** → optional **Explanation** (LLM from metrics only).
