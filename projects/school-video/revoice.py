import argparse, glob, json, os, subprocess, sys, time, urllib.error, urllib.request

API = "http://127.0.0.1:19040/v1/audio/speech"
MARK = "voice.json"


def speak(text, lang):
    body = json.dumps({"model": "omnivoice", "input": text, "language": lang}).encode()
    for attempt, wait in enumerate((0, 2, 5, 10), 1):
        if wait:
            time.sleep(wait)
        req = urllib.request.Request(API, body, {"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            print(f"    voice {attempt} failed {e.code}: {e.read().decode()[:120]}", flush=True)
        except Exception as e:
            print(f"    voice {attempt} failed: {e}", flush=True)
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--skip-marked", action="store_true")
    ap.add_argument("--speed", type=float, default=0.0, help="0 = default")
    a = ap.parse_args()

    jobs = []
    for run in sorted(glob.glob("runs/*")):
        sc = os.path.join(run, "script.json")
        mp = os.path.join(run, "manifest.json")
        if not (os.path.isdir(run) and os.path.exists(sc) and os.path.exists(mp)):
            continue
        mark = os.path.join(run, MARK)
        voiced = os.path.exists(mark) and json.load(open(mark)).get("model") == "omnivoice"
        if a.skip_marked and voiced:
            continue
        jobs.append((run, voiced))
    if a.limit:
        jobs = jobs[: a.limit]
    print(f"{len(jobs)} videos to re-voice", flush=True)

    done = failed = 0
    for n, (run, voiced) in enumerate(jobs, 1):
        data = json.load(open(os.path.join(run, "script.json")))
        manifest = json.load(open(os.path.join(run, "manifest.json")))
        lang = data.get("lang") or ("ru" if "-ru" in manifest["out"] else "en")
        title = data.get("title", run)
        print(f"[{n}/{len(jobs)}] {title} ({lang})" + (" (rebuild)" if voiced else ""), flush=True)
        wavs = []
        ok = True
        for i, sc in enumerate(data["scenes"], 1):
            if voiced:
                break
            text = sc["narration"].strip()
            body = json.dumps({"model": "omnivoice", "input": text, "language": lang,
                               **({"speed": a.speed} if a.speed else {})}).encode()
            wav = None
            for attempt, wait in enumerate((0, 2, 5, 10), 1):
                if wait:
                    time.sleep(wait)
                req = urllib.request.Request(API, body, {"Content-Type": "application/json"})
                try:
                    with urllib.request.urlopen(req, timeout=180) as r:
                        wav = r.read()
                    break
                except urllib.error.HTTPError as e:
                    print(f"    scene {i} try {attempt}: {e.code} {e.read().decode()[:100]}", flush=True)
                except Exception as e:
                    print(f"    scene {i} try {attempt}: {e}", flush=True)
            if not wav:
                ok = False
                break
            tmp = os.path.join(run, "audio", f"v{i}.omni")
            open(tmp, "wb").write(wav)
            wavs.append((tmp, os.path.join(run, "audio", f"v{i}.wav")))
            print(f"    scene {i} voice ok", flush=True)
        if not ok:
            print("    skipped: voice failed", flush=True)
            failed += 1
            continue
        for tmp, dst in wavs:
            os.replace(tmp, dst)
        b = subprocess.run([sys.executable, "build.py", os.path.join(run, "manifest.json")],
                           capture_output=True, text=True)
        if b.returncode:
            print("    video failed: " + (b.stderr or b.stdout)[-200:], flush=True)
            failed += 1
            continue
        json.dump({"model": "omnivoice", "time": time.strftime("%Y-%m-%d %H:%M")},
                  open(os.path.join(run, MARK), "w"))
        done += 1
        print(f"    done: {manifest['out']}", flush=True)
        if done % 5 == 0:
            subprocess.run([sys.executable, "make_gallery.py"], check=True)

    print(f"finished: {done} done, {failed} failed", flush=True)
    subprocess.run([sys.executable, "make_gallery.py"], check=True)
    print("gallery updated", flush=True)


if __name__ == "__main__":
    main()
