"""
Build the scroll film from the Google Flow clips.

  crop out the Veo watermark -> scale -> trim to the best segment
  -> 24fps PNG -> crossfade chapters -> WebP sequence + manifest

Currently one chapter: the hero commercial, run complete. The other five
are parked in CHAPTERS below rather than deleted.

Frames land in public/frames/film/. Memory-safe: frames are streamed one at
a time rather than held as a list of decoded images.
"""
import glob, json, os, shutil, subprocess, sys
import imageio_ffmpeg
from PIL import Image

EXE = imageio_ffmpeg.get_ffmpeg_exe()
SRC = "C:/Users/ayush/Downloads/mrakee"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(ROOT, "public", "frames", "film")
TMP = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_tmp")

# 24 matches the source. At 12 a 10s clip is only 120 frames, and spread
# over 5+ screens of scroll that is a visible step between frames on every
# small movement — which reads as the film being rushed rather than coarse.
# Doubling the frames halves the step without changing how far you scroll.
FPS = 24
WIDTH = 1400
HEIGHT = 788        # forced, so the 1080p and 720p sources land identically
XFADE = 5           # frames of crossfade between chapters (~0.4s)
QUALITY = 82

# Watermark sits at x 89.3-92.7%, y 81.6-88.8% of frame in every clip.
# Keeping 88% of the width clears it; trimming height to match restores 16:9.
CROP = "crop=iw*0.88:iw*0.88*9/16:0:(ih-iw*0.88*9/16)/2"

# (keyword, label, start, duration) — segments chosen from the QC sheets
CHAPTERS = [
    # The hero chapter, replaced 2026-08-15 and run in full rather than
    # trimmed — it is a finished commercial with its own arc (kiosk ->
    # storefronts -> menu board -> branded kiosk) and cutting it to 4.5s
    # would throw away the payoff. At 10s it is nearly a third of the
    # film, which is why every caption below it had to be re-timed.
    # Previous: ("Self-service_kiosk_orbiting", "The object", 0.0, 4.5)
    ("MRakee_commercial_hero",      "The object",    0.0, 10.0),
    # Parked 2026-08-15 — the hero commercial runs alone for now so it
    # gets the whole runway and a proper pace. Uncomment to bring the
    # other chapters back; the caption windows for them are in git at
    # a229ad8 and will need re-timing again from the printed fractions.
    # ("Light_glowing",               "It wakes",      0.8, 5.0),
    # ("Woman_touching",              "Retail",        3.0, 5.0),
    # ("Staff_member",                "Quick service", 0.5, 5.0),
    # ("Travellers_walking",          "Transport",     0.5, 5.0),
    # Replaced the shopping-atrium clip 2026-08-15. This one starts at
    # 4.6s so the chapter builds kiosk -> DOOH columns -> wide terminal,
    # which is the "thousand screens, one dashboard" beat the caption is
    # making. The atrium clip is still in the source folder if it is
    # ever wanted back: keyword "Camera_reveals_shopping", 4.5, 5.4.
    # ("MRakee_Technologies_terminal", "Scale",        4.6, 5.4),
]


def extract(src, start, dur, dest):
    os.makedirs(dest, exist_ok=True)
    subprocess.run(
        [EXE, "-y", "-ss", str(start), "-t", str(dur), "-i", src,
         "-vf", f"{CROP},scale={WIDTH}:{HEIGHT},fps={FPS}",
         "-start_number", "0", os.path.join(dest, "%04d.png")],
        capture_output=True, check=True,
    )
    return sorted(glob.glob(os.path.join(dest, "*.png")))


def main():
    files = glob.glob(os.path.join(SRC, "*.mp4"))
    if os.path.isdir(TMP):
        shutil.rmtree(TMP)
    os.makedirs(TMP)

    chapters = []
    for i, (key, label, start, dur) in enumerate(CHAPTERS):
        match = next((f for f in files if key.lower() in os.path.basename(f).lower()), None)
        if not match:
            # Hard stop, not a warning. These clips live in the user's
            # Downloads folder and get reorganised; on 2026-08-15 one was
            # moved mid-session and this quietly emitted a five-chapter
            # film that looked plausible right up until the last caption
            # had nothing behind it. A missing source is never something
            # to continue past.
            raise SystemExit(
                f"\n!! no source matching {key!r} for chapter {label!r}\n"
                f"   looked in {SRC}\n"
                f"   found: {sorted(os.path.basename(f) for f in files)}\n"
            )
        frames = extract(match, start, dur, os.path.join(TMP, f"ch{i+1}"))
        print(f"ch{i+1} {label:14s} {len(frames):3d} frames  ({dur}s @ {FPS}fps)")
        chapters.append((label, frames))

    # ---- plan the output sequence, overlapping chapter joins -------------
    plan = []            # each entry: path  OR  (pathA, pathB, alpha)
    bounds = []          # (label, first_index, last_index)
    for label, frames in chapters:
        if not plan:
            start_i = 0
            plan.extend(frames)
        else:
            start_i = len(plan) - XFADE
            for j in range(XFADE):
                a = plan[start_i + j]
                a = a[0] if isinstance(a, tuple) else a
                plan[start_i + j] = (a, frames[j], (j + 1) / (XFADE + 1))
            plan.extend(frames[XFADE:])
        bounds.append([label, start_i, len(plan) - 1])

    # ---- render -----------------------------------------------------------
    if os.path.isdir(OUTDIR):
        shutil.rmtree(OUTDIR)
    os.makedirs(OUTDIR, exist_ok=True)

    total = len(plan)
    for idx, item in enumerate(plan):
        if isinstance(item, tuple):
            a, b, alpha = item
            im = Image.blend(
                Image.open(a).convert("RGB"), Image.open(b).convert("RGB"), alpha
            )
        else:
            im = Image.open(item).convert("RGB")
        im.save(os.path.join(OUTDIR, f"{idx:04d}.webp"), "WEBP", quality=QUALITY)
        im.close()

    size = sum(os.path.getsize(os.path.join(OUTDIR, f)) for f in os.listdir(OUTDIR))
    w, h = Image.open(os.path.join(OUTDIR, "0000.webp")).size

    manifest = {
        "count": total,
        "fps": FPS,
        "width": w,
        "height": h,
        "pattern": "frames/film/%04d.webp",
        "chapters": [
            {"label": lab, "in": round(a / (total - 1), 4), "out": round(b / (total - 1), 4)}
            for lab, a, b in bounds
        ],
    }
    with open(os.path.join(OUTDIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n{total} frames  {w}x{h}  {size/1e6:.1f} MB total "
          f"({size/total/1000:.0f} kB/frame)")
    print("\nscroll fractions (use these to place captions):")
    for lab, a, b in bounds:
        print(f"  {lab:14s} {a/(total-1):.3f} -> {b/(total-1):.3f}")

    shutil.rmtree(TMP)


if __name__ == "__main__":
    main()
