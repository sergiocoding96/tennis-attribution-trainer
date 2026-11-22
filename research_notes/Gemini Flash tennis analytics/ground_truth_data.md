# Ground-truth data sources for evaluating AI tennis match analysis

Access note: tennisabstract.com (www and apex) did not resolve from this environment. Github.com, raw.githubusercontent.com and web search worked. Tennis Abstract facts below come from search-result snippets only. Several github.com repo pages (tennis_atp, tennis_slam_pointbypoint) returned 404 via the fetch tool, so those are unverified.

## Match Charting Project (MCP): structure, columns, license, size, video links

### Takeaway
MCP is the best fit: free, shot-level, CC BY-NC-SA 4.0 (non-commercial only), 17,000+ charted matches. Match records contain no video URL column, so video-to-chart linking has to be done by hand or by OCR.

### Cited Findings
- License is CC BY-NC-SA 4.0. The README says "Attribution is required. Non-commercial use only." Attribution goes to the Tennis Abstract Match Charting Project with a link to the GitHub source. — [MCP README](https://raw.githubusercontent.com/JeffSackmann/tennis_MatchChartingProject/master/README.md)
- Repo files: `charting-{m,w}-matches.csv` (one row per match); points files `charting-{m,w}-points-to-2009.csv`, `-points-2010s.csv`, `-points-2020s.csv` (split for GitHub size limits); 16 aggregate stats files per gender (KeyPointsReturn, KeyPointsServe, NetPoints, Overview, Rally, ReturnDepth, ReturnOutcomes, ServeBasics, ServeDirection, ServeInfluence, ShotDirOutcomes, ShotDirection, ShotTypes, SnV, SvBreakSplit, SvBreakTotal); `data_dictionary.txt`; the Excel charting tool `MatchChart 0.3.2.xlsm` (its Instructions tab documents the shot-code notation). — [Repo page](https://github.com/JeffSackmann/tennis_MatchChartingProject)
- Matches file header (15 columns): `match_id,Player 1,Player 2,Pl 1 hand,Pl 2 hand,Date,Tournament,Round,Time,Court,Surface,Umpire,Best of,Final TB?,Charted by`. There is no video or URL column. Example match_id: `20260517-M-Rome_Masters-F-Casper_Ruud-Jannik_Sinner` (date-gender-tournament-round-players). The file shows matches through at least May 2026, so it is actively updated. — [charting-m-matches.csv](https://raw.githubusercontent.com/JeffSackmann/tennis_MatchChartingProject/master/charting-m-matches.csv)
- Points file columns per the data dictionary: `match_id`, `Pt` (point number from 1), `Set1/Set2` (sets won so far), `Gm1/Gm2` (games won in current set), `Pts` (score in current game), `Gm#` (e.g. "X (Y)" = match-wide game number and point within game), `1st` and `2nd` (shot-code strings for the serve and rally), `PtWinner` (1 or 2), `rallyCount` (shots in rally, including serve and excluding errors). Player 1 is always the first server. Only `1st`, `2nd` and `Notes` are user-entered; other columns are auto-generated. The dictionary snippet I retrieved covers these columns only; the README says further auto-generated columns exist (shot type, direction, return depth, error types). — [data_dictionary.txt](https://raw.githubusercontent.com/JeffSackmann/tennis_MatchChartingProject/master/data_dictionary.txt); [README](https://raw.githubusercontent.com/JeffSackmann/tennis_MatchChartingProject/master/README.md)
- Size: README says "over 5,000 matches" (stale). A Tennis Abstract milestone post titled "17,000 Matches" and roughly ten million charted shots (search snippet). The 10,000-match post dates from May 2022. 32 people charted matches in 2025. Every recent tour-level final is charted, and 543 Federer matches had been charted by the 10,000 mark. — [Search results summarizing Tennis Abstract posts](https://www.tennisabstract.com/blog/?p=7627) (not fetched directly)
- Tennis Abstract also hosts a "Last 50 Charted Matches" page and per-player charting lists, useful for picking recent matches. — [last_fifty](https://www.tennisabstract.com/charting/last_fifty.html) (not fetched)
- Video: neither the README nor the matches CSV header mentions video links. A search summary says the blog has expressed hope of finding charted matches with YouTube videos unlikely to be taken down. — [Search summary of Tennis Abstract blog](https://www.tennisabstract.com/blog/2013/11/26/the-match-charting-project/) (snippet only)

### Inferences
- Because match_id encodes date, tournament, round and players, you can search for the official YouTube upload by these fields and store the URL in your own side table keyed by match_id.
- Because the points file has the running score on every row, a score read off the video (set, game, point score) can be matched to a specific `Pt` row, which is what makes automated alignment possible.
- The NC license probably allows internal research evaluation but would constrain any commercial redistribution of the eval set. Treat this as a legal question to verify.

### Gaps
- Exact current count (above 17,000) and the exact number of matches with public video: no list found, and tennisabstract.com was unreachable.
- Full data_dictionary coverage of the auto-generated columns (shot type, direction, depth, error type) was not retrieved.
- The shot-code notation (serve direction 4/5/6, f/b, etc.) was not retrieved; read the Instructions tab of the xlsm or the Tennis Abstract quick start guide.

## tennis_atp / tennis_wta, Tennis Abstract, tour and slam stats sites, Ultimate Tennis Statistics

### Takeaway
I could not verify any of these directly. They are only useful for match-level stats, not shot-level ground truth. Treat everything beyond the existence of the repos as unverified.

### Cited Findings
- Tennis Abstract is the hosting site for MCP charts and reports (per search results above). — [Tennis Abstract blog](https://www.tennisabstract.com/blog/2013/11/26/the-match-charting-project/)

### Inferences
- From general knowledge (not verified here): Sackmann's tennis_atp and tennis_wta repos hold match-level CSVs with serve stats (aces, double faults, break points) and are also CC BY-NC-SA. Verify before relying on this.

### Gaps
- github.com/JeffSackmann/tennis_atp and tennis_slam_pointbypoint returned 404 via the fetch tool, so license, columns and years covered are unconfirmed. Slam point-by-point availability is unconfirmed.
- ATP/WTA/Infosys live-score stats pages, slam data APIs, and Ultimate Tennis Statistics: not researched (tool-call budget and blocked hosts). Their terms of use likely restrict scraping; check each.

## Video-aligned datasets (TenniSet, THETIS, broadcast datasets)

### Takeaway
TenniSet is small but has timestamped events. TennisVL (TennisExpert, 2026) is the largest relevant recent dataset, with expert-style captions, shot sequences and scoreboard annotations. THETIS was not confirmed.

### Cited Findings
- TenniSet (Faulkner and Dick, DICTA 2017): five full-match videos from the 2012 London Olympics taken from YouTube, six event categories (including set, hit, serve) with time boundaries, plus text descriptions. — [Adelaide repository](https://web4.library.adelaide.edu.au/dspace/handle/2440/113022); [dataset datasheet](https://zzzqr.github.io/AIGGC-datasheet/datasets/tenniset-a-dataset-for-dense-fine-grained-event-recognition-localisation-and-description)
- TennisVL, from the TennisExpert paper (arXiv 2603.13397, March 2026): 202 broadcast matches, 471.9 hours, 40,523 rally-level clips with expert-style natural-language captions. The authors state the dataset and code are public at github.com/LZYAndy/TennisExpert. — [arXiv](https://arxiv.org/abs/2603.13397); [AlphaXiv](https://www.alphaxiv.org/abs/2603.13397)
- A secondary summary says TennisVL covers AO, RG, Wimbledon and US Open singles, 2019 to 2025, with fields for commentary, audio transcript, shot sequence, scoreboard and trajectories. This was not confirmed against the paper. — [Emergent Mind](https://www.emergentmind.com/topics/tennisvl)
- Vid2Player database: Wimbledon Centre Court 2018 and 2019 broadcasts, with point start and end and ball-hit times marked manually, main-camera frames only. Public release was not confirmed. — [Vid2Player](https://arxiv.org/pdf/2008.04524)
- A 2025 survey lists a Vid2Player-derived tennis set of 3,345 clips from 28 matches with ball bounce and net hit events. — [Deep Learning for Sports Video Event Detection](https://arxiv.org/pdf/2505.03991)

### Inferences
- TennisVL could serve as a second ground truth for commentary-style output, though its captions come from a research pipeline and are not independent human charting. Its license and video availability need checking.

### Gaps
- THETIS: search returned nothing; from memory it is a Kinect-based stroke-recognition dataset of players in a lab, not broadcast footage. Unverified.
- Licenses and download details for TenniSet, TennisVL and Vid2Player were not retrieved.

## Legal full-match video and choosing a ~10-minute clip

### Takeaway
Official channels such as Wimbledon post full-match replays, but footage is commercially licensed, not CC. Use it for private evaluation only, and do not redistribute.

### Cited Findings
- Wimbledon's channel has posted complete replays (for example the 2025 finals), and availability varies by country. Descriptions point to a commercial licensing link, and no Creative Commons statement was found. Reports conflict on archive replays: one May 2025 article says none had been published since July 2020, while later pages show 2004 to 2009 archive replays on YouTube. — [Last Word on Sports](https://lastwordonsports.com/tennis/?p=83581); [Digiday](https://digiday.com/marketing/wimbledon-wants-to-monetize-its-archive-content-in-digital-push/)

### Inferences
- Suggested clip criteria (my reasoning): the match must be in MCP (check by match_id); the official full replay must be on YouTube; pick a stretch of about 10 minutes that starts at the beginning of a game and covers 2 to 3 games (roughly 25 to 40 points); the clip needs a clear on-screen scoreboard, a main broadcast camera and few replays or ad cuts; prefer matches with long rallies and some break points so there is signal to test; read the chart rows for those points beforehand and confirm they match what is on screen.

### Gaps
- No verified Creative Commons tennis footage found. ATP Tour, WTA, Roland Garros, AO and Tennis TV channel policies were not checked.
- Which charted matches have public full video: no list found.

## Automating clip-to-chart alignment (scoreboard OCR)

### Takeaway
Feasible. Published work (SmartTennisTV) segments rallies, reads the scoreboard and corrects scores using the rules of tennis. Scoreboard layout varies by broadcast, so expect per-tournament tuning.

### Cited Findings
- SmartTennisTV (IIIT Hyderabad): pipeline of rally segmentation, scorecard extraction, score recognition, then refinement with tennis scoring rules. It notes scoreboards vary in position, format, font, size and color, and considers Tesseract and a lexicon-encoded CNN. Accuracy figures were not in the retrieved excerpts. — [arXiv 1801.01430](https://arxiv.org/pdf/1801.01430)
- SIFT-based scoreboard localization with multi-frame voting improves OCR accuracy in sports video (patent-style and other sources in search results). — [search result](https://ar5iv.labs.arxiv.org/html/1801.01430)

### Inferences
- A workable approach: sample frames, OCR the score, map (set, game, point score) to the MCP `Set1/Gm1/Pts` columns, then take the first match as the offset. Since Player 1 is the first server, server identity must be consistent.
- For a single 10-minute clip, manual alignment is faster than building OCR; OCR pays off at 5 or more clips.

### Gaps
- No tested open-source tennis scoreboard OCR implementation was found, and no accuracy numbers were retrieved.
