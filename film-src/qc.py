"""Build a contact sheet per clip (5 frames across) so each can be eyeballed
before it earns a place in the film."""
import glob, os, re, subprocess, sys
import imageio_ffmpeg
from PIL import Image, ImageDraw

EXE = imageio_ffmpeg.get_ffmpeg_exe()
SRC = "C:/Users/ayush/Downloads/mrakee"
OUT = sys.argv[1] if len(sys.argv) > 1 else "."

# keyword -> chapter slot
MAP = [
    ("Self-service_kiosk_orbiting", "ch1", "the object / orbit"),
    ("Light_glowing_on_glass",      "ch2", "it wakes / macro"),
    ("Woman_touching_interactive",  "ch3", "retail"),
    ("Staff_member_working",        "ch4", "quick service"),
    ("Travellers_walking",          "ch5", "transport"),
    ("Camera_reveals_shopping",     "ch6", "scale / atrium"),
]

files = glob.glob(os.path.join(SRC, "*.mp4"))
TIMES = [0.15, 2.5, 5.0, 7.5, 9.7]
W = 380

for key, ch, label in MAP:
    match = next((f for f in files if key.lower() in os.path.basename(f).lower()), None)
    if not match:
        print(f"!! no file for {ch} ({key})")
        continue

    tiles = []
    for i, t in enumerate(TIMES):
        tmp = os.path.join(OUT, f"_{ch}_{i}.png")
        subprocess.run(
            [EXE, "-y", "-ss", str(t), "-i", match, "-frames:v", "1",
             "-vf", f"scale={W}:-1", tmp],
            capture_output=True,
        )
        if os.path.exists(tmp):
            tiles.append((t, Image.open(tmp).convert("RGB")))

    if not tiles:
        print(f"!! no frames extracted for {ch}")
        continue

    h = max(im.height for _, im in tiles)
    sheet = Image.new("RGB", (W * len(tiles), h + 22), "white")
    d = ImageDraw.Draw(sheet)
    for i, (t, im) in enumerate(tiles):
        sheet.paste(im, (i * W, 22))
        d.text((i * W + 6, 6), f"{ch}  t={t}s", fill="black")
    dest = os.path.join(OUT, f"qc_{ch}.png")
    sheet.save(dest, quality=88)
    print(f"{ch}  {label:22s} {os.path.basename(match)[:40]}  -> {dest}")

for f in glob.glob(os.path.join(OUT, "_ch*.png")):
    os.remove(f)
