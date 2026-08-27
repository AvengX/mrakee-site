# Assistant artwork

Nothing here is required. Every file is optional and the site falls back
to the drawn SVG avatar when one is missing — a missing asset never
breaks the page.

| File | Where it appears | Framing |
|---|---|---|
| `greeter.png` | the floating launcher, bottom-right of every page | **full figure**, transparent background |
| `avatar-idle.png` | panel header, at rest | head and shoulders |
| `avatar-listening.png` | panel header, listening **and** thinking | head and shoulders |
| `avatar-answering.png` | panel header, speaking | head and shoulders |

## greeter.png — the one the client asked for

* **Transparent PNG.** No background, no circle, no plate, no shadow
  baked in. The page draws none of those either; the artwork's own alpha
  is the entire silhouette.
* **Portrait, roughly 3:4.** Rendered around 200-270px tall on desktop
  and 180px on a phone, so supply it at **768 x 1024** or larger.
* **Full figure, hands included.** This is the file where the namaste
  has to be visible, and it is the reason the launcher is not a circle:
  a 64px circular badge crops to the face and the gesture ceases to
  exist. Frame from the top of the head to somewhere below the hands.
* **Nothing critical at the very bottom edge** — the figure sits close
  to the bottom of the window.

Drop it in and the launcher switches from the circular bust to the
figure on its own. There is no code change and no config.

## The three avatar-*.png files

Head and shoulders, square, 512 x 512, filling the frame — these ARE
cropped to a circle, at 44px, so the face wants to fill about 55% of the
height and the poses have to differ in the face rather than in gesture.
The full brief is in `avatar-src/AVATAR_PROMPT.md`.
