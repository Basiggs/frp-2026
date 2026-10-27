import os, re, sys

DEFAULT = ["notes.txt", "results.txt"]


def show(path):
    if not os.path.exists(path):
        print(f"no file: {path} — put it in this folder")
        return 0, 0
    rows = 0
    print(f"\n== {path}")
    with open(path, encoding="utf-8") as f:
        for n, line in enumerate(f, 1):
            if not line.strip():
                continue
            nums = re.findall(r"\d+(?:[.,]\d+)?(?:\s*/\s*\d+)?", line)
            mark = "row " if nums else "text"
            print(f"  [{mark}] {n}: {line.strip()}")
            if nums:
                print(f"         numbers: {', '.join(nums)}")
            rows += 1
    return rows, 0


def main():
    files = sys.argv[1:] or DEFAULT
    total = 0
    for path in files:
        total += show(path)[0]
    print(f"\n{total} non-empty lines in {len(files)} file(s)")


main()
