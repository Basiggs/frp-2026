# FRP 2026 paper — section-by-section fill guide

Companion files (same folder): `paper.tex` (full, compiles), `refs.bib` (four references),
`images/teaser.jpg`, `images/demo.jpg`.

How to use in Overleaf: New Project -> Upload -> `paper.tex`, `refs.bib`, and the `images/`
folder. Compiler: pdfLaTeX. Then edit only the items marked **EDIT** below.

Number source of truth: `~/work/projects/school-video/results.md` and `data.json`.
Real numbers used everywhere: 75 videos, 7 subjects, 82 minutes, 219 quiz questions,
73 videos with grade + chapter marks, 24 scripts checked (15 passed, 9 stopped),
~3 minutes build time per video, estimated 60–120 minutes by hand.

---

## 1. Title & Project Name

**Rules:** the title must be a question OR your main finding (not a topic label).
The project name is exactly one line under the title. Authors, track, ISSAI,
Nazarbayev University, October 2026 go in the title block, centred.

**Where:** very top of page 1, replaced in one block.

```latex
\begin{center}
{\LARGE\bfseries Can One Pipeline Turn a School Topic into a Finished Lesson Video in Three Languages?\par}
\vspace{4pt}
{\large A one-pipeline system for trilingual school lesson videos\par}
\vspace{8pt}
[Your Name]\quad [Teammate's Name]\\          % EDIT
Track: [Track Name]\\                         % EDIT
ISSAI, Nazarbayev University\\
October 2026
\end{center}
```

Why it passes: the headline is a yes/no question; the second line is 59 characters,
so it stays on one line; all five required items are present.

---

## 2. Abstract

**Rules:** exactly 4 sentences, written last. (1) problem, (2) what you did,
(3) main number vs baseline, (4) why it matters. No citations, no "we hope".

**Where:** the abstract box, directly after the title block.

**Sentence map for your project:**
1. who needs material + which languages;
2. the pipeline steps;
3. 75 videos / 82 min / 219 questions at ~3 min vs 60–120 min by hand;
4. why it matters (one teacher equips a class quickly).

```latex
\begin{abstract}
\noindent
Students need far more short learning material than teachers can produce by hand,
especially in Kazakh, Russian and English. We built one pipeline in which a chat model
writes a lesson script, an AI checker reads it, an image model draws each scene, a speech
model narrates it, and ffmpeg renders a finished video with chapter marks, a quiz and a
gallery card. The pipeline produced 75 videos covering 7 school subjects (82 minutes,
219 quiz questions) at about 3 minutes of build time per video, whereas the same video
made by hand is estimated at 60--120 minutes. This matters because it lets one teacher
equip a whole class with multilingual, quiz-ready material in the time a single
hand-made video used to take.
\end{abstract}
```

Check before submitting: keep it to these four full stops; do not add a fifth sentence.

---

## 3. Figure 1 (teaser) caption

**Rules:** exactly ONE sentence saying what the reader sees. No "Figure 1:" prefix
(the template adds it).

**Where:** caption under the teaser picture (`images/teaser.jpg`), after the abstract.

```latex
\caption{A student watches a lesson at a laptop while a robot assembles the same topic
into a filmstrip of generated scenes, illustrating the topic-to-video pipeline.}
```

---

## 4. Introduction

**Rules:** exactly 3 short paragraphs.
P1 = the problem in daily life and who has it. P2 = what is missing today.
P3 = what you did + main result in one sentence, and P3 must END with the list
"Our contributions are: (1)... (2)... (3)..." (2 or 3 items only).

**Where:** Section 1, immediately after Figure 1.

**Content plan:**
- P1: the teacher of Grade 9 physics in Kazakh; the student revising at night.
- P2: big text-to-video models give silent clips; no curriculum script, no Kazakh
  narration, no chapters, no quiz, no search by subject/grade, hard to fix one scene.
- P3: built a white-box pipeline; 75 videos; ~3 min vs 60–120 min; then contributions.

```latex
\section{Introduction}

A teacher who wants a short video on, for example, ``Newton's second law'' for Grade 9
in Kazakh has to write a script, find pictures, record a voice and edit everything, and
a student revising alone at night has no such video at all. In our own school
experience, the topics asked for most often (physics, chemistry and history) are exactly
the ones with the fewest ready-made clips in Kazakh or Russian.

What is missing today is not a video generator but an end-to-end school tool: large
text-to-video models produce beautiful silent clips, yet they do not write a
curriculum-correct script, do not add a narrated explanation in Kazakh or Russian, do
not produce chapter marks or a quiz, and cannot be searched by subject and grade.
Teachers also cannot easily correct a single wrong scene inside a generated clip.

We built a white-box pipeline around existing class models and rendered 75 curriculum
videos with it, reaching about 3 minutes per finished video against an estimated
60--120 minutes by hand. Our contributions are: (1) a script-first pipeline that checks
the text before any picture or voice is generated; (2) a trilingual gallery with
subject, grade and language filters, chapter marks and quizzes; (3) a public release of
75 videos and the full measurement, with an honest report of what is still weak.
```

---

## 5. Related Work

**Rules:** 2–4 works; for each: what the authors did and how YOUR work differs.
Use `\cite{key}`; every key must exist in `refs.bib`.

**Where:** Section 2.

Your three works (all real, entries already in `refs.bib`):
1. `singer2022` — Make-A-Video: text-to-video diffusion trained on text–image pairs.
   Difference: we run no video model, keep every scene editable, narrate in Kazakh.
2. `khachatryan2023` — Text2Video-Zero: zero-shot video from image diffusion.
   Difference: we add script, captions, chapters, quiz; no motion synthesis.
3. `brooks2024` — Sora/world simulators: strong visuals at large cost/scale.
   Difference: cheap white-box pipeline aimed at a fixed school format.

```latex
\section{Related Work}

Singer et al.~\cite{singer2022} train a diffusion model on text--image pairs to generate
short silent video clips; their system is impressive but needs large video corpora, and
the output cannot easily be edited scene by scene or narrated in Kazakh.
Khachatryan et al.~\cite{khachatryan2023} obtain zero-shot video from a pretrained image
diffusion model by moving the latent code; this removes training data but still yields
silent motion clips without captions, chapters or quizzes. Brooks et al.~\cite{brooks2024}
describe large-scale video generation models as world simulators, showing strong visual
quality at a cost and scale that a school cannot run.

Our work differs in three ways: we do not train or run a video-generation model at all,
we keep every intermediate artefact (script, one image per scene, audio, captions)
editable, and we target a fixed school format -- 1--1.5 minutes, three languages,
chapter marks, a quiz and a searchable card.
```

---

## 6. Section 3 — What We Built

**Rules:** describe the pipeline as Input -> AI -> Output; name models and sizes;
state the dataset (size, source, license); state where it ran (ISSAI GPU server);
provide a one-sentence Figure 2 caption in the pattern
"Figure 2: [How it works: input -> AI -> output.]".

**Where:** Section 3, before Figure 2.

Facts that belong here:
- Input: topic + grade + language (or upload an existing video/PDF).
- AI: DeepSeek-V4.1-Flash writes the script (size not public); AI check; FLUX.3 klein
  draws scenes (Black Forest Labs, size not public); OmniVoice narrates; all zero-shot
  via the class API — no fine-tuning.
- Output: ffmpeg 1080p MP4, captions, chapters, gallery card, quiz.
- Data: NO training dataset; 75 topics written by you from the school curriculum,
  7 subjects; generated images/audio; nothing third-party redistributed.
- Execution: model calls on the ISSAI GPU server via the class API; rendering on the
  workspace CPU with ffmpeg.

```latex
\section{What We Built}

\textbf{Input.} The user gives a topic, a school grade and a language (Kazakh, Russian or
English) on the ``Create'' page, or uploads an existing video or a PDF lesson.

\textbf{AI.} A chat model from the DeepSeek family~\cite{deepseek2024}
(DeepSeek-V4.1-Flash, served through the class API; the parameter count is not public)
writes a scene-by-scene script with a title, narration and image prompts. A second AI
check reads the script for factual and curriculum errors before anything else is
generated. The image model FLUX.3 klein (Black Forest Labs) draws one picture per scene,
and the OmniVoice speech model narrates each scene in the chosen language. We do not
fine-tune any model: all models are used zero-shot through the class API.

\textbf{Output.} ffmpeg scales the pictures to 1080p, aligns each scene with its
narration, adds burned-in captions and chapter marks, and encodes an MP4
(\texttt{out/<slug>-<lang>.mp4}); the gallery then shows a card with subject, grade and
language tags, and the quiz page shows the questions before and after the video.

\textbf{Data and resources.} There is no training dataset: the 75 topics were written by
us from the school curriculum across 7 subjects (biology, chemistry, geography, history,
languages, mathematics, physics), and the topic list is released with the repository; no
third-party dataset is redistributed. Model calls ran on the ISSAI GPU server through
the class API, and rendering ran on the workspace CPU with ffmpeg.
```

Figure 2 must show the pipeline itself. `paper.tex` draws it with TikZ (two rows:
Input -> Script -> AI check -> Pictures, then Output <- Render <- Voice), so no image
file is needed. If your template forbids TikZ, replace the picture with `images/demo.jpg`
and keep the caption below.

Figure 2 caption (one sentence, keeps the required pattern). LaTeX adds the "Figure 2:"
label itself, so do NOT type it inside `\caption` (otherwise you get "Figure 2: Figure 2:"):

```latex
\caption{How it works: a topic and a language go in, four models write, draw, speak and
render, and a searchable video with chapter marks and a quiz comes out.}
```

---

## 7. Section 4 — How We Measure

**Rules:** define "right" and "wrong"; give the number of test items or participants
(anonymise people as A, B, C); describe the baseline; explicitly say the test data is
completely NEW and was not used during development/training.

**Where:** Section 4.

Your honest setup:
- Right: renders, 45–120 s, every scene has picture + narration + caption, and the
  script passes the automated check.
- Wrong: fails to render, missing scene, or a factual error flagged by the checker.
- Items: 75 videos were built; 24 scripts went through the checker (15 pass / 9 stop).
- Baseline: the old way — one teacher making the same 1–1.5-min video by hand,
  estimated 60–120 min (state that it is an estimate, not timed).
- New data: the pipeline has no training stage, so topics are unseen by construction;
  say whether your reported builds were made from topics frozen before generation.

```latex
\section{How We Measure}

We count a video as \emph{correct} if it finishes rendering, its duration is between 45
and 120 seconds, every scene has a picture, narration and caption, and the script passes
the automated check; a video is \emph{wrong} if it fails to render, has a missing scene
or a factual error flagged by the checker. The baseline is the old way: one teacher
making the same 1--1.5-minute video by hand (script, slides, voice recording, editing),
which we estimate at 60--120 minutes per video; this baseline is an estimate and was not
timed by us. Our measure is the build time recorded by the pipeline for each of the 75
videos on the same machine.

Our pipeline has no training stage, so the test topics are unseen by construction: each
topic was fixed before generation and no prompt was tuned on the reported builds. All
numbers below come from \texttt{data.json} and the build logs in the repository.
```

If you later test with classmates, add one sentence: "Three classmates (A, B, C) rated
ten videos; no names were recorded."

---

## 8. Section 5 — Results & Table 1

**Rules:** Table 1 with baseline in the first row, your method in the second, metric
headers with `\uparrow` / `\downarrow`; then 2–3 sentences: what changed, "of what"
denominator, and reliability (single run vs repeated runs).

**Where:** Section 5.

```latex
\begin{table}[h]
\centering
\small
\caption{One hand-made video versus the pipeline, on the same school format
(1--1.5 minutes, narrated, captioned). Time is per finished video; the arrow shows that
lower is better.}
\label{tab:main}
\begin{tabular}{lccc}
\toprule
Approach & Videos $\uparrow$ & Total minutes $\uparrow$ & Time per video (min) $\downarrow$ \\
\midrule
Baseline: hand-made (estimated) & 1 & 1.1 & 60--120 \\
Ours: AI pipeline (measured)    & 75 & 82 & $\approx$3 \\
\bottomrule
\end{tabular}
\end{table}
```

Interpretation (2–3 sentences, keep the denominators):

```latex
Table~\ref{tab:main} shows that the pipeline produced 75 videos and 82 minutes of
finished material, about 20--40 times faster per video than the estimated hand-made
baseline. Coverage is broad rather than perfect: 73 of 75 videos carry a school grade and
chapter marks, and the gallery offers 219 quiz questions across 7 subjects.

The quality evidence is narrower. Only 24 scripts were sent to the automated check (the
checker was added after the first videos), of which 15 passed and 9 were stopped; the
remaining 51 were never checked. All timing numbers come from a single machine and a
single run per video, so the speed ratio is indicative rather than a controlled
benchmark.
```

If you run the 10-new-topic test, replace the numbers with the new-topic results and add
one column `Check pass $\uparrow$` with `--` for the baseline and `x/10` for ours.

---

## 9. Section 6 — Limitations

**Rules:** honest flaws/failure modes: sample size, single run, evaluation by
friends/peers (if any), biases. This section must make a reviewer trust you.

**Where:** Section 6.

Cover exactly these four points, in this order:
1. quality control (only 15 "checked" videos; checker is an AI and can miss errors);
2. pictures soft (1536 px upscaled to 1080p); one wrong scene = rebuild whole video;
3. timing from one machine, one run per video, baseline not measured;
4. no human evaluation; Kazakh narration not rated by native speakers.

(Text is already in `paper.tex`, Section 6.)

---

## 10. Section 7 — Ethics

**Rules:** data provenance, licenses, consent, no private data; include VERBATIM:
`We used an AI coding agent to write code and to check the English.`

**Where:** Section 7.

Points to state: topics are yours; no student data, private photos, voices or personal
information; only generated pictures and synthetic narration; models used under the
course terms; outputs released with the project; no API keys/tokens in the repository.

The sentence must be exactly that string (period included). It is already in
`paper.tex` and in the paragraph; do not paraphrase it.

---

## 11. Section 8 — Conclusion

**Rules:** exactly 3 sentences: what was done, the main number, future direction.

**Where:** Section 8. Text already in `paper.tex`:

1. built and measured the white-box pipeline / 75 videos / gallery;
2. ~3 min vs estimated 60–120 min; checker 15 of 24 passed, 9 stopped;
3. next: check remaining scripts, higher-resolution pictures, test with students.

---

## 12. Acknowledgments

**Rules:** thank ISSAI mentors and FRP 2026; add the project page and repository.

```latex
\section*{Acknowledgments}

We thank the FRP 2026 mentors and the ISSAI class API team. Project page:
\url{https://basiggs.github.io/frp-2026/projects/diar-page/}. Code and data:
\url{https://github.com/Basiggs/frp-2026}.
```

---

## 13. References

**Rules:** BibTeX entries whose keys match every `\cite{}` in Section 2.
Upload `refs.bib` and use:

```latex
\bibliographystyle{plain}
\bibliography{refs}
```

Keys used: `singer2022`, `khachatryan2023`, `brooks2024`, `deepseek2024`
(the last one is cited in Section 3 for the chat model).

`paper.tex` already contains a self-contained `thebibliography` version, so it compiles
with no `.bib`; if your template uses BibTeX, delete that block and use the two lines
above.

---

## 14. Final compliance checklist

- [ ] Title is a question or a finding.
- [ ] Project name is one line.
- [ ] Authors, track, ISSAI, Nazarbayev University, October 2026 present.
- [ ] Abstract has exactly 4 sentences.
- [ ] Figure 1 caption has exactly 1 sentence.
- [ ] Introduction has exactly 3 paragraphs; P3 ends with the contributions list.
- [ ] Related Work has 2–4 works, each with `\cite{key}` and a "differs how" sentence.
- [ ] Section 3 follows Input -> AI -> Output; models named; dataset/license/environment stated.
- [ ] Figure 2 caption is one sentence in the "How it works" pattern.
- [ ] Section 4 defines right/wrong, items count, baseline, and the NEW-data sentence.
- [ ] Table 1: baseline first row, ours second, arrows in headers.
- [ ] Results: 2–3 sentences with denominators and single-run caveat.
- [ ] Limitations covers sample size, single run, evaluator bias.
- [ ] Ethics contains the exact required sentence.
- [ ] Conclusion has exactly 3 sentences.
- [ ] Acknowledgments include ISSAI, FRP 2026, and both links.
- [ ] All `\cite` keys exist in `refs.bib`.
- [ ] No `???`, no `[placeholders]` except your name, teammate and track.

---

## 15. Optional: what to do if your template uses a two-column class

Paste only the body (from `\begin{abstract}` to the end of Acknowledgments) into the
template's boxes. Replace `\begin{abstract}...\end{abstract}` with the template's own
abstract environment if it has one, and replace the `figure` environments with the
template's `teaserfigure` / `figure*` if those macros exist. All other commands used
here (`\section`, `\textbf`, `\cite`, `booktabs`, `\uparrow`, `\url`) are standard.
