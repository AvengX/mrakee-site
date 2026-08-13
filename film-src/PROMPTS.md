# Mrakee Technologies — Google Flow video prompts

Drop finished clips in this folder as `ch1.mp4` … `ch6.mp4`.

## Flow settings

| Setting | Value |
|---|---|
| Model | Veo 3.1 — highest quality tier available |
| Aspect ratio | **16:9** (every clip, no exceptions) |
| Resolution | 1080p |
| Duration | 8s default is fine |
| Audio | ignored — it gets stripped |

**Aspect ratio must be identical across all six clips.** Mixed aspects force
letterbox normalisation and the crossfades between chapters will jump.

## The constraint block

Paste this at the end of **every** prompt:

> Bright high-key lighting, airy, clean, pale surfaces. No text, no lettering,
> no words, no numbers, no logos, no readable signage anywhere in frame — every
> screen displays only abstract flowing gradient motion graphics in mint green
> and warm gold. One continuous take, no cuts, no transitions, no camera shake,
> no zoom snaps. Slow deliberate camera movement at constant speed.
> Photorealistic, 35mm, shallow depth of field, natural daylight.

### Why "no text"

Video models render text as garbled pseudo-lettering. On a digital-signage
company's own website that is the one flaw a visitor will notice immediately.
Abstract mint/gold screen content reads as intentional design, and real UI can
be overlaid in HTML afterwards where it will be crisp and actually legible.

### Why "slow, continuous, one direction"

The clip gets scrubbed by scroll position. Any cut, shake or direction change
becomes a visual snap when the user drags the scrollbar. Orbits, dollies and
pull-backs scrub beautifully; whip pans do not.

---

## Chapter 1 — The object

> A single freestanding self-service kiosk alone in a vast bright empty atrium.
> White terrazzo floors, floor-to-ceiling windows, soft morning light. The kiosk
> is a slim vertical tower in pale brushed aluminium with a warm gold base and a
> tall portrait screen glowing soft mint green. The camera slowly orbits 180
> degrees around the kiosk at chest height, keeping it centred, revealing its
> thin profile as it passes the edge.

## Chapter 2 — It wakes

> Extreme close-up macro of a vertical glass display panel in a bright white
> room. The camera drifts slowly upward across the glass surface. Soft mint
> green light blooms outward from the centre of the panel and spreads to the
> edges, with a thin warm gold light bar glowing along the lower bezel.
> Dust motes drift in a shaft of daylight. Reflections of a bright window slide
> across the glass.

## Chapter 3 — Retail

> A bright modern clothing store with pale oak fixtures and white walls. A
> woman's hand reaches out and touches a tall interactive kiosk screen glowing
> mint green. The camera dollies slowly sideways past her, keeping the kiosk in
> frame, revealing the open shop floor and daylight windows behind. Shoppers
> move softly out of focus in the background.

## Chapter 4 — Quick service

> A bright airy quick-service restaurant counter in warm morning light. Three
> large landscape display panels are mounted in a row above the counter, each
> glowing with soft mint and gold gradient motion. The camera tracks slowly
> right along the counter, the panels sliding through frame. Pale wood, white
> tile, brushed steel. A staff member works quietly out of focus below.

## Chapter 5 — Transport

> A vast bright airport terminal with a high white vaulted ceiling and enormous
> windows flooding the hall with daylight. A long curved wall of tall display
> panels glows mint green along the concourse. The camera glides slowly forward
> down the concourse toward the display wall. Travellers walk past as soft
> motion-blurred silhouettes.

## Chapter 6 — Scale

> A bright multi-level shopping atrium seen from the upper floor, white balconies
> and glass balustrades, daylight pouring through a glazed roof. The camera pulls
> slowly backward and upward, revealing more and more glowing mint and gold
> display screens on every level, dozens of them, until the whole atrium is in
> frame. Clean, calm, luminous.

---

## Optional extras

Only if the first six come back well — these are section backgrounds, not film
chapters, so they should be near-static and loop-friendly.

**A. Texture loop** — very slow drift across brushed aluminium and glass edge in
bright light, mint reflection sliding across.

**B. Hands detail** — close-up of fingertips touching a bright glass panel,
soft mint ripple spreading from the touch point, white background.

**C. Installation** — a technician's hands mounting a slim display panel to a
white wall, bright daylight, shallow focus.

---

## Handing them back

Name them `ch1.mp4` … `ch6.mp4` and drop them in this folder. Partial sets are
fine — send what you have and the film gets built from those.

Regenerate individual chapters freely; each one is independent, so a bad
chapter 4 never means redoing chapters 1–3.

## Notes on people

Keep faces out of focus, distant, or out of frame — hands, silhouettes and
mid-distance figures. Close-up AI faces look uncanny next to photoreal
hardware, and they raise likeness questions on a commercial site.
