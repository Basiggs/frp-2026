import json, os, re, subprocess, sys

TOPICS = [
    ("DNA and inheritance", "en", 9),
    ("Клеточное дыхание", "ru", 10),
    ("Cellular respiration", "en", 10),
    ("Спрос и предложение", "ru", 10),
    ("Mendel's laws of inheritance", "en", 11),
    ("Магнитное поле", "ru", 11),
    ("Пределы", "ru", 12),
]

grades = json.load(open("grades.json")) if os.path.exists("grades.json") else {}


def slug(topic):
    return re.sub(r"[^\w\-]+", "-", topic.lower(), flags=re.UNICODE).strip("-")[:50] or "video"


def save_grades():
    json.dump(grades, open("grades.json", "w"), ensure_ascii=False, indent=2)


for topic, lang, grade in TOPICS:
    out = os.path.join("out", f"{slug(topic)}-{lang}.mp4")
    if os.path.exists(out):
        print(f"=== skip {out} (already there)", flush=True)
        grades[os.path.basename(out)] = grade
        save_grades()
        continue
    print(f"=== {topic} ({lang}, grade {grade})", flush=True)
    r = subprocess.run([sys.executable, "make_video.py", topic, "--lang", lang])
    if r.returncode != 0 or not os.path.exists(out):
        print(f"FAILED: {topic} ({lang})", flush=True)
        continue
    grades[os.path.basename(out)] = grade
    save_grades()
    print(f"=== {os.path.basename(out)}: done", flush=True)

subprocess.run([sys.executable, "make_gallery.py"], check=True)
print("batch done", flush=True)
