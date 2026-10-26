import argparse, base64, json, os, re, subprocess, sys, textwrap, urllib.request

API = "http://127.0.0.1:19040/v1"
LANG = {"ru": "Russian", "en": "English"}
FRP_IMG = os.path.expanduser("~/.agents/skills/image-gen/frp-img")

SYSTEM = (
    "You write short school explainer videos. You answer with JSON only, no other text. "
    "Every formula and every number in the script must be correct."
)

PROMPT = """Topic: "{topic}"
Language of the narration: {lang}.
Write {n} scenes for a 1-minute explainer video for school students.
Answer with JSON only:
{{"title": "short title", "scenes": [{{"narration": "...", "math": "...", "picture": "..."}}]}}
- narration: one or two spoken sentences, 20 to 35 words (about 9 seconds), in {lang}.
- math: the formula or the numbers to show on screen for this scene (for example "a = F / m").
- picture: an English prompt for a photo or illustration of the scene. Describe what the thing is and how it looks.
  The picture must have NO text, NO letters, NO numbers and NO formulas in it.
Make the scenes build the idea step by step: the idea, an example with numbers, the formula, one thing for the student."""


CHECK = """You are a strict school textbook editor. Check the script of a school explainer video.
Topic: "{topic}"
Language: {lang}
Scenes:
{scenes}

Check all of it:
- facts: nothing false or made up;
- numbers: every arithmetic result must be correct;
- formulas: correct and used correctly;
- level: simple school material, not university level.
Answer with JSON only:
{{"ok": true, "problems": []}}
or
{{"ok": false, "problems": ["scene 2: 5 x 3 = 20 is wrong, it is 15"]}}
Write one problem per string, name the scene, and say what is wrong. Be strict about numbers and formulas.
Do not report style or missing pictures.
The last scene may ask the student a question and leave the value open (for example "4 x 4 = ?").
That is allowed: report only a result that is written out and wrong."""


def post(path, body, raw=False, timeout=300):
    req = urllib.request.Request(API + path, json.dumps(body).encode(),
                                 {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"{path} failed {e.code}: {e.read().decode()[:500]}")
    return data if raw else json.loads(data)


def slug(topic):
    s = re.sub(r"[^\w\-]+", "-", topic.lower(), flags=re.UNICODE).strip("-")
    return s[:50] or "video"


def script(topic, lang):
    body = {"model": "DeepSeek-V4.1-Flash", "max_tokens": 4000,
            "messages": [{"role": "system", "content": SYSTEM},
                         {"role": "user", "content": PROMPT.format(
                             topic=topic, lang=LANG[lang], n="4 to 6")}]}
    for attempt in (1, 2):
        text = post("/chat/completions", body)["choices"][0]["message"]["content"]
        m = re.search(r"\{.*\}", text or "", re.S)
        try:
            data = json.loads(m.group(0))
            scenes = data["scenes"]
            if 4 <= len(scenes) <= 6:
                return data
            print(f"script attempt {attempt}: {len(scenes)} scenes, asking again")
        except Exception as e:
            print(f"script attempt {attempt}: bad JSON ({e})")
    sys.exit("the chat model did not give a usable script")


def check_script(data, topic, lang):
    scenes = "\n".join(f"{i}. {s['narration']} [math: {s['math']}]"
                       for i, s in enumerate(data["scenes"], 1))
    body = {"model": "DeepSeek-V4.1-Flash", "max_tokens": 4000,
            "messages": [{"role": "system", "content": SYSTEM},
                         {"role": "user", "content": CHECK.format(
                             topic=topic, lang=LANG[lang], scenes=scenes)}]}
    text = post("/chat/completions", body)["choices"][0]["message"]["content"] or ""
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        sys.exit("the checker did not answer JSON:\n" + text[:300])
    verdict = json.loads(m.group(0))
    return bool(verdict.get("ok")), [str(p) for p in (verdict.get("problems") or [])]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("topic")
    ap.add_argument("--lang", choices=["ru", "en"], default="ru")
    a = ap.parse_args()

    run = os.path.join("runs", slug(a.topic))
    for d in ("img", "audio", "cap"):
        os.makedirs(os.path.join(run, d), exist_ok=True)
    out = os.path.join("out", f"{slug(a.topic)}-{a.lang}.mp4")

    print(f"1/4 script ({a.topic}, {a.lang}) ...", flush=True)
    data = script(a.topic, a.lang)
    json.dump(data, open(os.path.join(run, "script.json"), "w"), ensure_ascii=False, indent=2)
    print(f"    {data.get('title', a.topic)}: {len(data['scenes'])} scenes", flush=True)

    print("2/4 check the script ...", flush=True)
    ok, problems = check_script(data, a.topic, a.lang)
    if not ok:
        print("check failed:", flush=True)
        for problem in problems:
            print("  -", problem, flush=True)
        sys.exit("stopped: the script has mistakes, so no video was made")
    print("    check ok", flush=True)

    print("3/4 pictures and voice ...", flush=True)
    manifest = {"out": out, "scenes": []}
    for i, sc in enumerate(data["scenes"], 1):
        img = os.path.join(run, "img", f"s{i}.jpg")
        prompt = sc["picture"] + ", no text, no letters, no numbers, no formulas, no writing"
        subprocess.run([FRP_IMG, prompt, "-s", "1536x864", "-o", img], check=True)
        audio = os.path.join(run, "audio", f"v{i}.wav")
        wav = post("/audio/speech", {"input": sc["narration"], "language": a.lang}, raw=True)
        open(audio, "wb").write(wav)
        cap = os.path.join(run, "cap", f"c{i}.txt")
        text = "\n".join(textwrap.wrap(sc["narration"], 58))
        open(cap, "w").write(text)
        manifest["scenes"].append({"img": img, "audio": audio, "cap": cap})
        print(f"    scene {i}: picture + voice + caption ({sc['math']})", flush=True)

    mp = os.path.join(run, "manifest.json")
    json.dump(manifest, open(mp, "w"), ensure_ascii=False, indent=2)

    print("4/4 video ...", flush=True)
    subprocess.run([sys.executable, "build.py", mp], check=True)
    subprocess.run([sys.executable, "make_quiz.py"], check=True)
    subprocess.run([sys.executable, "make_gallery.py"], check=True)
    print(f"done: {out}")


if __name__ == "__main__":
    main()
