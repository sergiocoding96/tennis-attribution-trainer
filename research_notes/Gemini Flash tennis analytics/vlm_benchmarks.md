# VLM vs specialized CV benchmarks for sports and tennis video understanding

Method caveat: the arXiv search tool returned only unrelated newest papers, and arxiv.org was not fetchable from this session (DNS failure; PDF reading unsupported). All findings below come from WebSearch result summaries, not from reading the papers' tables. Numbers are therefore "as reported in search summaries" and should be checked against the primary papers before being quoted. Version differences between arXiv revisions are flagged where seen.

## 1. Benchmarks of Gemini/GPT/Claude/Qwen-VL on sports video (SPORTU, VidDiffBench, TennisTV, etc.)

### Takeaway
General VLMs are weak at fine-grained sports video tasks. On the only tennis-specific rally benchmark found (TennisTV), the best closed model scored about 45% overall at 1 fps. Hard-level sports reasoning (SPORTU) topped out around 58%. Specialized or fine-tuned systems are reported to beat frontier VLMs on tennis.

### Cited Findings
- SPORTU (ICLR 2025) has a text set of 900 multiple-choice questions and a video set of 1,701 slow-motion clips across 7 sports with 12,048 QA pairs, in three difficulty levels (easy needs no domain knowledge, hard tests rule comprehension). Data at github.com/chili-lab/SPORTU. — [SPORTU arXiv 2410.08474](https://arxiv.org/html/2410.08474v2)
- SPORTU headline numbers vary by version: GPT-4o is best at 57.8% on the hard video task in a later version; an earlier version reported Claude-3.5-Sonnet leading SPORTU-video at 69.52% overall; v1 evaluates 13 video-capable MLLMs and v4 evaluates 14. These are 2024-era models (GPT-4o, Claude 3.5), so they are older than current Gemini 2.5/3 or Claude 4.x. — [SPORTU v4](https://arxiv.org/html/2410.08474v4), [SPORTU v1](https://arxiv.org/html/2410.08474v1)
- OmniVinci reports 67.30 on SPORTU-video for its own model (shows the benchmark is still used for newer models). — [OmniVinci arXiv 2510.15870](https://arxiv.org/pdf/2510.15870)
- TennisTV (arXiv 2509.15602) treats each stroke as the basic unit (player movement, shot choice, direction, landing location). It evaluates 16 MLLMs including Gemini 2.5 Pro. Version v1: 9 subtasks / 2,943 questions, GPT-4.1 at 46.2%. Later version: 8 subtasks / 2,527 questions, GPT-4.1 first among closed models at 45.1% overall, narrowly ahead of GPT-4o and Gemini 2.5 Pro. — [TennisTV v2](https://arxiv.org/html/2509.15602v2), [TennisTV v4](https://arxiv.org/html/2509.15602v4), [PDF](https://arxiv.org/pdf/2509.15602)
- TennisTV closed models were evaluated at 1 fps "due to budget consideration"; the authors conclude frame-sampling density should be tailored per task and that improved temporal grounding is essential. A v1 example (counting how many times two players hit the ball) was answered wrongly by both Gemini 2.5 Pro and GPT-4o. — [TennisTV v1](https://arxiv.org/html/2509.15602v1), [v2](https://arxiv.org/html/2509.15602v2)
- VidDiffBench / Video Action Differencing (ICLR 2025): 549 video pairs in v1 (557 in a later preprint) across fitness, sports, music and surgery. Tested Qwen2-VL, LLaVA-Video, GPT-4o, Gemini-1.5 Pro, Claude 3.5 Sonnet. Per the project page, all LMMs are only slightly above random on the easy split; per a secondary summary, performance drops on medium/hard splits with no model significantly above chance on the hardest. Exact per-model numbers were not retrieved. These are 2024-era models. — [Video Action Differencing arXiv 2503.07860](https://arxiv.org/html/2503.07860v1), [project page](https://jmhb0.github.io/viddiff)
- TennisVL / TennisExpert (arXiv 2603.13397, 2026): TennisVL has 202 broadcast matches, 471.9 hours, 40,523 clips (vs 633 clips for an earlier tennis dataset), annotated with commentary-style captions. TennisExpert pairs a video semantic parser (scores, shot sequences, ball bounces, player locations) with a memory-augmented model on Qwen3-VL-8B, and the authors claim it consistently outperforms GPT-5, Gemini and Claude. Score values were not retrieved. Dataset ships as YouTube URLs plus annotations. — [TennisExpert arXiv](https://arxiv.org/html/2603.13397v2), [GitHub LZYAndy/TennisExpert](https://github.com/LZYAndy/TennisExpert)
- A 2025 paper evaluates multimodal LLMs on tennis video analysis and reports fine-tuning for single-event classification, with results the authors describe as still far from their target. Details not retrieved. — [arXiv 2507.02904](https://arxiv.org/pdf/2507.02904)
- A survey, "Deep Learning for Sports Video Event Detection: Tasks, Datasets, Methods, and Challenges", exists for background but was not read. — [arXiv 2505.03991](https://arxiv.org/pdf/2505.03991)
- SoccerNet, MatchTime, Sports-QA and FineSports benchmark scores were not found in this session.

### Inferences
- Treat tennis rally understanding as unsolved for off-the-shelf VLMs: roughly 45% on a mostly multiple-choice benchmark, with no frame-accurate event output evaluated.
- The TennisExpert design (parser plus small VLM) beating GPT-5/Gemini suggests the parsing layer, not the LLM size, is the differentiator.
- Gemini 2.5 Pro scoring close to GPT-4.1/GPT-4o on TennisTV suggests no clear Gemini advantage on tennis at 1 fps. A Flash-tier model was not reported.

### Gaps
- Per-task TennisTV scores (movement grounding, counting, landing location), Gemini Flash scores, and TennisExpert vs. GPT-5/Gemini numbers: not retrieved because arXiv pages were unreachable.
- Any benchmark scoring Gemini/GPT/Claude on frame-accurate tennis event timestamps (serve, hit, bounce): none found.
- SoccerNet, MatchTime, Sports-QA, FineSports results for current VLMs: not searched successfully.

## 2. Tennis-specific CV (ball tracking, court, pose, serve/bounce/hit detection)

### Takeaway
Dedicated trackers reach about 0.97-0.99 F1 on tennis ball tracking benchmarks, far above what VLMs are evaluated on. Pose-plus-trajectory classifiers handle bounce and shot events, but tennis-specific F1 for those was only partially retrieved.

### Cited Findings
- TrackNet (2019, original tennis broadcast tracker): 10-fold cross validation gave 95.3% precision, 75.7% recall, 84.3% F1; a different test set gave 98.5%. Older, not directly comparable to later versions. — [TrackNet arXiv 1907.03698](https://arxiv.org/pdf/1907.03698)
- TrackNetV3 (Chen and Wang, 2023) targets badminton shuttlecock tracking; accuracy rises from 87.72% to 97.51% with its trajectory rectification module. Not tennis. — [TrackNetV3 PDF](https://people.cs.nycu.edu.tw/~yushuen/data/TrackNetV3.pdf)
- TrackNetV5 (arXiv 2512.02789) reports on the TrackNetV2 dataset F1 0.9859, accuracy 0.9733, precision 0.9923, false negatives down 73.9% to 344, +2.78% F1 over TrackNetV4, 114 FPS on an NVIDIA T4, about 3.7% more FLOPs than V4. On the Loveall dataset F1 0.9878. — [TrackNetV5 arXiv](https://arxiv.org/html/2512.02789v1)
- A third-party reimplementation reproduces released TrackNetV3 weights at F1 97.59 (vs 97.5 reported by the TrackNetV4 paper), supporting that protocol. — [gino6178/TrackNetV5](https://github.com/gino6178/TrackNetV5). Note a different, unrelated "TrackNetV5" paper on shuttlecock tracking reports F1 98.47 vs TrackNetV3 97.64; do not mix with tennis figures. — [people.cs.nycu.edu.tw TrackNetV5](https://people.cs.nycu.edu.tw/~yushuen/data/TracknetV5_26.pdf)
- TrackNetV4 (motion attention maps) exists as a prior baseline. — [arXiv 2409.14543](https://arxiv.org/pdf/2409.14543)
- RacketVision (arXiv 2511.17045) is a multi-racket-sport benchmark for ball and racket analysis; it benchmarks TrackNetV3-style baselines, but its table in the retrieved summary covers table tennis. — [RacketVision](https://arxiv.org/pdf/2511.17045)
- A tennis system using a CatBoost classifier over ball trajectory plus player pose at contact for shot type/bounce is described in a vendor blog (low-rigor source, no accuracy verified). A VR broadcasting paper reports bounce detection with CatBoost over 20-frame windows and GVHMR pose. — [UNFORCE blog](https://unforce.io/blog/how-ai-tennis-shot-detection-works), [arXiv 2507.20006](https://arxiv.org/pdf/2507.20006)
- Pose-based stroke segmentation using a weighted joint-velocity score on MediaPipe landmarks appears in a 2026 paper. — [arXiv 2606.15992](https://arxiv.org/pdf/2606.15992)
- Court keypoint plus player/ball tracking pipeline ("Hawk Eye" style) is described in arXiv 2511.04126 (not read). — [arXiv 2511.04126](https://arxiv.org/pdf/2511.04126)
- Search snippets mention an E2E-Spot tennis dataset with frame-accurate bounce, swing and serve-contact labels, and a paper "Can Event Detectors Leave the Broadcast Camera? Evidence from Tennis" (arXiv 2610.38042). Contents not verified. — [arXiv 2610.38042](https://arxiv.org/pdf/2610.38042)

### Inferences
- Ball detection from a broadcast or fixed camera is effectively a solved sub-problem at about 97-99% F1 on benchmark data; the gap is generalization to phone/amateur footage, which was not evidenced here.
- Event timing (hit, bounce) is best derived from the ball trajectory, with pose as a secondary signal.

### Gaps
- TrackNetV3 on tennis specifically (its paper is badminton) and F1 for serve/bounce/hit detection on tennis: not retrieved.
- Court-line detection accuracy figures: not retrieved.
- Performance on non-broadcast, handheld or amateur footage: not found.

## 3. Tennis and racket-sport datasets (annotations, licenses)

### Takeaway
Several datasets exist, but licenses were mostly not confirmed. Only OpenTTGames (table tennis) had a confirmed license (CC BY-NC-SA 4.0, non-commercial), which matters for a commercial product.

### Cited Findings
- TenniSet: 5 full matches from the 2012 London Olympics (YouTube), six event types (e.g. set, hit, serve) with temporal intervals, plus captions; license not found. — [TenniSet (ResearchGate)](https://www.researchgate.net/publication/322003612_TenniSet_A_Dataset_for_Dense_Fine-Grained_Event_Recognition_Localisation_and_Description)
- THETIS: 8,734 Kinect recordings, 12 stroke categories, RGB, depth and skeleton; license not found. — via [arXiv 2505.03991 survey](https://arxiv.org/pdf/2505.03991) search summary
- ShuttleSet (badminton): human-annotated stroke-level singles data for tactical analysis; license not found. — [arXiv 2306.04948](https://arxiv.org/pdf/2306.04948)
- OpenTTGames and Extended OpenTTGames (table tennis): shot type and point outcome annotations, CC BY-NC-SA 4.0. — [arXiv 2512.19327](https://arxiv.org/html/2512.19327v2)
- TennisVL: 40,523 clips, YouTube URLs plus annotations. — [GitHub](https://github.com/LZYAndy/TennisExpert)
- A tennis shot side-view/top-view dataset exists for player analysis. — [PMC11068545](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11068545/)
- BFMD is a full-match badminton dense shot captioning dataset (2026). — [arXiv 2603.25533](https://arxiv.org/pdf/2603.25533)

### Inferences
- Most tennis sets are broadcast-footage derived, so redistribution and commercial use are legally uncertain.

### Gaps
- Licenses for TenniSet, THETIS, ShuttleSet, TennisVL and E2E-Spot tennis labels; Sports-1M-like coverage; ball-tracking dataset licenses.

## 4. Known VLM failure modes (fps sampling, timestamp drift, hallucinated shots, small fast objects)

### Takeaway
Evidence supports sparse-sampling misses, weak temporal grounding and counting errors, but no source isolated Gemini timestamp drift on sports footage.

### Cited Findings
- TennisTV used 1 fps for closed models and the authors say sampling density must be tuned per task; counting hits was answered wrongly by Gemini 2.5 Pro and GPT-4o. — [TennisTV v1](https://arxiv.org/html/2509.15602v1)
- VideoZeroBench (500 open-ended questions, 13 domains incl. sports) scores answers with spatio-temporal evidence: Gemini-3-Pro and Gemini-2.5-Pro reach 32.0% and 31.4% tIoU, most others under 20%; no model exceeds 1.8% on the strictest level. Gemini got full video plus audio while others got 1 fps, so the comparison is confounded. One version lists a "Gemini-3.7-Flash" at 42.9% tIoU that conflicts with other figures and may be a typo. Under uniform sampling models often miss events shorter than 0.1 s. — [VideoZeroBench arXiv 2604.01569](https://arxiv.org/html/2604.01569)
- Hour-long video grounding paper: Gemini-2.5-flash scores 0.053 mIoU given raw video at 1024 frames, and a CLIP frame-retrieval baseline beats video LLMs. — [arXiv 2606.12300](https://arxiv.org/pdf/2606.12300)
- Contradicting evidence: VideoTemp-o3 notes Gemini-2.5-Pro showed negligible performance difference across video lengths. — [arXiv 2602.07801](https://arxiv.org/pdf/2602.07801)
- TimeLens studies rethinking video temporal grounding with MLLMs (not read). — [arXiv 2512.14698](https://arxiv.org/pdf/2512.14698)
- A 2026 paper states video-language model temporal predictions are inconsistent under small query changes. — [arXiv 2610.38042](https://arxiv.org/pdf/2610.38042) (snippet only)
- A GitHub "Temporal Grounding Lab" repo claims a sports timestamp hallucination benchmark; unverified, low confidence. — [repo](https://github.com/master72o/temporal-grounding-lab)

### Inferences
- A tennis ball travels many meters between 1 fps frames, and contact lasts milliseconds, so 1 fps sampling cannot see most individual hits or bounces; this follows from the sampling rate and is not directly measured here.
- Gemini Flash for event detection is likely to need either high fps clips or externally supplied tracking data.

### Gaps
- No direct measurement of Gemini Flash timestamp error (seconds) on tennis; no measurement of hallucinated-shot rates.

## 5. Hybrid CV tracking plus LLM reasoning (2024-2026)

### Takeaway
The best evidence for hybrids is TennisExpert, which feeds parser outputs (scores, shots, bounces, locations) to a Qwen3-VL-8B model and reportedly beats GPT-5/Gemini/Claude. No other tennis hybrid with measured numbers was found.

### Cited Findings
- TennisExpert as described above. — [arXiv 2603.13397](https://arxiv.org/html/2603.13397v2)
- Tennis doubles automated video analytics framework and strategy analysis with data mining (companion to 2507.02904). — [arXiv 2507.02906](https://arxiv.org/pdf/2507.02906)
- RacketVision unifies ball and racket analysis across sports as a structured input for downstream reasoning. — [arXiv 2511.17045](https://arxiv.org/pdf/2511.17045)

### Inferences
- A pipeline of tracker or pose events to structured JSON, then LLM narration/attribution, matches the published direction; LLMs add value on interpretation, not timing.

### Gaps
- No paper found that confirms an LLM-over-tracker design on amateur footage; search found no direct tennis hybrid beyond TennisExpert.
