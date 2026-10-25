import json, subprocess, sys

FPS = 30
PAD = 0.5
XF = 0.6
FONT = "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"
SCENES = [
    ("assets/img/s1.png", "assets/audio/v1.wav", "cap1.txt"),
    ("assets/img/s2.png", "assets/audio/v2.wav", "cap2.txt"),
    ("assets/img/s4.png", "assets/audio/v3.wav", "cap3.txt"),
    ("assets/img/s3.png", "assets/audio/v4.wav", "cap4.txt"),
    ("assets/img/s5.png", "assets/audio/v5.wav", "cap5.txt"),
]
OUT = "out/arifmeticheskaya-progressiya-1min.mp4"

if len(sys.argv) > 1:
    manifest = json.load(open(sys.argv[1]))
    SCENES = [(s["img"], s["audio"], s["cap"]) for s in manifest["scenes"]]
    OUT = manifest["out"]


def dur(path):
    return float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "csv=p=0", path]).decode().strip())


d = [dur(a) + 2 * PAD for _, a, _ in SCENES]
start = [0.0]
for i in range(1, len(d)):
    start.append(start[-1] + d[i - 1] - XF)
total = start[-1] + d[-1]

inputs, filters = [], []
for i, (img, aud, _) in enumerate(SCENES):
    inputs += ["-framerate", "30", "-loop", "1", "-t", f"{d[i]:.3f}", "-i", img]
for _, aud, _ in SCENES:
    inputs += ["-i", aud]

for i in range(len(SCENES)):
    filters.append(
        f"[{i}:v]scale=2304:1296,zoompan=z='1.04+0.06*on/{int(d[i]*FPS)}':"
        f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps={FPS},"
        f"setsar=1[v{i}]")

parts = []
prev = "[v0]"
for i in range(1, len(SCENES)):
    out = f"[x{i}]" if i < len(SCENES) - 1 else "[bg]"
    parts.append(f"{prev}[v{i}]xfade=transition=fade:duration={XF}:offset={start[i]:.3f}{out}")
    prev = out
chain = ";".join(parts)

fade = 0.5
dt = "[bg]"
for i, (_, _, cap) in enumerate(SCENES):
    end = start[i] + d[i] - (XF if i < len(SCENES) - 1 else 0)
    alpha = f"if(lt(t,{start[i]:.3f}+{fade}),max(0,(t-{start[i]:.3f})/{fade}),1)"
    dt += (f"drawtext=fontfile={FONT}:textfile={cap}:fontsize=46:fontcolor=0x2b2b2b:"
           f"box=1:boxcolor=0xF7F2E6@0.88:boxborderw=18:x=(w-text_w)/2:y=h-60-text_h:"
           f"alpha='{alpha}':enable='between(t,{start[i]:.3f},{end:.3f})',")
dt = dt.rstrip(",") + "[vout]"

# audio: voice i at start[i] + PAD
amix = ""
for i in range(len(SCENES)):
    amix += f"[{len(SCENES) + i}:a]adelay={int((start[i] + PAD) * 1000)}|{int((start[i] + PAD) * 1000)},apad[a{i}];"
amix += "".join(f"[a{i}]" for i in range(len(SCENES))) + \
    f"amix=inputs={len(SCENES)}:normalize=0:duration=longest,atrim=0:{total:.3f}[aout]"

fc = ";".join(filters) + ";" + chain + ";" + dt + ";" + amix
cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *inputs,
       "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
       "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
       "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT]

print(f"total {total:.2f}s, scenes {[round(x,2) for x in d]}", flush=True)
subprocess.run(cmd, check=True)
print(OUT)
