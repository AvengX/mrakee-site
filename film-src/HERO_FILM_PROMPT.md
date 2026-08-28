# Hero film prompt — v3

Changed from v2 on client feedback: the kiosk was cut in half by the
frame edge, the background displays read as small and distant, the kiosk
screen showed a departures list, and no screen used the brand palette.

**Read this first — it is why the kiosk moves inward.** The build
pipeline crops the right 12% of every frame to remove the generator
watermark (CROP in build_film.py). Anything in the right third is
therefore half gone before the site ever loads it. That is exactly what
happened to the departures kiosk.

---

**Format:** 10 seconds, 1920x1080, 24fps, 16:9.
Three environments connected by **seamless foreground occlusion wipes**.

**Global visual rules:**
Maintain identical camera speed, camera height, lens perspective,
exposure, white balance, colour grade, motion blur and lighting
consistency throughout. The camera performs one continuous leftward
tracking movement. **No cuts between scenes.** Every scene change
happens while a nearby foreground object completely blocks the lens,
then reveals the next environment.

## BRAND PALETTE — every screen in this film

| Role | Colour |
|---|---|
| Primary screen background | Deep Teal #006f73 |
| Secondary panels and tiles | Teal #00a0a0 |
| Highlights, icons, key figures | Premium Gold #d8a32a |
| Text and icons on dark panels | Off White #f7f8f6 |
| Deepest panel and bezel | Executive Dark #0b1f2a |
| Alerts only, sparingly | Corporate Red #c81010 |

Screens read as **teal panels with gold accents and off-white text**. No
blue corporate dashboards, no white-on-black airport boards, no purple,
no orange.

## THE KIOSK SCREEN — a self-service interface, not a departures list

The main kiosk displays a **touch self-service home screen**: a grid of
**four large tiles**, each with one big simple icon and **one or two
words underneath in large type**.

* Tiles are large, filling most of the screen, generously spaced.
* Icons are big, simple and pictographic — an aeroplane, a location pin,
  a headset, a speech bubble.
* Labels are one or two words at large size. Nothing at body-text size.
* Tiles in Teal #00a0a0 and Deep Teal #006f73 on an Off White #f7f8f6
  ground, with one tile picked out in Premium Gold #d8a32a.
* A slim header strip at the top in Executive Dark #0b1f2a.

**Do not put a dense departures table on the main kiosk.** Rows of small
flight times render as unreadable scribble at this resolution — the
previous clip proved it, and the illegible rows are visible in the
finished film. Large tiles with big icons are the only signage content
that survives. This applies to every close screen in this film.

## Opening Frame — Critical

The opening frame must work as a standalone still photograph.

A tall portrait digital signage kiosk stands **fully inside the frame**,
screen facing directly toward the camera, showing the four-tile
interface above.

**Placement, strict:** the kiosk occupies roughly the **55%-80% band of
the frame width** — right of centre, with clear empty space between its
right edge and the frame edge. The entire kiosk, both side bezels and
its floor stand, visible with room to spare. **No part of the kiosk may
touch or cross the right 15% of the frame.**

Behind it, a bright premium modern airport concourse with:

* Glass curtain wall
* Pale polished flooring
* Soft natural daylight
* Realistic architectural details
* **A LARGE video wall on the rear wall** — wide and tall, spanning a
  substantial part of the background, unmistakably a big installed
  screen rather than a distant sign. Simple bold teal-and-gold panels
  with a few large words, no fine detail.

The **left and centre remain spacious, calm and uncluttered**.

No people or crowds.

## Scene 1 — Airport | 0-3.2s

The camera begins a **smooth, perfectly steady tracking movement from
right to left at constant speed**.

The kiosk stays fully in frame throughout, never sliding under the right
edge. The large rear video wall stays prominent. Additional displays
glow through the concourse, all in the brand palette, all with large
simple content.

## Transition 1 — Continuous Foreground Occlusion Wipe | 3.2-3.8s

**Critical.** The camera **does not stop, accelerate, rotate or cut**.
It continues tracking left at **exactly the same constant speed**.

A large structural column very close to the camera enters the foreground
and gradually fills the entire frame, completely occluding the view for
roughly half a second.

While the lens is hidden, the environment changes seamlessly from
airport to hotel lobby. As the column continues left and exits frame,
the lobby is revealed naturally.

The viewer should feel the camera simply travelled behind a column and
emerged in a different building. **No visible cut whatsoever.**

## Scene 2 — Hotel Lobby | 3.8-6.3s

Same leftward tracking, **no change in speed or direction**.

* Warm timber architecture
* Elegant reception desk
* **A LARGE digital display wall behind the reception desk** — wide,
  tall, unmistakably a big installed screen, showing a simple welcome
  layout in teal and gold with a few large words
* A tall portrait welcome kiosk, **fully within frame**, same four-tile
  interface style
* Premium contemporary materials, warm natural interior lighting

Keep the **left third open**. Keep every screen clear of the right 15%.

## Transition 2 — Continuous Foreground Occlusion Wipe | 6.3-6.9s

**Absolutely no cut.** Same speed, same direction.

A tall planted screen, architectural partition or timber divider passes
**extremely close to the lens**, gradually filling the frame. While the
lens is occluded the environment changes to the restaurant. The object
clears frame, revealing it.

No flash, no brightness shift, no fade, no dissolve, no temporal
discontinuity.

## Scene 3 — Restaurant | 6.9-8.5s

Same constant leftward tracking.

* **A LARGE menu display wall above the counter** — a wide bank of big
  screens reading as one large display, Deep Teal with Premium Gold
  headings and Off White text. Big category headings and large item
  names only. **No small print, no dense price columns.**
* Warm evening ambience
* Realistic food-service counter
* A table-side ordering screen, fully in frame
* Warm timber and architectural finishes

Keep the **right third open and uncluttered**.

## Ending — 8.5-10s

The camera slows **smoothly and naturally** to a complete stop.

A single portrait kiosk settles **slightly left of centre**, entirely
within frame with clear space on all sides.

The screen resolves to the **MRAKEE TECHNOLOGIES logo**: the gold and
teal M mark above the MRAKEE wordmark, on an Off White #f7f8f6 screen.
Large, clean, centred, filling most of the display.

Hold completely still for the **final full second**.

## Composition & Safe Area

All kiosks and displays must remain:

* Clear of the top 8%
* Clear of the bottom 8%
* **Clear of the outermost 15% on the right — that strip is trimmed in
  post and anything there is destroyed**

Any screen whose content matters sits **entirely within the left 85%**.

## Environment

All locations completely **unbranded**, except the final MRAKEE
TECHNOLOGIES logo reveal. No real airport, hotel or restaurant names, no
storefront brands, no recognisable corporate identities.

## Motion & Transition Priority

**The entire video must feel like one uninterrupted camera shot.**

Camera tracking, foreground object enters, full lens occlusion,
environment changes invisibly, foreground object exits, new environment
revealed, identical camera motion continues.

## Strict Avoid List

No flash. No white flash. No light bloom. No lens flare. No exposure
change. No brightness change. No colour-grade change. No fade to white.
No fade to black. No cross-dissolve. No jump cut. No hard cut. No glitch
transition. No speed ramp. No acceleration during transitions. No whip
pan. No camera shake. No zoom snap. No artificial motion blur. No
teleporting between environments. No visible scene morphing. No crowds.
No brand logos except the final MRAKEE TECHNOLOGIES logo. No storefront
signage. No watermarks. No text overlays.

**New in v3:**

* No kiosk cropped by the frame edge.
* No dense tables, timetables or price lists on any screen.
* No small text of any kind on any screen.
* No blue, purple or orange interface colours.
