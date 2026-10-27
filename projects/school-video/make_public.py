import glob, json, os, re, shutil, time

PRJ = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(PRJ, "public-site")
MAX_N = 12
MAX_TOTAL = 200 * 1024 * 1024
MAX_ONE = 50 * 1024 * 1024


def passed():
    runs = set()
    for p in glob.glob(os.path.join(PRJ, "runs", "*", "check.json")):
        try:
            if json.load(open(p)).get("ok"):
                runs.add(os.path.basename(os.path.dirname(p)))
        except Exception as e:
            print("  skip broken", p, e)
    return runs


def base(slug):
    return re.sub(r"-(ru|en)$", "", slug)


def main():
    passed_runs = passed()
    data = json.load(open(os.path.join(PRJ, "data.json")))
    videos, skipped, total = [], [], 0
    for v in data["videos"]:
        stem = os.path.splitext(os.path.basename(v["file"]))[0]
        if base(stem) not in passed_runs:
            continue
        src = os.path.join(PRJ, v["file"])
        size = os.path.getsize(src)
        if len(videos) >= MAX_N:
            skipped.append((v["file"], "more than 12 videos"))
            continue
        if size > MAX_ONE:
            skipped.append((v["file"], f"{size // 1048576} MB is over the 50 MB limit"))
            continue
        if total + size > MAX_TOTAL:
            skipped.append((v["file"], "the folder would pass 200 MB"))
            continue
        if time.time() - os.path.getmtime(src) < 120:
            skipped.append((v["file"], "still being rebuilt"))
            continue
        videos.append(v)
        total += size

    if os.path.exists(PUB):
        shutil.rmtree(PUB)
    os.makedirs(os.path.join(PUB, "posters"), exist_ok=True)

    for v in videos:
        src = os.path.join(PRJ, v["file"])
        shutil.copy2(src, os.path.join(PUB, os.path.basename(v["file"])))
        pst = v.get("poster")
        if pst and os.path.exists(os.path.join(PRJ, pst)):
            shutil.copy2(os.path.join(PRJ, pst), os.path.join(PUB, pst))

    for name in ("style.css", "common.js"):
        shutil.copy2(os.path.join(PRJ, name), os.path.join(PUB, name))

    html = open(os.path.join(PRJ, "index.html")).read()
    html = html.replace('          <a href="create.html">Create &amp; upload</a>\n', "")
    open(os.path.join(PUB, "index.html"), "w").write(html)

    js = open(os.path.join(PRJ, "gallery.js")).read()
    js = js.replace('<a href="create.html">Make it on the Create page</a>', "Make it in class.")
    js = js.replace('on the <a href="create.html">Create page</a>', "in class")
    open(os.path.join(PUB, "gallery.js"), "w").write(js)

    json.dump({"videos": videos}, open(os.path.join(PUB, "data.json"), "w"),
              ensure_ascii=False, indent=1)

    names = {os.path.splitext(os.path.basename(v["file"]))[0] for v in videos}
    tracks = json.load(open(os.path.join(PRJ, "tracks.json")))["tracks"]
    kept = []
    for t in tracks:
        slugs = [x for x in t["slugs"] if x in names]
        if len(slugs) >= 2:
            kept.append(dict(t, slugs=slugs))
    json.dump({"tracks": kept}, open(os.path.join(PUB, "tracks.json"), "w"),
              ensure_ascii=False, indent=1)

    print(f"public-site: {len(videos)} videos, {total / 1048576:.1f} MB")
    for v in videos:
        print("  " + v["file"])
    for name, why in skipped:
        print(f"  left out: {name} ({why})")


main()
