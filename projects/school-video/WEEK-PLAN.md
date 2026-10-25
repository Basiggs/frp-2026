# School topics as videos: your plan for the week

**Who:** Diar (s17)

**Goal:** Type any school topic. The app makes a correct 1-minute video in Russian or English: pictures, a voice, and the math shown step by step.

**On Demo Day (Sat 31 Oct) you say:** "From one line, my app makes a 1-minute video in X minutes, for free. A teacher found Y mistakes in 10 videos. 6 classmates got Z of 5 quiz answers right after the video (W before)."

**Now:** Your first video (arithmetic progression, 28 s) works. Now: the pictures must show the math, and one command must do everything.

## How to start

1. Open your workspace: https://kitan-a.com/frp/s17/ and log in.
2. Find the terminal at the bottom of the window. OpenCode starts there by itself. No terminal? Press Ctrl + ` (the key under Esc) or click the menu ☰ > Terminal > New Terminal. Then type opencode and press Enter.
3. Copy the text of your task from this file. Paste it into OpenCode (Ctrl + V, or right-click > Paste) and press Enter. Answer its questions.
4. When the plan looks right, type /build and press Enter. Type /build again until the task is done.
5. Check the result yourself. Then type /save (a save point).

Stuck? Type /fix and write what you see, or paste the red error. Or ask a mentor.

## Tasks

### 1. Day 2: One command makes a video

- Type a topic and a language. The AI writes the script, then the pictures and the voice are made, then build.py makes the video.

Type this in OpenCode:

```
/plan In projects/school-video: make make_video.py "<topic>" --lang ru|en. (a) The class chat model writes the script as JSON: 4-6 scenes, each with narration, the math to show, and a picture prompt. (b) Pictures with the class image model, with no text in them. (c) The class voice. (d) build.py makes the video.
```

**Done when:** One command makes a video for a new topic.

### 2. Day 3: Show the math at the right moment

- Numbers appear on the blocks, arrows move, the formula is written properly.
- Each thing appears when the voice says it.

Type this in OpenCode:

```
/plan In projects/school-video: make an HTML scene page that draws the math on top of the picture (numbers, +3 arrows, the formula with KaTeX) and appears when the voice says it (word times from speech recognition, see ~/work/materials/SPEECH-API.md). Film the page frame by frame (like render.cjs in fal-video-skill.zip) and add the voice.
```

**Done when:** Scene 2 shows the numbers and arrows when the voice says them.

### 3. Day 3-4: Check the content

- Before the video is made, a second AI request checks the script: facts, numbers, formulas.
- A wrong script stops the video.

Type this in OpenCode:

```
/plan In make_video.py: before making the video, ask the class chat model to check the script (facts, numbers, formulas, grade level) and answer JSON {ok, problems}. If not ok, stop.
```

**Done when:** 3 scripts with a mistake on purpose: all 3 are stopped.

### 4. Day 4: 10 videos

- 5 topics (math, physics, chemistry, history, English grammar), each in Russian and English.
- Measure how long each one takes.

Type this in OpenCode:

```
/plan Run make_video.py for 5 topics (math, physics, chemistry, history, English grammar) in Russian and English. Save the videos in out/ and the minutes for each in times.md.
```

**Done when:** 10 videos in out/, with the time of each.

### 5. Day 5: Test day

- A teacher or mentor watches the 10 videos and counts the mistakes.
- 6 classmates: a 5-question quiz, then the video, then the same quiz.

Type this in OpenCode:

```
/plan Make a 5-question quiz page for one of my topics, and write results.md: mistakes per video, quiz before and after, minutes per video.
```

**Done when:** results.md has the numbers.

### 6. Day 6-7: Page and talk

- A page: type a topic, choose a language, press Make, watch the video.
- Show one video live, then your numbers.

Type this in OpenCode:

```
/plan Make a page for projects/school-video: a topic box, a language choice, a Make button, the progress, then the video. Also a public page with my best videos (frp-publish, see ~/work/materials/DEPLOY.md).
```

**Done when:** A classmate makes a video alone with your page.

## Watch out

- You do not need fal: use the class image and voice models.
- Never publish a video that nobody checked.
