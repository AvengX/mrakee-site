# Solution images — 17 prompts for Google Flow

One image per solution in the Solutions section, in this exact order.

## How to hand them back

Save as **`01.jpg` … `17.jpg`** (numbers below), drop them all into:

```
D:\STUDY\PP\kiosk-scroll\public\solutions\
```

That's it — the site picks them up automatically and falls back to a film
still for any number that isn't there yet. So you can deliver them in
batches; whatever exists gets used.

JPG or PNG both fine (rename to `.jpg` either way, or tell me and I'll
adjust). Don't resize or crop them — I'll handle that.

---

## Read this before generating

**Aspect ratio: 16:9 landscape.** The panel is 16:9. A portrait image
gets cropped to its middle and you lose the sides.

**Keep the bottom-right corner empty.** Flow burns its four-pointed-star
watermark at roughly x 89–93%, y 82–89%. I crop it off, which costs the
outer 12% of the width — so don't put the subject on the right edge.

**No real brand names or logos.** Not on storefronts, not on screens, not
on signage. The current hero footage has what reads as a real luxury
fashion marque on a shopfront, which is a trademark problem on a
commercial site and something I'd like to stop repeating. Say
"unbranded", "generic retail signage", "no visible logos" — it's in the
shared block below.

**Avoid a lot of on-screen text.** Generators produce convincing-looking
gibberish, which reads as fake the moment anyone leans in. Ask for large
simple UI — a big number, an arrow, a chart, a photo — rather than
paragraphs or dense menus.

**Consistency is the whole point.** All 17 sit in one component and get
compared side by side. Paste the shared style block onto the end of every
single prompt, unchanged.

---

## Shared style block — append to every prompt

```
Photorealistic commercial interior photography, bright and airy, abundant
natural daylight, soft neutral palette of white, pale grey and warm timber.
Shot on a full-frame camera at 35mm, f/2.8, shallow depth of field with the
display in sharp focus. Clean modern architecture, uncluttered, premium but
not flashy. The screen is the subject and is clearly lit and legible.
No visible brand names, logos or trademarks anywhere. Minimal on-screen
text — large simple interface elements only. Nothing important in the
bottom-right corner. 16:9 landscape.
```

---

## The 17 prompts

**01 — Interactive Kiosk**
> A person standing at a free-standing self-service touchscreen kiosk in a
> bright shopping centre concourse, mid-interaction with one hand on the
> screen, the screen showing a simple large-tile product menu.

**02 — Wayfinder**
> A large vertical touchscreen directory in a modern shopping mall atrium,
> showing a simplified colour-coded floor plan with a single glowing route
> line and a destination marker, a shopper looking at it from behind.

**03 — Video Walls**
> A seamless 3x3 tiled video wall filling the end of a corporate lobby,
> driven as one continuous abstract flowing image in soft blues and teals,
> people crossing the polished floor in front of it, motion-blurred.

**04 — Digital Menu Board**
> A row of three overhead digital menu boards above a quick-service
> restaurant counter, showing large appetising food photography and simple
> price rows, warm counter lighting, a staff member below in soft focus.

**05 — FIDS**
> A wide airport departures board built from multiple large landscape
> displays mounted side by side above a terminal walkway, rows of flight
> times in clean type, travellers passing beneath with luggage.

**06 — PIDS**
> A slim landscape passenger information display mounted on a railway
> platform canopy showing next-train times, a modern train station platform
> stretching away behind it, daylight, a few waiting passengers.

**07 — Biometric Immigration**
> A row of automated border control eGates in an airport immigration hall,
> each with a compact screen and a document reader glowing softly, clean
> stainless and glass, one traveller approaching a gate.

**08 — Virtual Concierge — Transport**
> A tall portrait remote-assistance kiosk in an airport terminal showing a
> friendly uniformed staff member on a live video call, a traveller standing
> in front of it, bright terminal architecture behind.

**09 — Virtual Concierge — Mall & Hotel**
> A portrait remote-assistance screen in a hotel lobby showing a concierge
> on video call, warm timber and stone interior, a guest with a suitcase
> approaching, soft evening lamp light mixed with daylight.

**10 — Interactive Retail**
> A large touchscreen display on a clothing retail shop floor showing an
> endless-aisle product grid, a shopper browsing it with rails of unbranded
> garments either side, bright store lighting.

**11 — Smart Fitting Room**
> A fitting room interior with a mirror-integrated touchscreen beside the
> mirror showing simple size and colour options, folded garments on a
> bench, warm flattering light, calm and premium.

**12 — Queue Management**
> A ticketing and now-serving display above a bank or service counter
> showing a single large counter number, a small queue of people waiting in
> an orderly line, bright modern branch interior.

**13 — Meeting Room Manager**
> A small landscape touch panel mounted beside a glass meeting room door
> showing a simple availability state and a schedule strip, a modern office
> corridor beyond the glass, colleagues meeting inside, soft focus.

**14 — Smart Product Finder**
> A compact wall-mounted search screen at the end of a supermarket aisle
> showing a simple aisle-and-shelf result with a large directional arrow, a
> shopper with a trolley looking at it, bright grocery lighting.

**15 — Digital Standee**
> A single free-standing portrait digital poster display in a bright mall
> walkway showing a bold abstract promotional image, glossy floor
> reflection, shoppers passing on either side in motion blur.

**16 — Hotel Self Check-In / Out**
> A pair of self-service check-in kiosks in a hotel lobby with a card
> dispenser slot, a guest completing check-in at one of them, reception desk
> softly out of focus behind, warm premium interior.

**17 — Feedback System**
> A small tabletop feedback terminal at the end of a service counter showing
> four large simple smiley-face rating buttons, a customer reaching to tap
> one, bright clean interior, close-up composition.

---

## If a generation comes out wrong

Common fixes, in the order worth trying:

1. **Screen looks off / blown out** — add "the screen is bright but not
   overexposed, its content clearly readable".
2. **Too dark or moody** — add "high-key lighting, bright airy exposure".
   Every one of these has to sit on a white page.
3. **Cluttered** — add "minimal, uncluttered, generous empty space".
4. **Fake-looking text on screen** — reduce what you ask the screen to
   show: one number, one arrow, one photograph.
5. **Subject drifting right** — add "subject centred or slightly left of
   centre".
