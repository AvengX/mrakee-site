# Industry environments — 13 prompts for Google Flow

The Industries section now shows **one large environment at a time** with
a numbered rail underneath, instead of a field of pills.

Until these exist, each industry borrows the nearest Solutions image.
That works, but it means the same photograph appears twice on the page —
and five of the thirteen (Education, Outdoor, Automotive, Entertainment,
Healthcare) have no good match at all and are showing something merely
adjacent. These fix both.

## How to hand them back

Save as **`01.jpg` … `13.jpg`** in this order and drop into:

```
D:\STUDY\PP\kiosk-scroll\public\industries\
```

Picked up automatically. Partial batches fine — anything missing keeps
its fallback. Don't resize or crop; I do the watermark crop and the
compression.

## Rules, same as before

- **16:9 landscape.**
- **Keep the bottom-LEFT clear.** Different from the other two sets: the
  industry label and description sit over the lower-left of these
  images. Compose the subject centre or right.
- Also keep the **bottom-right** clear of anything critical — that's
  where Flow puts its watermark and I crop it off.
- **No real brand names or logos**, on storefronts, screens or signage.
- **Minimal on-screen text** — generators produce convincing gibberish.

## Shared style block — append to every prompt

```
Photorealistic architectural interior photography, wide establishing shot,
bright and airy, abundant natural daylight, premium contemporary materials
in white, pale stone, glass and warm timber. Shot on a full-frame camera at
24mm, f/4, deep focus, camera at standing eye level. The digital display is
integrated into the architecture and is the focal point, its screen clearly
lit and legible. Calm, uncluttered, high-end corporate. A few people,
motion-blurred, never posed for camera. No visible brand names, logos or
trademarks. Minimal on-screen text. Subject centre or right of frame,
bottom-left kept clear and uncluttered. 16:9 landscape.
```

## The 13 prompts

**01 — Retail**
> A premium shopping mall interior with a tall portrait digital display
> built into a stone-clad column, showing a bold abstract promotional
> image, unbranded storefronts either side, shoppers passing.

**02 — Quick Service Restaurants**
> A modern quick-service restaurant counter with a run of three digital
> menu boards mounted above it showing large appetising food photography,
> warm counter lighting, a customer ordering below.

**03 — Transportation**
> An airport terminal concourse with a long horizontal flight information
> display spanning above a walkway, rows of simple departure times,
> travellers with luggage moving beneath in soft motion blur.

**04 — Banking & Finance**
> A modern bank branch interior with a slim digital queue display above a
> service counter showing a single large counter number, pale stone and
> timber, a customer approaching an adviser at a desk.

**05 — Education**
> A contemporary university building atrium with a large digital
> wayfinding and announcements display beside a wide staircase, students
> crossing the floor, tall glazing and daylight.

**06 — DOOH & Outdoor**
> A large outdoor digital billboard on the facade of a modern city
> building at dusk, showing a bold abstract advertisement, clean
> architecture, pedestrians below, blue-hour sky still bright.

**07 — Corporate Communications**
> A corporate headquarters lobby with a wide digital video wall behind the
> reception desk showing a calm abstract brand visual, double-height space,
> employees crossing the floor.

**08 — Grocery**
> A premium supermarket aisle with a digital promotional display mounted
> at the end of the aisle and slim shelf-edge screens along the shelving,
> bright even lighting, a shopper with a trolley.

**09 — Automotive**
> A luxury car showroom with a very large digital display beside a single
> vehicle on a plinth, showing a simple full-scale configurator interface,
> polished floor, tall glazing, minimal and calm.

**10 — Hotel & Casino**
> A luxury hotel lobby with an elegant portrait digital concierge display
> near reception showing a simple welcome and events board, warm timber and
> stone, a guest with a suitcase, evening lamp light mixed with daylight.

**11 — Government**
> A modern public service building interior with a digital queue and
> information display above a row of service counters, clean civic
> architecture, orderly waiting area, people seated.

**12 — Entertainment**
> A cinema foyer with a run of large digital session boards above the
> concession counter showing simple showtimes, warm accent lighting,
> people queueing, contemporary interior.

**13 — Healthcare**
> A modern hospital atrium with a clean digital wayfinding display beside
> a corridor entrance showing simple departmental directions, calm pale
> palette, natural light, staff and visitors passing quietly.

## If they come out wrong

1. **Screen blown out** — "the display is bright but not overexposed, its
   content clearly readable".
2. **Too dark** (06, 10, 12 especially) — "high-key, bright exposure". All
   thirteen sit on a white page.
3. **Screen too small in frame** — "the display is large and prominent,
   occupying a significant part of the frame".
4. **Subject drifting bottom-left** — "subject centred or right of frame,
   bottom-left corner empty floor".
