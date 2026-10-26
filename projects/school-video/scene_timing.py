import json, os, re, subprocess, sys

SLUG = sys.argv[1] if len(sys.argv) > 1 else "квадрат-и-куб-числа"
N = int(sys.argv[2]) if len(sys.argv) > 2 else 2
LANG = sys.argv[3] if len(sys.argv) > 3 else "ru"
RUN = os.path.join("runs", SLUG)
FONT = "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"
PAD = 0.5
FPS = 30
OUTDIR = "timing"

UNITS = ["ноль", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять",
         "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать",
         "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"]
TENS = {20: "двадцать", 30: "тридцать", 40: "сорок", 50: "пятьдесят", 60: "шестьдесят",
        70: "семьдесят", 80: "восемьдесят", 90: "девяносто", 100: "сто"}
EN_UNITS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
            "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
            "seventeen", "eighteen", "nineteen"]
EN_TENS = {20: "twenty", 30: "thirty", 40: "forty", 50: "fifty", 60: "sixty",
           70: "seventy", 80: "eighty", 90: "ninety", 100: "hundred"}


def num_words(n, lang):
    units, tens = (UNITS, TENS) if lang == "ru" else (EN_UNITS, EN_TENS)
    if n < 20:
        return [units[n]]
    if n in tens:
        return [tens[n]]
    t, u = n - n % 10, n % 10
    if t in tens and u:
        return [tens[t], units[u]]
    return [str(n)]


def clean(w):
    return re.sub(r"[^\w]", "", w.lower(), flags=re.UNICODE)


def asr(wav):
    js = wav[:-4] + ".json"
    if not os.path.exists(js):
        subprocess.run(["frp-asr", wav, "--lang", LANG, "--words"], check=True)
    d = json.load(open(js))
    words = d.get("words")
    if not words:
        words = [w for s in d.get("segments", []) for w in s.get("words", [])]
    return words


def find_time(words, math, lang):
    nums = [int(x) for x in re.findall(r"\d+", math)]
    for num in nums:
        for w in words:
            if clean(w["word"]) == str(num):
                return w["start"], num, str(num)
        target = [clean(w) for w in num_words(num, lang)]
        for i in range(len(words) - len(target) + 1):
            ok = True
            for j, t in enumerate(target):
                seen = clean(words[i + j]["word"])
                if not seen or seen[:4] != t[:4]:
                    ok = False
                    break
            if ok:
                return words[i]["start"], num, " ".join(target)
    return None, None, None


def wrap(text, width=46):
    words, lines, line = text.split(), [], ""
    for w in words:
        if len(line) + len(w) + 1 > width and line:
            lines.append(line)
            line = w
        else:
            line = (line + " " + w).strip()
    if line:
        lines.append(line)
    return "\n".join(lines)


def main():
    script = json.load(open(os.path.join(RUN, "script.json")))
    scene = script["scenes"][N - 1]
    math = scene["math"]
    wav = os.path.join(RUN, "audio", f"v{N}.wav")
    words = asr(wav)

    store = os.path.join(RUN, "words.json")
    data = json.load(open(store)) if os.path.exists(store) else {}
    data[f"v{N}"] = words
    json.dump(data, open(store, "w"), ensure_ascii=False, indent=2)

    t, num, phrase = find_time(words, math, LANG)
    print(f"{SLUG} scene {N}: math {math!r}")
    for w in words:
        mark = "  <-- formula appears here" if t is not None and abs(w["start"] - t) < 1e-6 else ""
        print(f"  {w['start']:6.2f}  {w['word']}{mark}")
    if t is None:
        sys.exit(f"no number word found for {math!r}")
    print(f"math appears at {t:.2f}s (number {num} = {phrase!r})")

    dur = float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "csv=p=0", wav]).decode().strip())
    D = round(dur + 2 * PAD, 3)
    appear = round(t + PAD, 3)
    cap = os.path.join(RUN, "cap", f"c{N}.txt")
    img = os.path.join(RUN, "img", f"s{N}.jpg")
    os.makedirs(OUTDIR, exist_ok=True)
    out = os.path.join(OUTDIR, f"{SLUG}-scene{N}-timed.mp4")

    fc = (
        f"[0:v]scale=2304:1296,zoompan=z='1.04+0.06*on/{int(D * FPS)}':"
        f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps={FPS},setsar=1,"
        f"drawtext=fontfile={FONT}:textfile={cap}:fontsize=46:fontcolor=0x2b2b2b:"
        f"box=1:boxcolor=0xF7F2E6@0.88:boxborderw=18:x=(w-text_w)/2:y=h-60-text_h,"
        f"drawtext=fontfile={FONT}:text='{math}':fontsize=64:fontcolor=0x0b1526:"
        f"box=1:boxcolor=0xFFFFFF@0.9:boxborderw=24:x=(w-text_w)/2:y=70:"
        f"alpha='if(lt(t,{appear}),0,min(1,(t-{appear})/0.35))':enable='gte(t,{appear})'[v];"
        f"[1:a]adelay={int(PAD * 1000)}|{int(PAD * 1000)},apad,atrim=0:{D}[a]"
    )
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
           "-framerate", "30", "-loop", "1", "-t", str(D), "-i", img,
           "-i", wav, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    print(out)
    print(f"shots to look at: {appear - 0.5:.2f}s (no formula) and {appear + 0.6:.2f}s (formula)")


main()
