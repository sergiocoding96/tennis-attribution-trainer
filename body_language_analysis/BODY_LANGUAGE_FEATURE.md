# Body Language Analysis — Full Documentation

This document describes the body language analysis feature: inputs, rules, cases, the trained model, and human-in-the-loop correction.

---

## 1. Overview

The feature analyzes **tennis video** and outputs **per-segment** labels:

- **Valence:** positive / neutral / negative  
- **Emotion:** e.g. joy, frustration, excitement, calm, defeat  
- **Metrics:** posture, motion, gestures, intensity, confidence  

The design is **measurement-first**: pose and motion are computed from video; valence and emotion come from **rules** (and optionally a **trained model** for valence). An optional LLM adds coach-style text only at the end.

---

## 2. Inputs

### 2.1 Primary input: video

- **Formats:** Typically MP4, MOV, AVI (whatever the server accepts for `/api/body-language/analyze`).
- **Processing:** Frames are sampled (e.g. 10 fps, max 1500 frames). The pipeline may crop to one half of the frame (left/right or top/bottom) to focus on one player (the one MediaPipe detects as most prominent).
- **Pose:** MediaPipe Pose runs on each frame; output is normalized landmarks (e.g. nose, shoulders, wrists, hips, etc.) with visibility per point.

### 2.2 Config inputs

| Source | Purpose |
|--------|--------|
| `body_language_analysis/config/thresholds.yaml` | Video FPS, window size, pose confidence, gesture persistence, reaction threshold, etc. |
| `body_language_analysis/config/emotion_rules.yaml` | Mapping from gestures and valence+intensity to emotion labels. |

See **Section 8** for the full config reference.

### 2.3 Optional: trained model file

- **Path:** `body_language_analysis/models/valence_model.pkl`
- **When present:** The pipeline uses it to predict **valence** per window instead of the rule-based valence. If the file is missing or invalid, rule-based valence is used.

---

## 3. Pipeline flow (high level)

```
Video
  → Frame sampling (FFmpeg or OpenCV)
  → Optional crop to player region (left/right/top/bottom)
  → Pose (MediaPipe) per frame → landmarks + confidence
  → Per frame: posture metrics, velocity (e.g. nose)
  → Sliding windows (e.g. 4 s length, 2 s stride)
  → Per window:
       posture trend (rising/falling/stable)
       gestures (with persistence + optional motion check for fist_pump)
       intensity (1–10)
       reaction vs stroke flag (from motion threshold)
       valence ← rule-based OR trained model (if .pkl exists)
       emotion ← rules (valence + intensity + gestures)
       confidence score
       optional LLM explanation
  → Temporal smoothing (valence majority vote over 3 windows)
  → JSON output (list of windows with all fields)
```

---

## 4. Rules

### 4.1 Gesture rules

**File:** `body_language_analysis/gestures/gesture_rules.py`

Gestures are detected from **pose landmarks** (and for head_shake, from the **sequence** of nose positions over the window). Each gesture has a **valence** (positive / negative / neutral) used later.

| Gesture | Condition (simplified) | Valence |
|---------|------------------------|--------|
| **fist_pump** | At least one wrist above that shoulder (or both, if `use_fist_pump_both_wrists`) | positive |
| **fist_pump_both** | Both wrists above shoulders (stricter option) | positive |
| **racket_drop** | Arms low (wrists at/below hip level) **and** (shoulder_slump **or** head_down) | negative |
| **head_down** | Nose below shoulder midline (offset scaled by body size) | negative |
| **shoulder_slump** | Mid-shoulder Y below mid-hip Y (offset scaled by body size) | negative |
| **hands_on_hips** | Wrist(s) near same-side hip in x and y (thresholds scaled) | neutral |
| **head_shake** (temporal) | Nose x variance above threshold and ≥2 sign changes in frame-to-frame x differences | negative |

- **Scale-invariant:** Head-down, shoulder-slump, and hands-on-hips use body scale (shoulder width) so the same logic works across camera distance.
- **Persistence:** A gesture is reported for a window only if it appears in **≥ min_frames_ratio** of frames or in **≥ min_consecutive_frames** in a row (`config/thresholds.yaml`).
- **Fist pump:** Optionally requires **upward wrist motion** in the window and/or **both wrists** above shoulders to reduce false positives from strokes.

### 4.2 Valence rules (rule-based path)

**File:** `body_language_analysis/emotion/valence_classifier.py`

**Inputs:** `posture_trend` (rising/falling/stable), list of `gesture_valences`, `intensity` (1–10), `is_reaction_window` (bool).

**Logic:**

- If **not** reaction window (high motion / “stroke”):  
  Gesture valences are **ignored**. Valence is from posture trend + intensity only (e.g. rising + intensity ≥ 3 → positive; falling → negative; else neutral if intensity &lt; 4).

- If **reaction** window:  
  - More positive gesture valences than negative and intensity ≥ 4 → **positive**.  
  - More negative than positive and intensity ≥ 4 → **negative**.  
  - Posture trend **rising** and intensity ≥ 3 → **positive**.  
  - Posture trend **falling** and intensity ≥ 3 → **negative**.  
  - Intensity ≥ 6 → positive if positive count ≥ negative, else negative.  
  - Otherwise → **neutral**.

**Output:** One of `"positive"`, `"neutral"`, `"negative"`.

### 4.3 Emotion rules

**File:** `body_language_analysis/emotion/emotion_mapper.py`  
**Config:** `body_language_analysis/config/emotion_rules.yaml`

**Inputs:** `valence`, `intensity` (1–10), list of `gesture_names` for the window.

**Logic:**

1. **Gesture override:** If any detected gesture appears in `gesture_emotions` in the YAML, the **first** matching gesture’s emotion is returned (e.g. fist_pump → joy, head_down → frustration).
2. **Otherwise:** Use valence + intensity bucket:  
   Intensity is mapped to **high** (≥7), **medium** (≥4), or **low**.  
   Then `valence_intensity[valence][bucket]` gives the emotion (e.g. positive + high → excitement, negative + medium → frustration, neutral → neutral).

**Output:** A single emotion label (e.g. joy, frustration, excitement, calm, defeat, neutral).

---

## 5. Cases and special behavior

### 5.1 Reaction vs stroke (high motion)

- **Config:** `reaction.motion_threshold_for_reaction` in `thresholds.yaml`.
- **Computation:** For each window, mean nose velocity is compared to this threshold.
- **Case “stroke” (high motion):** `velocity_nose_avg > motion_threshold_for_reaction` → `is_reaction_window = False` → valence uses **only** posture trend and intensity; gesture valences are ignored to avoid misreading strokes as gestures.

### 5.2 Gesture persistence

- A frame-level gesture is counted for the window only if it appears in **≥ min_frames_ratio** of (valid) frames **or** in **≥ min_consecutive_frames** in a row.
- Frames with pose confidence below `min_pose_confidence_for_gestures` can be skipped when counting.

### 5.3 Fist pump strictness

- **fist_pump_require_motion:** If true, fist_pump is reported only if there is **upward wrist motion** in the window (e.g. wrist y drops over a short span).
- **use_fist_pump_both_wrists:** If true, the “fist_pump” rule used for counting requires **both** wrists above shoulders (fist_pump_both).

### 5.4 Temporal smoothing

- After all windows are computed, valence is **smoothed** with a 3-window majority vote (`smooth_valence_over_windows`). Emotion is then re-derived from the smoothed valence (and intensity and gestures). This reduces label jitter between adjacent windows.

### 5.5 Trained model override

- If `valence_model.pkl` exists and loads correctly, **valence** for each window is taken from the model’s prediction; the rule-based valence is **not** used for that step. Emotion and all other logic (intensity, gestures, emotion mapping) are unchanged.

---

## 6. Trained valence model

### 6.1 Role

- The model **only** predicts **valence** (positive / neutral / negative) per window.
- It does **not** replace gesture detection, posture, motion, intensity, or emotion mapping.

### 6.2 Input to the model (feature vector)

The model classifies on a **fixed 13-dimensional numeric vector** per window (same in training and inference):

| # | Feature | Description |
|---|---------|-------------|
| 1 | shoulder_angle_deg | From posture_metrics |
| 2 | head_tilt_deg | From posture_metrics |
| 3 | torso_expansion | From posture_metrics |
| 4 | velocity_nose_avg | From motion_metrics |
| 5 | gait_stability | From motion_metrics |
| 6 | intensity | 1–10 |
| 7 | confidence_score | 0–1 |
| 8 | gesture_fist_pump | 0 or 1 |
| 9 | gesture_head_down | 0 or 1 |
| 10 | gesture_racket_drop | 0 or 1 |
| 11 | gesture_shoulder_slump | 0 or 1 |
| 12 | gesture_hands_on_hips | 0 or 1 |
| 13 | gesture_head_shake | 0 or 1 |

So the model **does not** see video or raw pose; it only sees these 13 numbers (after standardization in training/inference).

### 6.3 Output of the model

- **One label per window:** `"positive"`, `"neutral"`, or `"negative"`.
- That value is used as the window’s valence; emotion is then computed from it (plus intensity and gestures) via the existing emotion rules.

### 6.4 Training

- **Data:** Corrections stored in `server/data/body_language_corrections.json`. Each record must have a **features** object (the same 13 numbers) and **corrected_valence**.
- **Script:** `body_language_analysis/scripts/train_valence.py`  
  - Reads the corrections file (default: `server/data/body_language_corrections.json`).  
  - Builds feature matrix **X** and label vector **y** from records that have both `features` and `corrected_valence`.  
  - Fits **StandardScaler** and **LogisticRegression** (multinomial, balanced classes, regularization).  
  - Saves to `body_language_analysis/models/valence_model.pkl`: `model`, `scaler`, `feature_names`.
- **Minimum data:** At least 10 corrections with features.

### 6.5 When the model is used

- **At runtime:** The pipeline builds the same 13-D vector from the current window dict, then:
  - If `valence_model.pkl` exists and loads: scale the vector with the saved scaler, run the logistic regression, use the predicted class as valence.
  - Otherwise: use the rule-based valence (no change to existing behavior).

---

## 7. Human-in-the-loop (corrections)

### 7.1 What is stored

- **Endpoint:** `POST /api/body-language/corrections` (optional auth).
- **Body:** `window_index`, `timestamp_start`, `timestamp_end`, `original_valence`, `original_emotion`, `corrected_valence`, `corrected_emotion`, and **features** (the 13-D object built from that window).
- **Storage:** `server/data/body_language_corrections.json`. Each record includes the above plus `user_id` (if authenticated) and `created_at`.

### 7.2 How corrections are used

- **Display:** In the UI, corrected segments show the user’s valence/emotion and a “(corrected)” indicator; summary and timeline use corrected valence when present.
- **Training:** The same file (with **features** and **corrected_valence**) is the dataset for `train_valence.py`. So corrections **improve the next classification** only after you run the training script and the pipeline uses the new `.pkl`.

### 7.3 Export

- **Endpoint:** `GET /api/body-language/corrections/export?limit=1000`  
- Returns the list of correction records (including features) as JSON for inspection or custom training.

---

## 8. Config reference

### 8.1 thresholds.yaml

| Section | Key | Meaning (short) |
|---------|-----|------------------|
| video | target_fps | Frame sampling rate (e.g. 10) |
| video | max_frames | Cap on number of frames |
| video | window_seconds | Window length in seconds (e.g. 4) |
| video | stride_seconds | Stride between windows (e.g. 2) |
| pose | min_detection_confidence | MediaPipe detection threshold (e.g. 0.55) |
| pose | min_tracking_confidence | MediaPipe tracking threshold |
| reaction | motion_threshold_for_reaction | Above = stroke (gestures ignored for valence) |
| gestures | min_frames_ratio | Gesture must appear in this fraction of frames (e.g. 0.3) |
| gestures | min_consecutive_frames | Or this many consecutive frames (e.g. 6) |
| gestures | smooth_landmarks_frames | Temporal smoothing of landmarks (e.g. 3; 0 = off) |
| gestures | min_pose_confidence_for_gestures | Skip frames below this when counting gestures |
| gestures | fist_pump_require_motion | Require upward wrist motion for fist_pump |
| gestures | use_fist_pump_both_wrists | Require both wrists above shoulders for fist_pump |
| emotion | trend_threshold | Threshold for rising/falling posture trend |

### 8.2 emotion_rules.yaml

- **gesture_emotions:** Map gesture name → emotion label (e.g. fist_pump → joy). First matching gesture wins.
- **valence_intensity:** Nested map: valence → intensity bucket (high/medium/low) → emotion (e.g. positive → high → excitement).
- **intensity_thresholds:** Boundaries for high (≥7) and medium (≥4).

---

## 9. Output schema (per window)

Each window in the pipeline output (and in the API response) contains at least:

| Field | Type | Description |
|-------|------|-------------|
| timestamp_start | number | Start time (seconds) |
| timestamp_end | number | End time (seconds) |
| posture_metrics | object | shoulder_angle_deg, head_tilt_deg, torso_expansion |
| motion_metrics | object | velocity_nose_avg, gait_stability |
| detected_gestures | array | List of { gesture, timestamp, confidence } |
| valence | string | "positive" \| "neutral" \| "negative" |
| intensity | number | 1–10 |
| emotion | string | e.g. joy, frustration, excitement |
| confidence_score | number | 0–1 |
| explanation_text | string (optional) | Coach-style sentence from LLM if enabled |

---

## 10. File and code reference

| What | Where |
|------|--------|
| Pipeline entry | `body_language_analysis/run.py` |
| Gesture definitions | `body_language_analysis/gestures/gesture_rules.py` |
| Gesture detection + persistence | `body_language_analysis/gestures/gesture_detector.py` |
| Valence (rules) | `body_language_analysis/emotion/valence_classifier.py` |
| Valence (model) | `body_language_analysis/emotion/valence_model.py` |
| Emotion mapping | `body_language_analysis/emotion/emotion_mapper.py` |
| Training script | `body_language_analysis/scripts/train_valence.py` |
| Saved model | `body_language_analysis/models/valence_model.pkl` |
| Thresholds | `body_language_analysis/config/thresholds.yaml` |
| Emotion rules | `body_language_analysis/config/emotion_rules.yaml` |
| Corrections storage | `server/data/body_language_corrections.json` |
| Corrections API | `server.js` (POST /api/body-language/corrections, GET .../export) |
| UI (video + corrections) | `client/src/components/BodyLanguageDisplay.jsx` |

---

*This document describes the body language analysis feature as implemented in the Tennis Attribution Trainer codebase.*
