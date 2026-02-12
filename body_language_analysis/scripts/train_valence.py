#!/usr/bin/env python3
"""
Train a small classifier for valence (positive/neutral/negative) from human corrections.
Usage (from repo root):
  python -m body_language_analysis.scripts.train_valence [path_to_corrections.json]
If no path given, uses server/data/body_language_corrections.json.
Saves model to body_language_analysis/models/valence_model.pkl.
"""
import argparse
import json
import os
import sys

# Repo root (parent of body_language_analysis)
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.dirname(os.path.dirname(_SCRIPT_DIR))

FEATURE_NAMES = [
    "shoulder_angle_deg",
    "head_tilt_deg",
    "torso_expansion",
    "velocity_nose_avg",
    "gait_stability",
    "intensity",
    "confidence_score",
    "gesture_fist_pump",
    "gesture_head_down",
    "gesture_racket_drop",
    "gesture_shoulder_slump",
    "gesture_hands_on_hips",
    "gesture_head_shake",
]


def load_corrections(path: str):
    """Load corrections list from JSON file (array or { corrections: [] })."""
    with open(path) as f:
        data = json.load(f)
    if isinstance(data, list):
        return data
    return data.get("corrections", [])


def build_X_y(corrections):
    """Build feature matrix X and label vector y. Skip rows without features."""
    X_rows = []
    y_list = []
    for r in corrections:
        feat = r.get("features")
        if not feat or not isinstance(feat, dict):
            continue
        label = r.get("corrected_valence")
        if label not in ("positive", "neutral", "negative"):
            continue
        row = [float(feat.get(name, 0)) for name in FEATURE_NAMES]
        X_rows.append(row)
        y_list.append(label)
    return X_rows, y_list


def main():
    parser = argparse.ArgumentParser(description="Train valence classifier from corrections")
    parser.add_argument(
        "input",
        nargs="?",
        default=os.path.join(_REPO_ROOT, "server", "data", "body_language_corrections.json"),
        help="Path to body_language_corrections.json",
    )
    parser.add_argument(
        "--output",
        "-o",
        default=os.path.join(_SCRIPT_DIR, "..", "models", "valence_model.pkl"),
        help="Output path for model pickle",
    )
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print(f"Input file not found: {args.input}", file=sys.stderr)
        print("Run the app, correct some segments, then run this script.", file=sys.stderr)
        sys.exit(1)

    corrections = load_corrections(args.input)
    X_rows, y_list = build_X_y(corrections)

    if len(X_rows) < 10:
        print(f"Only {len(X_rows)} correction(s) with features. Need at least 10 to train.", file=sys.stderr)
        print("Correct more segments in the app and try again.", file=sys.stderr)
        sys.exit(1)

    try:
        import numpy as np
        from sklearn.linear_model import LogisticRegression
        from sklearn.preprocessing import StandardScaler
        from sklearn.model_selection import cross_val_score
    except ImportError:
        print("Install scikit-learn: pip install scikit-learn", file=sys.stderr)
        sys.exit(1)

    X = np.array(X_rows)
    y = np.array(y_list)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = LogisticRegression(max_iter=500, C=0.5, class_weight="balanced", random_state=42)
    scores = cross_val_score(clf, X_scaled, y, cv=min(5, len(X) // 2), scoring="accuracy")
    clf.fit(X_scaled, y)

    print(f"Training samples: {len(X)}")
    print(f"Cross-validation accuracy: {scores.mean():.2%} (+/- {scores.std() * 2:.2%})")

    out_dir = os.path.dirname(args.output)
    os.makedirs(out_dir, exist_ok=True)
    import pickle
    with open(args.output, "wb") as f:
        pickle.dump(
            {"model": clf, "scaler": scaler, "feature_names": FEATURE_NAMES},
            f,
        )
    print(f"Model saved to {os.path.abspath(args.output)}")
    print("The pipeline will use this model for valence when present.")


if __name__ == "__main__":
    main()
