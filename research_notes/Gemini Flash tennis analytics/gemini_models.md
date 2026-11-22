# Gemini Flash-tier video understanding: models, pricing, API capabilities (as of 2026-11-22)

**Research limitation (read first):** WebFetch could not resolve ai.google.dev, blog.google, developers.googleblog.com, ppc.land or banyanboard.com (outside the session's allowed network domains), so no primary Google page was read in full. Everything below comes from WebSearch result summaries (which quote or paraphrase Google docs and third-party sites). Primary-source verification is still needed; to do it, allow ai.google.dev and blog.google in the session network settings and re-run. Items are labeled [search-summary] where only a snippet backed them.

## 1. Current model lineup and API model IDs (which are real, GA vs preview)

### Takeaway
All the names in the brief appear in search snippets of Google's models page (ai.google.dev/gemini-api/docs/models), so they look real, but the snapshots disagree on which Flash is newest, and GA/preview status per model could not be confirmed. Gemini 4 Argon is real but is a flagship (not Flash) with limited/staged access.

### Cited Findings
- The Gemini API models page snapshots list IDs `gemini-3.8-flash` (described as "most intelligent Flash model", for long-horizon software engineering/agents), `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite` ("fastest, most cost-effective 3.5 model"), `gemini-3.1-flash-lite` (listed stable), `gemini-2.5-flash`, `gemini-2.5-flash-lite` — [Gemini API models docs (via search)](https://ai.google.dev/gemini-api/docs/models). The search tool noted snapshots conflict on whether 3.6, 3.7 or 3.8 is newest.
- Shut down: `gemini-3.1-flash-lite-preview` and `gemini-2.0-flash-lite` — [Gemini API models docs (via search)](https://ai.google.dev/gemini-api/docs/models).
- Gemini 3.8 Flash is listed on OpenRouter, so it is publicly available — [OpenRouter](https://openrouter.ai/google/gemini-3.8-flash).
- Gemini 3.5 Flash-Lite released Jul 21, 2026 — [llm-stats](https://llm-stats.com/models/gemini-3.5-flash-lite); Gemini 3.5 Flash coverage dated May 19, 2026 — [Simon Willison](https://simonwillison.net/2026/May/19/gemini-35-flash/).
- Gemini 4 Argon: announced Sept 30, 2026, model ID `gemini-4-argon`, flagship for coding/law/finance/cyber, up to 1M output tokens; access reports conflict (global rollout / AI Studio per Forklog vs. trusted partners first via Fairwind program per Betanews/InfoWorld/Apidog) — [Google model page](https://ai.google.dev/gemini-api/docs/models/gemini-4-argon), [Forklog](https://forklog.com/en/google-launches-gemini-4-argon-ai-model/), [Betanews](https://betanews.com/article/gemini-4-argon-cyber-defenders-fairwind/), [InfoWorld](https://www.infoworld.com/article/4229615/google-makes-gemini-4-ai-model-available-to-a-trusted-few.html).
- Agentic video lists supported models as Gemini 4 Argon, 3.8 Flash, 3.6 Flash, 3.5 Flash-Lite per Google optimization docs; one blog lists 3.7 Flash, 3.6 Flash, 3.5 Flash-Lite instead — [Google optimization docs (via search)](https://ai.google.dev/gemini-api/docs/optimization).

### Inferences
- For a Flash-tier choice now: `gemini-3.8-flash` (top Flash) vs `gemini-3.5-flash-lite` (cheapest, supports agentic video). Pro-tier IDs for the 3.x line were not surfaced; not found.

### Gaps
- GA vs preview status for each ID; exact Pro-tier model IDs; whether 3.7 Flash is deprecated; whether Argon is generally available via API.

## 2. Pricing and cost per hour of video

### Takeaway
Gemini 3.8 Flash: $0.75 in / $3.75 out per 1M tokens, reportedly introductory through Dec 31, 2026, doubling Jan 1, 2027 [third-party, unverified]. 3.5 Flash-Lite: $0.30 / $2.50. Video is billed at the same per-token input rate as text/image. Default Gemini 3 video is ~70 tokens/frame, so 1 hour at 1 fps is ~252K video tokens, i.e. roughly $0.08 (Flash-Lite) to $0.19 (3.8 Flash) before audio/output.

### Cited Findings
- Gemini 3.8 Flash $0.75/1M input, $3.75/1M output; introductory through 2026-12-31, doubling 2027-01-01; batch reportedly 50% off; no separate video rate found, modality listed as text/image/video/audio/PDF — [OpenRouter](https://openrouter.ai/google/gemini-3.8-flash), [pricepertoken](https://pricepertoken.com/pricing-page/model/google-gemini-3.8-flash) (aggregators; Google page not read).
- Gemini 3.5 Flash-Lite $0.30 input (same for text/image/video/audio), $2.50 output (includes thinking tokens); cache read ~$0.03; batch $0.15/$1.25 — [Artificial Analysis](https://artificialanalysis.ai/models/gemini-3-5-flash-lite), [llm-stats](https://llm-stats.com/models/gemini-3.5-flash-lite), [Developers Digest](https://www.developersdigest.tech/models/gemini-3-5-flash-lite).
- media_resolution on Gemini 3: default video ~70 tokens/frame, high ~280 tokens/frame (forum posts describe 280 as 2x2 tiling of the same frame); per-part resolution is Gemini 3 only; on 2.5-era docs low and medium both = 70 tokens — [Media resolution docs (via search)](https://ai.google.dev/gemini-api/docs/media-resolution), [forum](https://discuss.ai.google.dev/t/best-practices-for-video-pre-processing-resolution-with-media-resolution-parameter-in-gemini-3-0/109808). The search snippet's table was garbled (showed "1120 / 70 / 25"); exact per-setting numbers (low/medium/high/ultra-high) unverified.
- Pro-tier pricing: not found.

### Inferences (my arithmetic; assumes 70 tok/frame default, 280 high, 1 fps = 1 frame/s, video tokens only, excludes audio, output and thinking tokens, uses the above input prices)
| Setting | Tokens/hr | 3.8 Flash ($0.75) /hr | /10 min | 3.5 Flash-Lite ($0.30) /hr | /10 min |
|---|---|---|---|---|---|
| 1 fps, 70 tok | 252K | $0.19 | $0.03 | $0.076 | $0.013 |
| 1 fps, 280 tok (high) | 1.008M | $0.76 | $0.13 | $0.30 | $0.050 |
| 5 fps, 70 tok | 1.26M | $0.95 | $0.16 | $0.38 | $0.063 |
| 5 fps, 280 tok | 5.04M | $3.78 | $0.63 | $1.51 | $0.25 |
| 10 fps, 70 tok | 2.52M | $1.89 | $0.32 | $0.76 | $0.126 |
- Cost scales linearly with fps x tokens/frame; batch (50%) halves these. Doubling in Jan 2027 would double 3.8 Flash figures. Audio adds tokens (older docs: ~32 tokens/s; not verified for Gemini 3).
- Long videos at high fps will exceed a 1M-token context (e.g. 1 hr at 5 fps/70 tok = 1.26M), forcing chunking.

### Gaps
- Official Google pricing page values, Pro pricing, video-specific tokens/sec at each media_resolution tier, audio token rate for Gemini 3.x.

## 3. API parameters (fps, offsets, media_resolution, File API, context, audio, JSON, caching, batch)

### Takeaway
Not verified from primary docs. Only media_resolution (per-part, Gemini 3) and the agentic `processing` parameter were confirmed via snippets.

### Cited Findings
- `media_resolution` controls tokens per frame; separate `processing`/`media_processing` setting controls what video content is loaded; can combine agentic with low media resolution — [Media resolution docs (via search)](https://ai.google.dev/gemini-api/docs/media-resolution).
- Batch ~50% off and context-cache read ~10% of input price (Flash-Lite) — see section 2 sources.

### Gaps (from earlier knowledge, NOT verified this session; confirm in video-understanding docs)
- videoMetadata fps / start_offset / end_offset syntax, File API size/duration/retention limits, YouTube URL support, context window per model (3.8 Flash "1M-token context claim" is discussed at [kie.ai](https://kie.ai/blog/what-is-gemini-3-8-flash) but not verified), audio handling, structured-output/JSON-schema support with video, explicit vs implicit caching, exact batch terms.

## 4. Agentic video understanding

### Takeaway
Released by Google (blog.google and AI Studio guide exist); enabled by setting video `processing` to "agentic" (`media_processing: "AGENTIC"`); no extra fee, billed at normal token rates. Vendor claims: up to 88% fewer tokens, up to 66% lower cost, up to 7% better quality vs 1 fps static.

### Cited Findings
- Enable: `processing: "agentic"` (Interactions API) / `media_processing: "AGENTIC"` (GenerateContent) — [Google optimization docs (via search)](https://ai.google.dev/gemini-api/docs/optimization), [Google blog](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-agentic-video-in-gemini/), [developer guide](https://aistudio.google.com/learn/agentic-video-understanding-with-gemini).
- Vendor numbers: 1H-VideoQA static 1 fps 397.6K / 300.3K tokens per query on two long-video benchmarks vs 47.7K / 36.0K agentic; cost drop (66%) smaller than token drop (88%) because of thinking tokens (total_thought_tokens) and tool round-trips (total_tool_use_tokens) — [orcarouter summary](https://www.orcarouter.ai/blog/gemini-agentic-video-understanding), [NYU Shanghai summary](https://rits.shanghai.nyu.edu/ai/gemini-agentic-video-understanding). Benchmarks: Minerva, 1H-VideoQA, LVBench.
- Guidance: use for long videos (>5-10 min) or targeted queries; static for short clips (<5 min) or full summaries; Google's guide reportedly recommends it for sports and exact timestamps / fast motion that 1 fps misses, with a demo counting a rapid movement by re-watching at different frame rates — [ppc.land](https://ppc.land/google-cuts-gemini-video-analysis-tokens-by-up-to-88-in-agentic-mode/) (via search summary).
- Caveat: selective frame inspection can miss a relevant segment or give a wrong timestamp; test on your own footage — [AlphaSignal](https://alphasignal.ai/news/google-s-gemini-flash-cuts-video-ai-costs-66-by-watching-smarter).

### Inferences
- For tennis rallies (fast ball, short events), agentic mode's ability to re-sample at higher fps targeted at moments could beat uniform 1 fps cheaply, but cost is less predictable (thought tokens).

### Gaps
- Limits (max video length, rate limits), exact cost on non-benchmark content, whether it works with structured output/caching.

## 5. Evidence on sports / fast motion / small objects / timestamp accuracy

### Takeaway
No independent benchmark of current Flash models on tennis or small-object tracking was found. Evidence is thin: one older-model football test and a research paper favoring higher fps.

### Cited Findings
- BanyanBoard football study tested Gemini 3 Flash (not 3.7/3.8): paid tier timestamps matched real moments with no invented events but missed several shots; free tier had timestamp delays and missed shots — [BanyanBoard](https://banyanboard.com/blogs/sports-analytics/how-accurate-are-multimodal-ai-models-for-football-soccer-video-analysis-a-benchmark-study-of-gemini-and-qwen/) (via search summary; blog, not peer reviewed).
- Sampling at 16 fps vs 1 fps improved results on gymnastics, diving, basketball, football; GPT-4o and Gemini-1.5-Pro weaker — [arXiv 2503.13956](https://arxiv.org/pdf/2503.13956) (predates current models).
- Vendor claims on agentic mode for sports are in section 4.

### Gaps
- Independent tests of 3.5-3.8 Flash on tennis, ball tracking, or timestamp error in seconds; none found.
