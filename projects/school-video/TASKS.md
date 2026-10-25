# School topics as videos: tasks for the week (Diar, s17)

**Idea:** type any school topic ("Арифметическая прогрессия", "Newton's second law"): the app makes a correct
1-minute explainer video in Russian or English, with pictures, a voice and the math shown step by step. For students,
and for teachers.
**Track:** Agents and games (an AI pipeline that makes content).

**Day 1 (great start):** `out/arifmeticheskaya-progressiya.mp4`: 28 s, 1080p, 3 scenes (class image model + class
voice + captions, slow zoom and fades). The math in the captions is right.
**What is missing:** the pictures do not show the math (an empty board, blocks without numbers, an empty notebook);
everything is in one caption line, and the formula is plain text. And every step was done by hand.

**Demo Day claim (measure it, then fill in):** "From one line, my app makes a 1-minute explainer in Russian or English
in X minutes, for free. In 10 videos a teacher found Y mistakes. 6 classmates got Z of 5 quiz answers right after
watching (W of 5 before)."

You do not need a fal key: use the class models (pictures: skill image-gen, voice: materials/SPEECH-API.md). The
`fal-video-skill.zip` is a good example: unzip it and reuse `template/web/index.html` and `template/render.cjs`
(a web page with `seek(t)`, filmed frame by frame).

## Tasks

1. **Day 2 - One command, no hand work.** `python3 make_video.py "Арифметическая прогрессия" --lang ru`:
   (a) the class chat model writes the script as JSON: 4-6 scenes, each with the narration, the math to show on
   screen, and a picture prompt; (b) the pictures (no text in them: AI pictures write formulas wrong); (c) the voice;
   (d) your `build.py` makes the video.
   Done when: one command makes a new video for a topic you did not try before.
   Use: the class chat model, skill image-gen, materials/SPEECH-API.md.

2. **Day 3 - Show the math, in time with the voice.** A scene page (HTML + JavaScript) on top of the picture: numbers
   appear on the blocks (2, 5, 8, 11), "+3" arrows move between them, the formula is written properly (KaTeX:
   a_n = a_1 + (n-1)d). Film the page frame by frame (`render.cjs`, Chrome is in your workspace) and put the voice
   under it. Use the word times from speech recognition to show each thing when the voice says it.
   Done when: scene 2 shows the numbers and arrows at the moment the voice says them.
   Use: materials/SPEECH-API.md (word times), skill page-check.

3. **Day 3-4 - Check the content.** Before the video is made, a second request to the chat model checks the script:
   facts, numbers, formulas, the level for the grade. A wrong script stops the video.
   Done when: you give it 3 scripts with a mistake on purpose, and it stops all 3.
   Use: the class chat model.

4. **Day 4 - 10 videos.** 5 topics (math, physics, chemistry, history, English grammar), each in Russian and in
   English. Measure how long each takes.
   Done when: 10 videos in `out/`, with the time of each.

5. **Day 5 - Test (measure the main promise).** (a) A teacher or a mentor watches the 10 videos and counts the
   mistakes. (b) 6 classmates: a 5-question quiz on one topic, then the 1-minute video, then the same quiz.
   Done when: `results.md`: mistakes per video, quiz before and after, minutes per video.

6. **Day 6 - Fix the worst problem, make a page.** A page: type a topic, choose the language, press Make: the
   progress, then the video plays (live from your workspace). Public: `frp-publish` a page with your best videos
   (materials/DEPLOY.md).
   Done when: a classmate makes a video by himself with your page.
   Use: skill page-check.

7. **Day 7 - Talk.** Show one video live, then the numbers: mistakes, quiz, time, cost (0 tenge with the class
   models).

## Risks

- **Real AI video clips (moving video from a model)** are not in our class models, and paid services cost money.
  Backup: pictures + slow zoom + animated math is clear and free; say "AI video clips" is the next step.
- **Filming the page is slow** on 4 CPUs. Backup: 720p and 15 frames per second for drafts, 1080p only for the final.
- **The model explains a topic wrong.** Backup: the check in task 3, plus a teacher's eye on Day 5; never publish an
  unchecked video.
