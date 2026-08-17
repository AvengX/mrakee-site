# Why MRAKEE — six photographs (optional)

The Why section's sticky panel currently shows the reason's number over a
brand gradient. That is deliberate, not a placeholder for its own sake:
there is no photography of "Technology Agnostic", and pairing these six
with the self-service-kiosk stock the rest of the site uses would read as
filler.

If you would rather it showed photographs, generate these six and drop
them in `public/why/01.jpg` … `06.jpg`, then add an `img` to each entry
in `WHY` in `src/content/mrakee.js`:

```js
{ t: "Technical Transformation", img: "why/01.jpg", d: "…" },
```

`WhyScroll.jsx` already renders `img` when it is present — no component
change is needed.

**House style, apply to all six:** photographic, natural daylight, light
and airy interior, muted palette with warm neutrals, shallow depth of
field, 16:9, no on-screen text, no visible brand marks or logos on any
device or storefront, no watermark.

---

**01 — Technical Transformation**
> "Each requirement is evaluated both technically and user friendly."

Two AV engineers at a desk reviewing a rack elevation drawing on a large
monitor, one pointing at the schematic, a partially built equipment rack
visible behind them, bright modern office, daylight from a window left.

**02 — End to End Capability**
> "One team to assist customers from concept to deployment."

A team of four around a table mid-project-review: printed floor plans,
laptops, a tablet showing a room layout, one person standing and
gesturing at the plans. Collaborative, unposed, mid-conversation.

**03 — Technology Agnostic**
> "Understanding requirements to successfully recommending the right
> solution."

Close, shallow-focus shot of hands connecting cabling into a patch panel
in an AV rack — a mix of different connector types and cable colours in
frame, all hardware plain and unbranded. Cool rack light against a warm
room beyond.

**04 — Intentional Design**
> "Technology should feel natural — intuitive interfaces and user
> experiences."

A single hand about to touch a wall-mounted room control panel beside a
meeting room door, the room softly out of focus behind the glass. Calm,
minimal, architectural. The panel's screen should be a plain gradient,
no interface elements.

**05 — Scalable Solutions**
> "Designs which grow as the customer grows."

Wide shot down a corridor of identical glass-walled meeting rooms, each
with the same display and camera set-up, receding into the distance.
Repetition is the subject.

**06 — Reliable, Seamless Execution**
> "Planning successfully means successful project outcomes."

An installer on a low platform ladder making a final adjustment to a
ceiling-mounted speaker or camera in a finished, furnished room — the
space clearly complete and clean around them, not a building site.
