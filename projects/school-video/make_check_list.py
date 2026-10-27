import json, os, re

import make_video

COUNT = 10

TOPICS = [
    ("math", "Pythagorean theorem", ["pythagorean-theorem-en", "теорема-пифагора-ru"]),
    ("chemistry", "Density", ["density-en", "плотность-ru"]),
    ("biology", "Photosynthesis", ["photosynthesis-en", "фотосинтез-ru"]),
    ("history", "Ancient Rome", ["ancient-rome-en", "древний-рим-ru"]),
    ("languages", "Present Simple", ["present-simple-en", "настоящее-простое-время-ru"]),
]


def hhmmss(sec):
    s = round(sec)
    return f"{s // 60}:{s % 60:02d}"


def by_stem():
    videos = json.load(open("data.json"))["videos"]
    return {os.path.splitext(os.path.basename(v["file"]))[0]: v for v in videos}


def status(v):
    stem = os.path.splitext(os.path.basename(v["file"]))[0]
    slug, lang = stem.rsplit("-", 1)
    run = os.path.join("runs", slug)
    if not os.path.exists(os.path.join(run, "script.json")):
        return "no script"
    path = os.path.join(run, "check.json")
    if not os.path.exists(path):
        print(f"  checking {stem} ...", flush=True)
        data = json.load(open(os.path.join(run, "script.json")))
        make_video.check_script(data, v["title"], v["lang"], run)
    c = json.load(open(path))
    return "ok" if c.get("ok") else "stopped"


def other_videos(subject, lang, used):
    videos = json.load(open("data.json"))["videos"]
    for v in videos:
        stem = os.path.splitext(os.path.basename(v["file"]))[0]
        if v.get("course") == subject and v.get("lang") == lang and stem not in used:
            yield v


def main():
    videos = by_stem()
    chosen = []
    for subject, topic, stems in TOPICS:
        for stem in stems:
            v = videos.get(stem)
            if not v:
                print(f"{topic:22} {subject:10} missing data.json entry: {stem}")
                continue
            st = status(v)
            if st != "ok":
                print(f"{topic:22} {v['lang']:2} {v['title'][:40]:42} {st} -> looking for another {subject} video")
                seen = {s for _, _, ss in TOPICS for s in ss}
                for alt in other_videos(subject, v["lang"], seen):
                    seen.add(os.path.splitext(os.path.basename(alt["file"]))[0])
                    ast = status(alt)
                    print(f"{'':22} {alt['lang']:2} {alt['title'][:40]:42} {ast}")
                    if ast == "ok":
                        chosen.append((subject, topic, alt, ast))
                        v = alt
                        break
                else:
                    print(f"{'':22} no passing {subject} video in {v['lang'].upper()} yet")
                    chosen.append((subject, topic, v, st))
                    continue
            else:
                chosen.append((subject, topic, v, st))
    ok = [c for c in chosen if c[3] == "ok"]
    print(f"\n{len(ok)} of {COUNT} ready (passed the check), {len(chosen)} candidates found")


main()
