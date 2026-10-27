import base64, json, os, re, subprocess, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

WORK = os.path.expanduser("~/work")
PRJ = os.path.join(WORK, "projects", "school-video")


def slug(text):
    s = re.sub(r"[^\w\-]+", "-", str(text).lower(), flags=re.UNICODE).strip("-")
    return s[:60] or "lesson"


def refresh():
    subprocess.run([sys.executable, "make_gallery.py"], cwd=PRJ, check=True)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=WORK, **kw)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s\n" % (fmt % args))

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        url = urlparse(self.path)
        if url.path.rstrip("/") == "/api/upload":
            self.upload(url)
            return
        if url.path.rstrip("/") != "/api/save":
            self.send_error(404, "only /api/save and /api/upload")
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(length)
            data = json.loads(raw or b"{}")
            video = data.get("video") or ""
            video = base64.b64decode(video.split(",")[-1])
            if len(video) < 10000:
                raise ValueError("the video is too small to be real")

            lang = data.get("lang") if data.get("lang") in ("ru", "en") else ""
            grade = str(data.get("grade") or "").strip()
            grade = int(grade) if grade.isdigit() else None
            title = (data.get("title") or data.get("topic") or "Lesson").strip()[:80]
            name = slug(title) + ("-" + lang if lang else "")
            out_dir = os.path.join(PRJ, "out")
            os.makedirs(out_dir, exist_ok=True)
            stem, n = name, 2
            while os.path.exists(os.path.join(out_dir, stem + ".webm")):
                stem = f"{name}-{n}"
                n += 1

            tmp = os.path.join(out_dir, stem + ".raw.webm")
            with open(tmp, "wb") as f:
                f.write(video)
            target = os.path.join(out_dir, stem + ".webm")
            r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-c", "copy", target])
            os.remove(tmp)
            if r.returncode or not os.path.exists(target):
                raise ValueError("ffmpeg could not read the video from the page")

            run_dir = os.path.join(PRJ, "runs", stem)
            os.makedirs(run_dir, exist_ok=True)
            json.dump({"title": title, "topic": data.get("topic") or title, "lang": lang,
                       "grade": grade, "from_page": True},
                      open(os.path.join(run_dir, "meta.json"), "w"), ensure_ascii=False, indent=2)

            if grade is not None:
                gp = os.path.join(PRJ, "grades.json")
                grades = json.load(open(gp)) if os.path.exists(gp) else {}
                grades[os.path.basename(target)] = grade
                json.dump(grades, open(gp, "w"), ensure_ascii=False, indent=2)

            refresh()
            self._json(200, {"ok": True, "file": "out/" + os.path.basename(target)})
        except Exception as e:
            self._json(400, {"ok": False, "error": str(e)})

    def _pdf_video(self, pdf_tmp, title, lang, grade):
        base = slug(title) or "pdf"
        stem, n = base, 2
        while os.path.exists(os.path.join(PRJ, "out", f"{stem}-pdf-{lang}.mp4")):
            stem = f"{base}-{n}"
            n += 1
        work = os.path.join(PRJ, "runs", ".pdf-upload-" + stem)
        os.makedirs(work, exist_ok=True)
        pdf = os.path.join(work, stem + ".pdf")
        os.replace(pdf_tmp, pdf)
        r = subprocess.run([sys.executable, "make_video.py", "-pdf", pdf, "-lang", lang],
                           cwd=PRJ, capture_output=True, text=True, timeout=1200)
        if r.returncode:
            lines = [l for l in (r.stdout + "\n" + r.stderr).splitlines() if l.strip()]
            raise ValueError("no video: " + " | ".join(lines[-3:])[:400])
        run = os.path.join(PRJ, "runs", stem + "-pdf")
        os.makedirs(run, exist_ok=True)
        os.replace(pdf, os.path.join(run, "source.pdf"))
        try:
            os.rmdir(work)
        except OSError:
            pass
        video = f"{stem}-pdf-{lang}.mp4"
        if grade is not None:
            gp = os.path.join(PRJ, "grades.json")
            grades = json.load(open(gp)) if os.path.exists(gp) else {}
            grades[video] = grade
            json.dump(grades, open(gp, "w"), ensure_ascii=False, indent=2)
        refresh()
        self._json(200, {"ok": True, "pdf": True, "file": "out/" + video})

    def upload(self, url):
        tmp = None
        try:
            q = parse_qs(url.query)

            def qs(key):
                return ((q.get(key) or [""])[0] or "").strip()[:120]

            lang = qs("lang") if qs("lang") in ("ru", "en") else ""
            grade = qs("grade")
            grade = int(grade) if grade.isdigit() and 1 <= int(grade) <= 12 else None
            title = qs("title") or os.path.splitext(qs("name"))[0] or "Lesson"
            title = title[:80]
            is_pdf = qs("name").lower().endswith(".pdf")

            length = int(self.headers.get("Content-Length") or 0)
            if length < (1000 if is_pdf else 20000):
                raise ValueError("the file is too small to be a video")
            if length > (20 * 1024 * 1024 if is_pdf else 300 * 1024 * 1024):
                raise ValueError("the file is too big")

            out_dir = os.path.join(PRJ, "out")
            os.makedirs(out_dir, exist_ok=True)
            name = slug(title) + ("-" + lang if lang else "")
            stem, n = name, 2
            while any(os.path.exists(os.path.join(out_dir, stem + ext)) for ext in (".mp4", ".webm")):
                stem = f"{name}-{n}"
                n += 1

            tmp = os.path.join(out_dir, "." + stem + (".pdf" if is_pdf else ".upload"))
            left = length
            with open(tmp, "wb") as f:
                while left > 0:
                    chunk = self.rfile.read(min(1 << 20, left))
                    if not chunk:
                        break
                    f.write(chunk)
                    left -= len(chunk)

            with open(tmp, "rb") as f:
                if f.read(5) == b"%PDF-":
                    self._pdf_video(tmp, title, lang, grade)
                    tmp = None
                    return

            p = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                                "-show_entries", "stream=codec_name",
                                "-show_entries", "format=duration", "-of", "json", tmp],
                               capture_output=True, text=True)
            info = json.loads(p.stdout or "{}")
            if not info.get("streams"):
                raise ValueError("this file has no video inside (use mp4, mov, webm or mkv)")
            dur = float(info.get("format", {}).get("duration") or 0)
            if dur < 3:
                raise ValueError("the video is shorter than 3 seconds")
            if dur > 900:
                raise ValueError("the video is longer than 15 minutes")

            target = os.path.join(out_dir, stem + ".mp4")
            r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp,
                                "-vf", "scale='min(1280,iw)':-2",
                                "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                                "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
                                "-movflags", "+faststart", target],
                               capture_output=True, text=True)
            if r.returncode or not os.path.exists(target):
                raise ValueError("ffmpeg could not convert the video: " + (r.stderr or "")[-200:])

            run_dir = os.path.join(PRJ, "runs", stem)
            os.makedirs(run_dir, exist_ok=True)
            json.dump({"title": title, "lang": lang, "grade": grade,
                       "uploaded": True, "original": qs("name") or ""},
                      open(os.path.join(run_dir, "meta.json"), "w"), ensure_ascii=False, indent=2)

            if grade is not None:
                gp = os.path.join(PRJ, "grades.json")
                grades = json.load(open(gp)) if os.path.exists(gp) else {}
                grades[os.path.basename(target)] = grade
                json.dump(grades, open(gp, "w"), ensure_ascii=False, indent=2)

            refresh()
            self._json(200, {"ok": True, "file": "out/" + os.path.basename(target)})
        except Exception as e:
            self._json(400, {"ok": False, "error": str(e)})
        finally:
            if tmp and os.path.exists(tmp):
                os.remove(tmp)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"school-video server on http://127.0.0.1:{port}/  (Ctrl+C to stop)", flush=True)
    srv.serve_forever()
