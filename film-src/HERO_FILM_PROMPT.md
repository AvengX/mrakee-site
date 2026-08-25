# Hero film — replacement clip prompt

The current `sources/hero.mp4` has three problems. Two are fixable by
reshooting, one is a legal risk:

1. **Fake text.** The flight board's rows are gibberish — `CAI6A4`,
   `AAI3AAIAA`. That is the generator, not the encode: the same glyphs
   are in the untouched 1920x1080 source. Video models cannot draw small
   body text, so the answer is to not ask them for any.
2. **CHANEL storefronts** are visible roughly 2.8–5.6s. Someone else's
   trademark in a client's hero film.
3. Screens sit where the captions sit, which is why the captions need a
   frosted plate behind them.

---

## The prompt

Paste as one block into Google Flow / Veo.

> Cinematic corporate brand film, one continuous slow camera move
> through a bright modern airport terminal into an adjoining commercial
> concourse. Freestanding self-service kiosks and large-format wall
> displays throughout. Every screen shows oversized graphics only: one
> large wayfinding arrow, one big abstract data visualisation in teal
> and amber, smooth motion-graphic colour gradients, simple large icons.
> No paragraphs, no lists, no tables, no timetable rows, no small text
> anywhere. Completely unbranded environment — no company names, no
> logos, no storefront signage, no shop fascias. Natural daylight
> through a full-height glass curtain wall, polished pale stone floor,
> warm neutral palette, teal and amber light spilling from the screens.
> Shallow depth of field, gentle handheld drift, no cuts, no text
> overlays. Photoreal, cinematic colour grade, 16:9.

**Negative / avoid list:**

> small text, body text, paragraphs, tabular data, timetable rows,
> flight schedule, price lists, menus, subtitles, captions, watermarks,
> logos, brand names, storefront signage, shop names, cluttered signage,
> crowds, motion blur, cuts, transitions

---

## Settings to ask for

| | |
|---|---|
| Length | **10 seconds** — the caption timings are cut to 10s |
| Resolution | **1920x1080** minimum |
| Frame rate | **24 fps** (the build samples at 24) |
| Aspect | 16:9, no letterbox |

## Composition constraints from the build pipeline

* **Keep everything important in the left 88% of frame.** The build
  crops `iw*0.88` from the left edge to remove the Veo watermark, so the
  right 12% is discarded. Anything you care about on the right is lost.
* **Keep clear of the top and bottom 6%** — the same crop takes a 16:9
  slice out of the middle, losing 65px top and bottom of a 1080 frame.
* **Leave quiet ground for the captions.** Four sit over this clip; each
  wants a low-detail area at roughly:

  | at | position | caption |
  |---|---|---|
  | 0.2s | centre | AV Integration made Simple. |
  | 3.5s | left third | Centrally Managed for Seamless Distribution. |
  | 7.1s | right third | Spaces that are intuitive to use. |
  | 9.5s | centre | One Team, One Goal, One Seamless AV experience. |

  A wall, a floor, or an out-of-focus window in those places at those
  moments. If the reshoot gives clean ground there, the caption plate can
  be dialled back or dropped — `--cap-plate` in index.css is the one
  number.

## If a screen must carry a word

Two words maximum, set very large, filling most of the panel. Short
words survive; "Flight Schedule" came through fine while the rows below
it did not. Expect to accept whatever spelling it gives you.

## Rebuilding after you have the clip

Replace the file, keeping the name `film-src/sources/hero.mp4`, then:

    python film-src/build_film.py

It re-cuts all 239 frames at 1690x950 and rewrites the manifest. Check
the printed scroll fractions afterwards — if the arc lands differently,
the caption windows in `FilmStage.jsx` (`in` / `out`) need moving to
match what the footage is showing at that moment.
