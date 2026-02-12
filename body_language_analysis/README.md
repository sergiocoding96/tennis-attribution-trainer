# Body Language Analysis Pipeline

Measurement-first body language and emotion analysis for tennis video. Physical signals (pose, posture, motion, gestures) are measured first; emotion and confidence are inferred from rules; optional LLM is used only for coach-style explanation text.

**Full documentation:** [BODY_LANGUAGE_FEATURE.md](./BODY_LANGUAGE_FEATURE.md) — rules, cases, inputs, trained model, human-in-the-loop, and config reference.

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

- **Video** → frame sampling → **Pose** (MediaPipe) → **Posture** + **Motion** → **Temporal** windows (3–5 s) → **Gestures** → **Emotion** (valence, intensity, label) → **Confidence** → **Temporal smoothing** (valence majority vote) → optional **Explanation** (LLM from metrics only).

## Enhancements

- **Config-driven emotions**: `config/emotion_rules.yaml` defines gesture→emotion and valence+intensity→emotion; edit without code changes.
- **Gait stability**: Each window includes `motion_metrics.gait_stability` (0–1); higher = more stable movement.
- **More gestures**: Frame-level — fist_pump, racket_drop, head_down, shoulder_slump, hands_on_hips. Temporal — head_shake. **racket_drop** requires arms low plus negative posture (shoulder slump or head down) to reduce false positives.
- **Gesture persistence**: A gesture is reported for a window only if it appears in ≥`min_frames_ratio` of frames (default 30%) or in ≥`min_consecutive_frames` (default 6) in a row; see `config/thresholds.yaml` under `gestures`.
- **Landmark smoothing**: Optional temporal smoothing (`smooth_landmarks_frames`, default 3) reduces jitter before gesture checks.
- **Temporal smoothing**: Valence is smoothed with a 3-window majority vote before final emotion label to reduce jitter.
- **UI**: Summary line and a mini timeline (one segment per window) in the body language results view.

## Accuracy tuning (`config/thresholds.yaml`)

- **Pose**: Raise `min_detection_confidence` / `min_tracking_confidence` (e.g. 0.6) to use only higher-quality poses.
- **Reaction vs stroke**: `reaction.motion_threshold_for_reaction` — when mean nose velocity in a window is **above** this value, the window is treated as high motion (stroke); gesture valences are ignored and only posture trend + intensity set valence. Lower threshold = more windows treated as “reaction”.
- **Gestures**:
  - `min_frames_ratio` (0.25–0.4): higher = gesture must appear in more of the window.
  - `min_consecutive_frames` (5–10): higher = require longer sustained gesture.
  - `min_pose_confidence_for_gestures`: frames with pose confidence below this are skipped when counting gestures.
  - `fist_pump_require_motion`: if true, fist_pump also requires upward wrist motion in the window (reduces stroke false positives).
  - `use_fist_pump_both_wrists`: if true, fist_pump requires **both** wrists above shoulders.
- **Scale-invariant rules**: Head-down, shoulder-slump, and hands-on-hips offsets are scaled by body size (shoulder width) so the same rules work across camera distance.

## Human-in-the-loop and trained valence model

1. **Correct in the app**  
   In the UI, correct any segment’s valence and emotion. Each correction is sent to `POST /api/body-language/corrections` and stored in `server/data/body_language_corrections.json` **with a `features` object** (posture, motion, intensity, gestures, etc.) so it can be used for training.

2. **Train a valence model**  
   After you have **at least 10 corrections with features** (correct more segments in the app), from the **repo root** run:
   ```bash
   pip install scikit-learn
   python -m body_language_analysis.scripts.train_valence
   ```
   Optional: pass the path to the corrections file as the first argument. The script writes `body_language_analysis/models/valence_model.pkl`.

3. **Pipeline uses the model**  
   If `body_language_analysis/models/valence_model.pkl` exists, the pipeline uses it to predict valence for each window instead of the rule-based classifier. Re-run analysis on new videos to see the effect. With no model file, behaviour is unchanged (rule-based only).

4. **Export corrections**  
   `GET /api/body-language/corrections/export?limit=1000` returns all stored corrections (with features) as JSON for inspection or custom training.
