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
import numpy as np
import cv2
import imageio_ffmpeg
from PIL import Image

EXE = imageio_ffmpeg.get_ffmpeg_exe()
# Sources live in the project, not in Downloads. They used to be read
# from C:/Users/ayush/Downloads/mrakee, and that folder was reorganised
# three times mid-project — once silently dropping a chapter from the
# built film. film-src/sources/ is gitignored (the derived WebP frames
# are what the site serves and those ARE committed), so a clone can
# still deploy; it just cannot re-cut the film without the clips.
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sources")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(ROOT, "public", "frames", "film")
TMP = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_tmp")

# 24 matches the source. At 12 a 10s clip is only 120 frames, and spread
# over 5+ screens of scroll that is a visible step between frames on every
# small movement — which reads as the film being rushed rather than coarse.
# Doubling the frames halves the step without changing how far you scroll.
FPS = 24
# The crop's own output size, so `scale` below is an identity op and the
# frames are never resampled at all. It used to be 1400x788, which threw
# away 17% of the source's linear resolution and then left the browser
# upscaling 1.53x to fill a 2138px canvas.
#
# Measured on one frame, rendered up to that 2138px canvas (edge stdev):
#   1400x788  q82   56 kB/frame  13.3 MB  21.29
#   1690x950  q82   73 kB/frame  17.4 MB  23.77   <- this
#   1690x950  q90  118 kB/frame  28.1 MB  23.98
#   1920x1080 q88  113 kB/frame  27.0 MB  23.03   (worse: past the source)
#
# So resolution was the lever and quality was not: q90 costs another
# 11 MB to gain 0.2%, and scaling beyond the source actively loses.
# NATIVE. Was 1690 wide, which was the source cropped to remove the
# watermark; the crop is gone (see CROP below) so this is now the source's
# own 1920x1080 and `scale` is an identity operation. Nothing is resampled
# at any point between the mp4 and the browser.
WIDTH = 1920
HEIGHT = 1080       # forced, so the 1080p and 720p sources land identically
XFADE = 5           # frames of crossfade between chapters (~0.4s)
QUALITY = 90        # raised with the resolution: full quality was asked for

# NO CROP. It existed only to cut the generator's watermark off the right
# edge, and it cost 12% of the width of every frame to do it — which is
# also what sliced the kiosk in half in the last clip.
#
# The watermark is now covered rather than cut: the assistant's greeter
# figure is fixed to the bottom-right of every page and sits over it. In
# this clip the sparkle centres on frame (1740, 898), which is 90.6% across
# and 83.1% down. Verified against the greeter's own rectangle at four
# viewport sizes rather than assumed — see the note in the commit.
#
# The trade is deliberate: full frame and full width, and one asset doing
# double duty, instead of throwing away real picture on every frame.
CROP = None

# (keyword, label, start, duration) — segments chosen from the QC sheets
CHAPTERS = [
    # The hero chapter, replaced 2026-08-15 and run in full rather than
    # trimmed — it is a finished commercial with its own arc (kiosk ->
    # storefronts -> menu board -> branded kiosk) and cutting it to 4.5s
    # would throw away the payoff. At 10s it is nearly a third of the
    # film, which is why every caption below it had to be re-timed.
    # Previous: ("Self-service_kiosk_orbiting", "The object", 0.0, 4.5)
    ("hero",                        "The object",    0.0, 10.0),
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


# ---------------------------------------------------------------------------
# The generator's sparkle, painted out rather than cropped off.
#
# Cropping cost 12% of the width of every frame and is what sliced the
# kiosk in half in an earlier clip. This removes the mark instead of the
# picture: cv2.inpaint reconstructs the covered pixels from the ring of
# real pixels around them, which on the soft backgrounds the mark happens
# to sit on is invisible.
#
# The mask was derived rather than drawn. The mark is static and the scene
# is not, so averaging (frame - medianBlur(frame)) across the film leaves
# the sparkle and cancels everything else; the shape that survives is
# filled and dilated by 13px, because the mark has a soft edge and
# inpainting has to start on pixels that are genuinely clean.
MASK_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "watermark_mask.png")
_mask = None
_box = None


def _load_mask():
    global _mask, _box
    if _mask is not None:
        return
    m = cv2.imread(MASK_PATH, cv2.IMREAD_GRAYSCALE)
    if m is None:
        raise SystemExit(f"watermark mask missing: {MASK_PATH}")
    ys, xs = np.where(m > 0)
    pad = 40  # inpainting needs real pixels around the hole to work from
    _box = (max(0, xs.min() - pad), max(0, ys.min() - pad),
            min(m.shape[1], xs.max() + pad), min(m.shape[0], ys.max() + pad))
    _mask = m


def dewatermark(im):
    """Paint the sparkle out of a PIL image, in place of cropping it off."""
    _load_mask()
    x0, y0, x1, y1 = _box
    a = np.asarray(im.convert("RGB"))
    if a.shape[0] != _mask.shape[0] or a.shape[1] != _mask.shape[1]:
        return im  # not the geometry the mask was measured on; leave it alone
    # Inpaint only the window around the mark: the same result as running
    # it on the whole frame, a fraction of the work.
    win = np.ascontiguousarray(a[y0:y1, x0:x1])
    fixed = cv2.inpaint(win, _mask[y0:y1, x0:x1], 4, cv2.INPAINT_TELEA)
    out = a.copy()
    out[y0:y1, x0:x1] = fixed
    return Image.fromarray(out)


def extract(src, start, dur, dest):
    os.makedirs(dest, exist_ok=True)
    subprocess.run(
        [EXE, "-y", "-ss", str(start), "-t", str(dur), "-i", src,
         "-vf", f"{CROP + ',' if CROP else ''}scale={WIDTH}:{HEIGHT},fps={FPS}",
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
        im = dewatermark(im)
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
