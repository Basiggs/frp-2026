# FRP 2026 — copy-paste boxes (School videos project)

Paste each block into the matching "Write here" box. Text is plain LaTeX-ready prose.
Edit only `[Your Name]`, `[Teammate's Name]`, `[Track Name]`.

---

## Title & authors

```latex
\begin{center}
{\LARGE\bfseries Can One Pipeline Turn a School Topic into a Finished Lesson Video in Three Languages?\par}
\vspace{4pt}
{\large A one-pipeline system for trilingual school lesson videos\par}
\vspace{8pt}
[Your Name]\quad [Teammate's Name]\\
Track: [Track Name]\\
ISSAI, Nazarbayev University\\
October 2026
\end{center}
```

---

## Abstract (exactly 4 sentences)

Students need far more short learning material than teachers can produce by hand,
especially in Kazakh, Russian and English. We built one pipeline in which a chat model
writes a lesson script, an AI checker reads it, an image model draws each scene, a speech
model narrates it, and ffmpeg renders a finished video with chapter marks, a quiz and a
gallery card. The pipeline produced 75 videos covering 7 school subjects (82 minutes,
219 quiz questions) at about 3 minutes of build time per video, whereas the same video
made by hand is estimated at 60--120 minutes. This matters because it lets one teacher
equip a whole class with multilingual, quiz-ready material in the time a single
hand-made video used to take.

---

## Introduction (3 short paragraphs)

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

---

## Related Work (3 sources)

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

---

## What we built (Input -> AI -> Output)

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

Figure 2 caption:

```latex
\caption{How it works: a topic and a language go in, four models write, draw, speak and
render, and a searchable video with chapter marks and a quiz comes out.}
```

---

## How we measure

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

GAP: no genuinely new held-out test has been run yet. To close it, freeze the prompts,
take 10 new topics, build them, and report time plus pass rate (x/10).

---

## Results (Table 1 + 2--3 sentences)

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

Table~\ref{tab:main} shows that the pipeline produced 75 videos and 82 minutes of
finished material, about 20--40 times faster per video than the estimated hand-made
baseline. Coverage is broad rather than perfect: 73 of 75 videos carry a school grade and
chapter marks, and the gallery offers 219 quiz questions across 7 subjects.

The quality evidence is narrower. Only 24 scripts were sent to the automated check (the
checker was added after the first videos), of which 15 passed and 9 were stopped; the
remaining 51 were never checked. All timing numbers come from a single machine and a
single run per video, so the speed ratio is indicative rather than a controlled
benchmark.

GAP: if you run the 10-topic held-out test, replace the table numbers with those results
and add a `Check pass $\uparrow$` column (`--` for the baseline, `x/10` for ours).

---

## Limitations

The main boundary is quality control: two thirds of the gallery was built before the
checker existed, so the ``checked'' badge covers only 15 videos, and the checker itself
is an AI model that can miss factual errors. Pictures are generated at 1536 px and
upscaled to 1080p, so they look soft on a large screen, and a wrong scene currently
means rebuilding the whole video rather than editing one frame. The speed comparison
uses an estimated baseline on one machine with no repeated runs, and no human evaluators
scored the videos; Kazakh narration in particular has not been rated by native speakers.
The next step is to run the checker on the remaining 51 scripts, regenerate pictures at
higher resolution, and test the result with a class of students.

---

## Ethics

All content is generated from curriculum topics written by us; no student data, private
photos, voice recordings or personal information were used or published, and the gallery
contains only generated pictures and synthetic narration. The models are accessed through
the class API under the course's terms, the generated outputs are released with the
project, and the code and metadata are public. The repository stores no API keys or
tokens. We used an AI coding agent to write code and to check the English.

---

## Conclusion (3 sentences)

We built and measured a white-box pipeline that turns a school topic into a narrated,
captioned, quiz-ready video in Kazakh, Russian or English, and released 75 such videos
in a searchable gallery. The pipeline reached about 3 minutes per video against an
estimated 60--120 minutes by hand, while the automated check passed 15 of 24 scripts and
stopped 9. Next we will check the remaining scripts, raise picture resolution, and
evaluate the videos with real students in class.

---

## Gaps to close before submission

1. NEW test data: run 10 held-out topics and put the real numbers in Table 1.
2. Baseline: time one hand-made video; replace 60--120 with the measured value.
3. Coverage: 51 of 75 scripts were never checked; state it (done) and fix if possible.
4. Human raters: optional, 3 classmates (A, B, C) rating 10 videos.
5. Model sizes: not public; the text already says so, which is acceptable.
6. Kazakh narration quality: not rated by native speakers; covered in Limitations.
