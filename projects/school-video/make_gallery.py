import glob, json, os, re, subprocess

OUT = "out"
POSTERS = "posters"


def dur(path):
    return float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "csv=p=0", path]).decode().strip())


def probe(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", path]).decode().strip()
    w, h = out.split("x")[:2]
    return int(w), int(h)


def title_for(stem, slug):
    sc = os.path.join("runs", slug, "script.json")
    if os.path.exists(sc):
        d = json.load(open(sc))
        return d.get("title") or stem
    for folder in (stem, slug):
        meta = os.path.join("runs", folder, "meta.json")
        if os.path.exists(meta):
            d = json.load(open(meta))
            if d.get("title"):
                return d["title"]
    t = re.sub(r"-(\d+min)$", r" (\1)", stem).replace("-", " ")
    return t[:1].upper() + t[1:]


def main():
    os.makedirs(POSTERS, exist_ok=True)
    grades = json.load(open("grades.json")) if os.path.exists("grades.json") else {}
    courses = json.load(open("courses.json")) if os.path.exists("courses.json") else {}
    videos = []
    files = glob.glob(os.path.join(OUT, "*.mp4")) + glob.glob(os.path.join(OUT, "*.webm"))
    for path in sorted(files):
        stem = os.path.splitext(os.path.basename(path))[0]
        m = re.search(r"-(ru|en)$", stem)
        lang = m.group(1) if m else ""
        slug = stem[: -len(lang) - 1] if lang else stem
        seconds = dur(path)
        w, h = probe(path)
        poster = os.path.join(POSTERS, stem + ".jpg")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{min(3, seconds / 3):.2f}",
                        "-i", path, "-frames:v", "1", "-q:v", "3", poster], check=True)
        sc = os.path.join("runs", slug, "script.json")
        scenes = len(json.load(open(sc))["scenes"]) if os.path.exists(sc) else None
        qz = os.path.join("quizzes", stem + ".json")
        quiz = json.load(open(qz))["questions"] if os.path.exists(qz) else None
        course = courses.get(slug, "")
        meta_path = os.path.join("runs", slug, "meta.json")
        if not course and os.path.exists(meta_path):
            course = json.load(open(meta_path)).get("course", "")
        videos.append({
            "file": path.replace(os.sep, "/"),
            "poster": poster.replace(os.sep, "/"),
            "title": title_for(stem, slug),
            "lang": lang,
            "seconds": round(seconds, 1),
            "width": w, "height": h,
            "scenes": scenes,
            "grade": grades.get(os.path.basename(path)),
            "course": course,
            "quiz": quiz,
            "modified": int(os.path.getmtime(path)),
        })
    videos.sort(key=lambda v: v["modified"], reverse=True)
    json.dump({"videos": videos}, open("data.json", "w"), ensure_ascii=False, indent=2)
    print(f"data.json: {len(videos)} videos")


main()
