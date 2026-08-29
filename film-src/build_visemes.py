"""Build the assistant's ten viseme frames.

WHY THIS SHAPE OF SOLUTION, since four earlier ones failed:

The avatar is two renders, not a rig -- a closed-mouth "idle" and an
open-mouth "answering". Everything tried before either composited one
over the other at runtime (which left her baked-in smile visible under
every open mouth: the "double mouth") or invented new geometry by
scaling, inpainting or cloning pixels (which tore her cheeks, smeared
her jaw and grew ghost nostrils).

This does neither. Every output pixel is a real pixel from one of the
two real renders. The only operation is WHICH of the two a pixel comes
from, and that is decided by a feathered ellipse over the mouth:

  outside the mouth region entirely -> the answering render
  inside it, outside the aperture   -> the idle render (closed lips)
  inside the aperture               -> the answering render (open)

Two consequences make this work where the others did not.

First, no geometry is ever scaled, so no face can deform.

Second -- and this is the part that matters for the double mouth --
every speaking frame takes its brows, eyes, hair and shoulders from the
SAME source, the answering render. So swapping frames at syllable rate
moves her mouth and moves nothing else. The two renders are aligned but
not identical above the jaw (measured: brows differ, jaw differs, hair
top and shoulders agree to within 4/255), and swapping whole renders
would have twitched her brows on every syllable.

The frames are complete opaque faces, so the component shows exactly
one <img> and composites nothing at runtime. A mouth cannot appear
underneath a mouth when there is no underneath.

Run from the repo root:  python film-src/build_visemes.py
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os, sys

IDLE = "public/assistant/avatar-idle.webp"
ANSR = "public/assistant/avatar-answering.webp"
OUT  = "public/assistant/visemes"

idle = np.asarray(Image.open(IDLE).convert("RGB")).astype(float)
ansr = np.asarray(Image.open(ANSR).convert("RGB")).astype(float)
if idle.shape != ansr.shape:
    sys.exit(f"the two renders differ in size: {idle.shape} vs {ansr.shape}")
H, W, _ = idle.shape

# The mouth region: where the closed lips are swapped in. Centred low
# enough to take the jaw with it, since her jaw drops when she speaks
# and a closed mouth on a dropped jaw reads as a wince.
REGION = dict(cx=261, cy=288, rx=78, ry=62, feather=22)

# The mouth's own centre, from the answering render's aperture
# (measured: x 225-294, y 260-277).
MX, MY = 261, 270


def ellipse_mask(cx, cy, rx, ry, feather):
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
    if feather:
        m = m.filter(ImageFilter.GaussianBlur(feather))
    return (np.asarray(m).astype(float) / 255.0)[:, :, None]


REGION_MASK = ellipse_mask(**REGION)
# The answering face wearing her closed mouth. Every speaking frame is
# built out from this, which is what keeps the brows still.
CLOSED = ansr * (1 - REGION_MASK) + idle * REGION_MASK


def frame(rx, ry, dy=0, feather=7):
    """Open the mouth by rx x ry, from the closed-mouth answering face."""
    if rx is None:
        return CLOSED
    a = ellipse_mask(MX, MY + dy, rx, ry, feather)
    return CLOSED * (1 - a) + ansr * a


# The aperture per sound. Width and height are the two things a mouth
# actually does -- "ee" is wide and shut, "oo" is narrow and round --
# so the shapes differ in aspect, not only in how far they open.
SPEC = {
    "rest": (None, None),      # silence: her natural closed mouth
    "MBP":  (None, None),      # m, b, p -- lips pressed together
    "FV":   (34, 9, 1),        # f, v -- barely parted
    "TH":   (40, 13),          # th -- a narrow slit
    "I":    (52, 14),          # i, y -- wide and shut
    "E":    (58, 21),          # e, a(y) -- wide, half open
    "LDNT": (44, 18),          # l, d, n, t -- tongue behind the teeth
    "A":    (62, 36),          # a, ah -- open
    "O":    (32, 28),          # o, aw -- round
    "U":    (26, 20),          # oo, u, w -- small and round
}

os.makedirs(OUT, exist_ok=True)
for name, spec in SPEC.items():
    img = frame(*spec)
    Image.fromarray(np.clip(img, 0, 255).astype("uint8")).save(
        f"{OUT}/{name}.webp", "WEBP", quality=95, method=6)

# Prove the claim rather than asserting it: outside the mouth region,
# every speaking frame must be identical to every other one.
ref = np.asarray(Image.open(f"{OUT}/A.webp").convert("RGB")).astype(int)
outside = (REGION_MASK[:, :, 0] < 0.004)
worst = 0
for name in SPEC:
    a = np.asarray(Image.open(f"{OUT}/{name}.webp").convert("RGB")).astype(int)
    if name in ("rest", "MBP"):
        continue
    worst = max(worst, np.abs(a - ref).max(2)[outside].max())
print(f"wrote {len(SPEC)} frames to {OUT}/")
print(f"largest difference between any two speaking frames, outside the "
      f"mouth region: {worst}/255  (0 would be exact; anything under ~3 is "
      f"webp quantisation)")
