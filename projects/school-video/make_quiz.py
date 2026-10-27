import glob, json, os, re, sys, urllib.request

API = "http://127.0.0.1:19040/v1"
QUIZZES = "quizzes"

SYSTEM = "You write short school tests. You answer with JSON only, no other text."

PROMPT = """Here is the script of a 1-minute school explainer video.
Topic: {title}
Scenes:
{scenes}

Write 3 short multiple-choice questions for a student who watched this video.
Answer with JSON only:
{{"questions": [{{"q": "question", "options": ["...", "...", "...", "..."], "answer": 0, "why": "one short sentence"}}]}}
- exactly 4 options per question, only one is right.
- "answer" is the position of the right option, starting at 0.
- every number and formula in the questions must be correct and must come from the script.
- the language of the questions is the language of the script."""


def post(path, body):
    req = urllib.request.Request(API + path, json.dumps(body).encode(),
                                 {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"{path} failed {e.code}: {e.read().decode()[:400]}")


def make_quiz(script):
    text = "\n".join(f"{i}. {s['narration']} [{s.get('math', '')}]"
                     for i, s in enumerate(script["scenes"], 1))
    body = {"model": "DeepSeek-V4.1-Flash", "max_tokens": 4000,
            "messages": [{"role": "system", "content": SYSTEM},
                         {"role": "user", "content": PROMPT.format(
                             title=script.get("title", ""), scenes=text)}]}
    for attempt in (1, 2):
        raw = post("/chat/completions", body)
        answer = json.loads(raw)["choices"][0]["message"]["content"] or ""
        m = re.search(r"\{.*\}", answer, re.S)
        try:
            qs = json.loads(m.group(0))["questions"]
            good = [q for q in qs if len(q.get("options", [])) == 4 and 0 <= q.get("answer", -1) < 4]
            if len(good) >= 3:
                return good[:3]
            print(f"  attempt {attempt}: {len(good)} good questions, asking again")
        except Exception as e:
            print(f"  attempt {attempt}: bad JSON ({e})")
    return None


def main():
    os.makedirs(QUIZZES, exist_ok=True)
    made = 0
    for path in sorted(glob.glob("out/*.mp4")):
        stem = os.path.basename(path)[:-4]
        target = os.path.join(QUIZZES, stem + ".json")
        if os.path.exists(target):
            continue
        m = re.search(r"-(ru|en|kk)$", stem)
        slug = stem[: -len(m.group(1)) - 1] if m else stem
        script_path = os.path.join("runs", slug, "script.json")
        if not os.path.exists(script_path):
            print(f"skip {stem}: no script.json")
            continue
        questions = make_quiz(json.load(open(script_path)))
        if not questions:
            print(f"FAILED {stem}: no questions")
            continue
        json.dump({"questions": questions}, open(target, "w"), ensure_ascii=False, indent=2)
        print(f"quiz {stem}: {len(questions)} questions")
        made += 1
    print(f"done: {made} new quizzes")


main()
