import json, urllib.parse

COUNT = 10


def hhmmss(sec):
    s = round(sec)
    return f"{s // 60}:{s % 60:02d}"


def main():
    videos = json.load(open("data.json"))["videos"][:COUNT]
    lines = [
        f"# Videos to check ({len(videos)})",
        "",
        "Teacher: ____________________    Date: ______________",
        "",
        "For each video: watch it, write a note if something is wrong, then mark **OK** or **not OK**.",
        "",
        "---",
        "",
    ]
    for i, v in enumerate(videos, 1):
        path = v["file"].replace(" ", "%20")
        link = urllib.parse.quote(v["file"])
        meta = []
        if v["lang"]:
            meta.append(v["lang"].upper())
        meta.append(hhmmss(v["seconds"]))
        if v.get("grade"):
            meta.append(f"grade {v['grade']}")
        if v.get("scenes"):
            meta.append(f"{v['scenes']} scenes")
        lines += [
            f"## {i}. {v['title']}",
            "",
            f"{' · '.join(meta)}",
            "",
            f"Video: [{path}]({link})",
            "",
            "Notes:",
            "",
            "",
            "",
            "**OK / not OK**",
            "",
            "---",
            "",
        ]
    open("check_list.md", "w").write("\n".join(lines))
    print(f"check_list.md: {len(videos)} videos")


main()
