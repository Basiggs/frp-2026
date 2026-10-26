import json, os, re, subprocess, sys, time

TOPICS = [
    ("Площадь прямоугольника", "ru", 4),
    ("Area of a rectangle", "en", 4),
    ("Сложение дробей", "ru", 6),
    ("Adding fractions", "en", 6),
    ("Фотосинтез", "ru", 6),
    ("Photosynthesis", "en", 6),
    ("Круговорот воды в природе", "ru", 4),
    ("The water cycle", "en", 4),
    ("Настоящее простое время", "ru", 5),
    ("Present Simple", "en", 5),
    ("Плотность", "ru", 7),
    ("Density", "en", 7),
    ("Умножение двузначных чисел", "ru", 4),
    ("Multiplying two-digit numbers", "en", 4),
    ("Части речи", "ru", 5),
    ("Parts of speech", "en", 5),
    ("Солнечная система", "ru", 4),
    ("The solar system", "en", 4),
    ("Окружность: радиус и диаметр", "ru", 5),
    ("Circle: radius and diameter", "en", 5),
    ("Сложение и вычитание до 100", "ru", 3),
    ("Adding and subtracting to 100", "en", 3),
    ("Проценты", "ru", 6),
    ("Percentages", "en", 6),
    ("Теорема Пифагора", "ru", 8),
    ("Pythagorean theorem", "en", 8),
    ("Квадратные уравнения", "ru", 8),
    ("Quadratic equations", "en", 8),
    ("Умножение на 10 и 100", "ru", 3),
    ("Multiplying by 10 and 100", "en", 3),
    ("Периметр", "ru", 4),
    ("Perimeter", "en", 4),
    ("Пропорции", "ru", 6),
    ("Proportions", "en", 6),
    ("Средняя скорость", "ru", 7),
    ("Average speed", "en", 7),
    ("Площадь круга", "ru", 8),
    ("Area of a circle", "en", 8),
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
    t0 = time.time()
    print(f"=== {topic} ({lang}, grade {grade})", flush=True)
    r = subprocess.run([sys.executable, "make_video.py", topic, "--lang", lang])
    if r.returncode != 0 or not os.path.exists(out):
        print(f"FAILED: {topic} ({lang})", flush=True)
        continue
    grades[os.path.basename(out)] = grade
    save_grades()
    print(f"=== {os.path.basename(out)}: {time.time() - t0:.0f} s", flush=True)

subprocess.run([sys.executable, "make_gallery.py"], check=True)
print("batch done", flush=True)
