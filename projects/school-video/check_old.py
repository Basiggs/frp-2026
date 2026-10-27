import glob, json, os, re, sys

import make_video

OUT = "out"
REPORT = "check_old.md"


def slug_lang(stem):
    m = re.search(r"-(ru|en)$", stem)
    if m:
        return stem[: -len(m.group(1)) - 1], m.group(1)
    return stem, "ru"


def videos():
    paths = sorted(glob.glob(os.path.join(OUT, "*.mp4")) + glob.glob(os.path.join(OUT, "*.webm")))
    rows = []
    for path in paths:
        stem = os.path.splitext(os.path.basename(path))[0]
        slug, lang = slug_lang(stem)
        rows.append({"file": os.path.basename(path), "slug": slug, "lang": lang})
    return rows


def write_md(done):
    lines = ["# Check of the old videos' scripts", "",
             "| video | lang | result |", "|---|---|---|"]
    for r in done:
        lines.append(f"| {r['file']} | {r['lang']} | {r['ok']} |")
    problems = [r for r in done if not r["ok"]]
    if problems:
        lines += ["", "## Problems", ""]
        for r in problems:
            lines.append(f"**{r['file']}**")
            if r["problems"]:
                for p in r["problems"]:
                    lines.append(f"- {p}")
            else:
                lines.append("- the checker stopped this script (no details)")
            lines.append("")
    with open(REPORT, "w") as f:
        f.write("\n".join(lines).rstrip() + "\n")


def main():
    for v in videos():
        run = os.path.join("runs", v["slug"])
        sc = os.path.join(run, "script.json")
        if not os.path.exists(sc) or os.path.exists(os.path.join(run, "check.json")):
            continue
        data = json.load(open(sc))
        topic = data.get("title") or v["slug"]
        print(f"check {v['file']} ({v['lang']}) ...", flush=True)
        ok, problems = make_video.check_script(data, topic, v["lang"], run)
        print(("  ok" if ok else "  stopped"), flush=True)
        write_md([{"file": v["file"], "lang": v["lang"], "ok": "ok" if ok else "stopped",
                   "problems": problems}])
        print(f"wrote {REPORT} and {os.path.join(run, 'check.json')}", flush=True)
        return
    print("nothing to check: every video with a script already has check.json")


if __name__ == "__main__":
    main()
