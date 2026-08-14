/* ================================================================
   PIXEL FORGE — the timeline
   ----------------------------------------------------------------
   Everything the signature sequence does is a pure function of one
   number: scroll progress 0 → 1. Nothing here touches the DOM, three.js
   or React, which means the whole choreography can be read, reasoned
   about and re-timed in one file, and any frame can be reproduced by
   calling these with a progress value.

   The story:

     0.00 – 0.20   a field of loose pixels drifting in bright space
     0.20 – 0.42   they feel the pull and gather toward the centre
     0.38 – 0.58   they snap into a grid — the screen's own pixel matrix
     0.55 – 0.72   the bezel and frame materialise around that grid
     0.68 – 0.88   depth develops: body, mount, real perspective
     0.62 – 0.80   the screen powers on and the pixels hand off to it
     0.78 – 1.00   content plays, camera settles on the finished product

   Phases deliberately OVERLAP. A sequence where each stage waits for the
   last to finish reads as a slideshow; the overlap is what makes it feel
   like one continuous transformation.
   ================================================================ */

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Normalise p within [a,b] to 0-1, flat outside. */
export const range = (p, a, b) => clamp01((p - a) / (b - a));

export const smooth = (t) => t * t * (3 - 2 * t);
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Overshoot, for the moment a pixel arrives at its cell and settles. */
export const easeOutBack = (t, k = 1.24) =>
  1 + (k + 1) * Math.pow(t - 1, 3) + k * Math.pow(t - 1, 2);

/** Ramp up then back down across [a,b] — used for one-shot flourishes. */
export const pulse = (p, a, b) => {
  const t = range(p, a, b);
  return Math.sin(t * Math.PI);
};

/* ---------------------------------------------------------------
   Phase values. Each returns 0-1 and is consumed by exactly one
   thing, so re-timing a beat means editing one pair of numbers.
   --------------------------------------------------------------- */
export function phases(p) {
  return {
    /** how much the cloud still drifts freely — dies as the pull starts */
    drift: 1 - smooth(range(p, 0.14, 0.4)),
    /** pixels pulled from their scattered cloud toward the panel volume */
    gather: smooth(range(p, 0.18, 0.44)),
    /** pixels locked to their exact cell in the screen matrix */
    grid: range(p, 0.38, 0.6),
    /** bezel and frame fading and scaling into being */
    frame: smooth(range(p, 0.55, 0.74)),
    /** body depth, mount, the object becoming physical */
    depth: smooth(range(p, 0.66, 0.9)),
    /** screen backlight coming up */
    power: smooth(range(p, 0.62, 0.8)),
    /** particles dissolving into the real screen surface */
    handoff: smooth(range(p, 0.7, 0.88)),
    /** a single bright scan sweeping down as the panel wakes */
    scan: pulse(p, 0.6, 0.78),
    /** global entrance — pixels fading up out of nothing at the very start */
    entrance: smooth(range(p, 0.0, 0.06)),
  };
}

/* ---------------------------------------------------------------
   Camera choreography.

   Keys are explicit {p, v} stops rather than a spline, because a
   CatmullRom curve is parameterised by arc length — feed it 0.7 and you
   do not land on the pose authored for 0.7. Piecewise smoothstep costs
   nothing and puts each pose exactly where the brief asks for it.
   --------------------------------------------------------------- */
const POSITION_KEYS = [
  { p: 0.0, v: [0.0, 0.25, 9.8] }, // front, distant
  { p: 0.25, v: [0.1, 0.12, 7.7] }, // slowly approaching
  { p: 0.5, v: [1.05, 0.02, 6.5] }, // easing to the side
  { p: 0.7, v: [2.15, -0.42, 5.3] }, // low and wide — dramatic
  { p: 0.85, v: [1.25, 0.62, 4.6] }, // rising, moving around it
  { p: 1.0, v: [0.4, 0.34, 6.0] }, // settled three-quarter product view
];

const TARGET_KEYS = [
  { p: 0.0, v: [0, 0.0, 0] },
  { p: 0.5, v: [0, -0.05, 0] },
  { p: 0.7, v: [0, 0.12, 0] },
  { p: 1.0, v: [0, -0.02, 0] },
];

/** Field of view. Widening as the camera closes in is what sells "dramatic". */
const FOV_KEYS = [
  { p: 0.0, v: [33] },
  { p: 0.5, v: [35] },
  { p: 0.7, v: [46] },
  { p: 0.85, v: [40] },
  { p: 1.0, v: [34] },
];

/** Piecewise smoothstep through explicit progress stops. */
function sampleKeys(keys, p, out) {
  if (p <= keys[0].p) {
    for (let i = 0; i < out.length; i++) out[i] = keys[0].v[i];
    return out;
  }
  const last = keys[keys.length - 1];
  if (p >= last.p) {
    for (let i = 0; i < out.length; i++) out[i] = last.v[i];
    return out;
  }
  for (let k = 0; k < keys.length - 1; k++) {
    const a = keys[k];
    const b = keys[k + 1];
    if (p >= a.p && p <= b.p) {
      const t = smooth((p - a.p) / (b.p - a.p));
      for (let i = 0; i < out.length; i++) out[i] = a.v[i] + (b.v[i] - a.v[i]) * t;
      return out;
    }
  }
  return out;
}

/**
 * How far the shot is off-centre.
 *
 * While the pixels are still a diffuse field, copy can sit anywhere —
 * text over drifting particles reads fine and looks deliberate. The
 * moment they consolidate into a solid panel, anything on top of it is
 * unreadable, so the composition commits: product to the right, copy in
 * a clear lane on the left, for the whole back half.
 *
 * Applied to the camera's TARGET rather than the object, so it is a pan
 * — the product never appears to slide sideways in the world.
 */
/* Starts at 0.34, not 0.38: caption 02 opens at 0.43, and the pan has to
   already be underway by then or its first few frames are only ~40px
   clear of the pixel block. */
export const composeShift = (p) => smooth(range(p, 0.34, 0.56));

const _pos = [0, 0, 0];
const _tgt = [0, 0, 0];
const _fov = [0];

export function cameraAt(p) {
  return {
    position: sampleKeys(POSITION_KEYS, p, _pos),
    target: sampleKeys(TARGET_KEYS, p, _tgt),
    fov: sampleKeys(FOV_KEYS, p, _fov)[0],
  };
}

/* ---------------------------------------------------------------
   Screen content.

   Four slides, cross-faded with a different transition each time so the
   screen itself tells a small story rather than just cycling. Returns
   the two slide indices in play and how far between them we are.
   --------------------------------------------------------------- */
const SLIDE_STOPS = [
  { at: 0.76, mode: 0 }, // 0 → 1, pixel dissolve
  { at: 0.85, mode: 1 }, // 1 → 2, scan
  { at: 0.93, mode: 2 }, // 2 → 3, horizontal wipe
];
const SLIDE_SPAN = 0.045;

export function screenAt(p) {
  let from = 0;
  let to = 0;
  let mix = 0;
  let mode = 0;

  for (let i = 0; i < SLIDE_STOPS.length; i++) {
    const s = SLIDE_STOPS[i];
    if (p >= s.at) {
      from = i + 1;
      to = i + 1;
      mode = s.mode;
    }
    if (p >= s.at - SLIDE_SPAN && p < s.at) {
      from = i;
      to = i + 1;
      mode = s.mode;
      mix = easeInOutCubic(range(p, s.at - SLIDE_SPAN, s.at));
    }
  }
  return { from, to, mix, mode };
}

/* ---------------------------------------------------------------
   The DOM captions layered over the sequence. Each is a plain window in
   progress space; the overlay fades and drifts them the same way the
   film's captions work, so the two sections speak the same language.
   --------------------------------------------------------------- */
export const CAPTIONS = [
  {
    in: -0.06,
    out: 0.17,
    align: "center",
    eyebrow: "Digital Signage · Kiosks · Singapore",
    title: ["Every", "screen", "begins", "as", "a", "single", "pixel."],
    grad: [5, 6],
    body: "Scroll, and watch a few thousand of them become a display.",
    hero: true,
  },
  {
    in: 0.21,
    out: 0.37,
    align: "left",
    eyebrow: "01 · Field",
    title: ["Loose", "light,", "no", "order."],
    body: "Thousands of independent points, drifting. Nothing yet tells them where to be.",
  },
  {
    in: 0.43,
    out: 0.57,
    // left from here on — see composeShift. By this point the pixels are
    // a solid block and nothing can be read on top of them.
    align: "left",
    eyebrow: "02 · Formation",
    title: ["They", "find", "the", "grid."],
    body: "Every pixel takes its cell. The matrix that will carry the picture assembles itself.",
  },
  {
    in: 0.62,
    out: 0.76,
    align: "left",
    eyebrow: "03 · Structure",
    title: ["Then", "it", "becomes", "an", "object."],
    body: "Bezel, chassis, mount. The grid stops being an idea and starts being hardware.",
  },
  {
    in: 0.86,
    out: 1.1,
    align: "left",
    eyebrow: "04 · Signage",
    title: ["Built", "to", "run", "for", "years."],
    grad: [3, 4],
    body: "Commercial panels, media players and the software that drives them — as one estate.",
    cta: true,
  },
];
