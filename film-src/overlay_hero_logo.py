"""
Surgically overlay the correct MRakee Technologies logo on the closing kiosk screen.

Only touches frames 0213 to 0238 (the closing kiosk shot).
Frames 0000 to 0212 remain completely untouched.
Uses the brand master asset at public/logo-full.png.
Tracks the kiosk screen as the camera pans and settles to a stop.
"""
import os
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRAMES_DIR = os.path.join(ROOT, "public", "frames", "film")
LOGO_PATH = os.path.join(ROOT, "public", "logo-full.png")
QUALITY = 90

# Target logo dimensions on the 198x305 kiosk screen
LOGO_TARGET_W = 152

# Verified screen tracking table: (screen_x, screen_y)
# Screen y is constantly 371 across the horizontal pan.
# Screen moves from x=465 at frame 213 to x=825 at frame 238.
VERIFIED_POSITIONS = {
    213: (465, 371),
    214: (490, 371),
    215: (514, 371),
    216: (539, 371),
    217: (564, 371),
    218: (587, 371),
    219: (610, 371),
    220: (633, 371),
    221: (655, 371),
    222: (676, 371),
    223: (695, 371),
    224: (713, 371),
    225: (729, 371),
    226: (744, 371),
    227: (757, 371),
    228: (780, 371),
    229: (789, 371),
    230: (797, 371),
    231: (804, 371),
    232: (810, 371),
    233: (815, 371),
    234: (819, 371),
    235: (822, 371),
    236: (824, 371),
    237: (825, 371),
    238: (825, 371),
}

# Crossfade opacity ramp matching the screen's transition to white
OPACITY_RAMP = {
    213: 0.35,
    214: 0.70,
    215: 0.90,
}


def overlay_logo(im_pil_or_cv2, frame_idx, logo_img=None, template=None):
    """
    Apply the surgical logo correction to a single frame if in range 213..238.
    Accepts either a PIL Image (RGB) or numpy array (BGR), returns the same type.
    """
    if frame_idx < 213 or frame_idx > 238:
        return im_pil_or_cv2

    is_pil = isinstance(im_pil_or_cv2, Image.Image)
    if is_pil:
        im_bgr = cv2.cvtColor(np.array(im_pil_or_cv2), cv2.COLOR_RGB2BGR)
    else:
        im_bgr = im_pil_or_cv2.copy()

    if logo_img is None:
        logo_img = Image.open(LOGO_PATH).convert("RGBA")

    target_h = int(round(LOGO_TARGET_W * logo_img.height / logo_img.width))
    logo_resized = logo_img.resize((LOGO_TARGET_W, target_h), Image.Resampling.LANCZOS)

    # Determine screen position
    if frame_idx in VERIFIED_POSITIONS:
        screen_x, screen_y = VERIFIED_POSITIONS[frame_idx]
    else:
        # Fallback to template matching
        if template is None:
            im238 = cv2.imread(os.path.join(FRAMES_DIR, "0238.webp"))
            template = im238[365:680, 820:1028]
        res = cv2.matchTemplate(im_bgr[300:750, :], template, cv2.TM_CCOEFF_NORMED)
        _, _, _, max_loc = cv2.minMaxLoc(res)
        screen_x = max_loc[0] + 5
        screen_y = max_loc[1] + 300 + 6

    # 1. Clean the old AI logo using inpainting on the screen
    top_strip = im_bgr[screen_y + 15 : screen_y + 45, screen_x + 20 : screen_x + 178]
    bot_strip = im_bgr[screen_y + 265 : screen_y + 295, screen_x + 20 : screen_x + 178]
    bg_color = np.mean(np.vstack([top_strip, bot_strip]), axis=(0, 1))

    roi_y1 = screen_y + 50
    roi_y2 = screen_y + 225
    roi_x1 = screen_x + 18
    roi_x2 = screen_x + 180

    roi = im_bgr[roi_y1:roi_y2, roi_x1:roi_x2]
    diff = np.linalg.norm(roi.astype(float) - bg_color, axis=2)
    mask = (diff > 11).astype(np.uint8) * 255
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.dilate(mask, kernel, iterations=2)

    inpainted = cv2.inpaint(roi, mask, inpaintRadius=4, flags=cv2.INPAINT_TELEA)
    im_bgr[roi_y1:roi_y2, roi_x1:roi_x2] = inpainted

    # 2. Composite the correct MRakee Technologies logo
    pil_clean = Image.fromarray(cv2.cvtColor(im_bgr, cv2.COLOR_BGR2RGB))

    logo_cx = screen_x + 99
    logo_cy = screen_y + 132
    lx = int(round(logo_cx - LOGO_TARGET_W / 2))
    ly = int(round(logo_cy - target_h / 2))

    opacity = OPACITY_RAMP.get(frame_idx, 1.0)
    if opacity < 1.0:
        l_arr = np.array(logo_resized).astype(float)
        l_arr[:, :, 3] *= opacity
        l_img = Image.fromarray(l_arr.astype(np.uint8))
    else:
        l_img = logo_resized

    pil_clean.paste(l_img, (lx, ly), l_img)

    if is_pil:
        return pil_clean
    return cv2.cvtColor(np.array(pil_clean), cv2.COLOR_RGB2BGR)


def main():
    if not os.path.isdir(FRAMES_DIR):
        raise SystemExit(f"Frames directory missing: {FRAMES_DIR}")
    if not os.path.isfile(LOGO_PATH):
        raise SystemExit(f"Logo asset missing: {LOGO_PATH}")

    logo = Image.open(LOGO_PATH).convert("RGBA")
    print(f"Loaded logo from {LOGO_PATH} (size: {logo.size})")
    print(f"Processing frames 0213 to 0238 in {FRAMES_DIR}...")

    modified_count = 0
    for idx in range(213, 239):
        fn = f"{idx:04d}.webp"
        fp = os.path.join(FRAMES_DIR, fn)
        if not os.path.isfile(fp):
            print(f"Warning: {fn} not found, skipping")
            continue

        im_pil = Image.open(fp).convert("RGB")
        out_pil = overlay_logo(im_pil, idx, logo_img=logo)
        out_pil.save(fp, "WEBP", quality=QUALITY)
        modified_count += 1
        pos = VERIFIED_POSITIONS.get(idx, ("auto", "auto"))
        op = OPACITY_RAMP.get(idx, 1.0)
        print(f"  [{idx:04d}.webp] Overlay applied at screen x={pos[0]}, y={pos[1]}, opacity={op:.2f}")

    print(f"\nSuccessfully updated {modified_count} frames (0213..0238).")
    print("Frames 0000..0212 were left completely untouched.")


if __name__ == "__main__":
    main()
