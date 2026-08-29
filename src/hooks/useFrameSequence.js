import { useEffect, useRef, useState } from "react";

/**
 * Loads the WebP frame sequence in public/frames/<name>/ and exposes a
 * draw(canvas, progress) scrubber.
 *
 * MEMORY IS THE WHOLE DESIGN HERE, because a decoded frame is enormous
 * next to the file it came from: the 1920x1080 frames are ~84 kB on the
 * wire and 7.91 MB once decoded, a factor of 96. So the compressed blobs
 * all stay resident (~20 MB, which is nothing) and decoded frames live
 * only in a small sliding window around the playhead.
 *
 * That window used to be KEEP=32 either side, which is 65 frames, which
 * is 514 MB of live bitmaps -- measured, not estimated -- with bursts of
 * 261 MB allocated inside a single draw when the prefetch ran. That is
 * what made the film stutter: not the drawing, which costs 0.22 ms, but
 * the garbage collector being handed half a gigabyte to reclaim while
 * the visitor was scrolling. The window below is a twentieth of that.
 *
 * The second rule is that WORK FOLLOWS THE PLAYHEAD. Both the download
 * queue and the decode window are ordered by distance from the frame
 * being looked at, and biased in the direction of travel. The queue used
 * to run 1..N regardless of where the visitor was, so scrolling into the
 * middle of the film meant waiting on blobs that were last in line --
 * which is exactly the "moves, freezes, jumps" the film was doing.
 */

/**
 * createImageBitmap is the fast, off-main-thread decode path, but it throws
 * "source image could not be decoded" in hidden/backgrounded tabs and some
 * webviews — which silently leaves the canvas blank on a deployed site even
 * though the frames loaded fine. The <img> fallback decodes everywhere.
 * ctx.drawImage accepts both. Do not remove it.
 */
async function decodeBlob(blob) {
  try {
    return { kind: "bitmap", img: await createImageBitmap(blob) };
  } catch {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.decoding = "async";
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("img decode failed"));
      img.src = url;
    });
    return { kind: "element", img, url };
  }
}

function releaseFrame(f) {
  if (f.kind === "bitmap") f.img.close();
  else URL.revokeObjectURL(f.url);
}

/* The decode window, in frames. These four numbers were tuned against a
 * measured scrub rather than guessed, and the first guess was wrong in an
 * instructive way: AHEAD=8 / IN_FLIGHT=4 cut the per-tick cost by 6x but
 * starved the decoder, so a 121-position scrub painted 107 distinct
 * frames instead of 121. Cheap ticks are worthless if the frame is not
 * ready. The numbers below hold full coverage.
 *
 * AHEAD is generous and BEHIND is not, because scrolling down is the
 * common case and every frame decoded behind the playhead is 7.91 MB
 * spent on something already seen. The old code decoded 16 in BOTH
 * directions, so half that work was always wasted; the same budget
 * spent forward reaches twice as far.
 *
 * RESIDENT is deliberately the SAME 65 frames the old window held, and
 * that is a correction rather than an oversight. Shrinking it looked
 * like the obvious win — 65 decoded 1920x1080 frames is 514 MB — and it
 * was measured to be wrong twice: at 34 frames a 13-position sweep fell
 * from a median of 13 distinct frames to 5, and at 48 to 10. The old
 * window's size was doing real work, holding enough either side of the
 * playhead that a jump usually lands on something already decoded.
 *
 * So memory stays where it was, and the savings taken here are only the
 * ones that cost nothing: not prefetching backwards as far as forwards,
 * not bursting, and not discarding decodes that land late.
 *
 * IN_FLIGHT bounds the allocation BURST, which is the part that actually
 * stalls a frame — unbounded, a fast scroll launched 33 decodes in one
 * tick and asked for 261 MB inside a single frame; at 24 it is 190 MB,
 * spread over more ticks.
 */
const AHEAD = 40;
const BEHIND = 24;
const RESIDENT = 65;
const IN_FLIGHT = 24;

export function useFrameSequence(name) {
  const blobs = useRef([]);
  const frames = useRef(new Map());
  const decoding = useRef(new Set());
  const countRef = useRef(0);
  /* Where the visitor is and which way they are going. Written by draw()
     on every tick and read by the downloader, which is how the network
     queue follows the playhead instead of ignoring it. */
  const head = useRef(0);
  const dir = useRef(1);
  const [ready, setReady] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(0);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let alive = true;
    /* Copied out of the refs here on purpose: these are plain caches, not
       DOM nodes, so the objects the cleanup needs are the ones captured
       at mount — reading .current in the cleanup would be the pattern the
       lint rule warns about, and would be wrong if the hook ever remounts
       under a different name. */
    const live = frames.current;
    const inFlight = decoding.current;

    (async () => {
      const m = await fetch(`frames/${name}/manifest.json`).then((r) => r.json());
      if (!alive) return;
      countRef.current = m.count;
      blobs.current = new Array(m.count).fill(null);
      setMeta(m);

      // pattern is "frames/film/%04d.webp", 0-based
      const url = (i) => m.pattern.replace("%04d", String(i).padStart(4, "0"));

      // Decode frame 0 first so something paints immediately.
      try {
        const b = await fetch(url(0)).then((r) => r.blob());
        if (!alive) return;
        blobs.current[0] = b;
        const f = await decodeBlob(b);
        if (!alive) return releaseFrame(f);
        frames.current.set(0, f);
        setReady(true);
      } catch {
        /* retried by the draw loop */
      }

      /* THE DOWNLOAD ORDER FOLLOWS THE PLAYHEAD.
         Rather than a fixed 1..N queue, each worker asks for whichever
         frame is still missing and closest to where the visitor is
         looking, counting forward first. The whole film still arrives,
         and in the same number of requests; it just arrives in the order
         it is needed, so scrolling into the middle no longer waits for
         everything before it. */
      const pending = new Set(
        Array.from({ length: m.count - 1 }, (_, k) => k + 1)
      );
      let done = 1;

      const nextIndex = () => {
        if (!pending.size) return -1;
        const c = head.current;
        const d = dir.current >= 0 ? 1 : -1;
        // walk outward from the playhead, leading with the way we travel
        for (let step = 0; step < m.count; step++) {
          const a = c + step * d;
          if (a >= 0 && a < m.count && pending.has(a)) return a;
          const b = c - step * d;
          if (b >= 0 && b < m.count && pending.has(b)) return b;
        }
        return pending.values().next().value; // nothing near; take anything
      };

      const workers = Array.from({ length: 8 }, async () => {
        while (alive) {
          const i = nextIndex();
          if (i < 0) break;
          pending.delete(i);
          try {
            const b = await fetch(url(i)).then((r) => r.blob());
            if (alive) blobs.current[i] = b;
          } catch {
            /* refetched implicitly on next visit */
          }
          done += 1;
          if (alive && done % 12 === 0) setProgressLoaded(done / m.count);
        }
      });
      await Promise.all(workers);
      if (alive) {
        setProgressLoaded(1);
        setReady(true);
      }
    })();

    return () => {
      alive = false;
      live.forEach(releaseFrame);
      live.clear();
      inFlight.clear();
    };
  }, [name]);

  function decode(i) {
    if (frames.current.has(i) || decoding.current.has(i) || !blobs.current[i]) return false;
    if (decoding.current.size >= IN_FLIGHT) return false;
    decoding.current.add(i);
    decodeBlob(blobs.current[i])
      /* Keep it even if the playhead moved on while this was decoding.
         An earlier version released late arrivals to "keep RESIDENT
         honest", and that was measurably wrong: under repeated large
         jumps the frame being looked at was routinely decoded, thrown
         away because the head had moved again, then re-requested — so
         coverage over a 13-position sweep decayed from 11 to 5 across
         seven runs. Eviction below already bounds memory, and it does it
         without discarding work that is already paid for. */
      .then((f) => frames.current.set(i, f))
      .catch(() => {})
      .finally(() => decoding.current.delete(i));
    return true;
  }

  /** decode ahead of the playhead, evict everything outside the window */
  function manageWindow(center, jumped) {
    const d = dir.current >= 0 ? 1 : -1;

    /* After a JUMP — an anchor link, a scrollbar drag, a flick that
       crosses many frames in one tick — the whole window is cold, and
       spreading the decode budget 24 frames ahead means the frame the
       visitor is actually looking at competes with 23 they are not. So
       a jump buys a narrow, greedy window for one tick: land the target
       and its immediate neighbours, then widen again on the next tick
       once there is something correct on screen. */
    const reach = jumped ? 4 : AHEAD;

    // Nearest-first, and the current frame before anything else: if only
    // one decode slot is free this tick, it must go to the frame being
    // asked for right now.
    decode(center);
    for (let step = 1; step <= reach; step++) {
      decode(center + step * d);
      if (step <= BEHIND) decode(center - step * d);
    }

    if (frames.current.size > RESIDENT) {
      for (const [idx, f] of frames.current) {
        // keep a little more on the leading side than the trailing one
        const ahead = (idx - center) * d;
        if (ahead > AHEAD || ahead < -BEHIND) {
          releaseFrame(f);
          frames.current.delete(idx);
        }
      }
    }
  }

  /* Nearest decoded frame, searched only within the window.
     The old version scanned the entire sequence, so a cold cache meant
     up to 478 Map lookups per tick AND painting a frame from a
     completely different shot — the "jump". Outside the window there is
     nothing worth showing, so the caller keeps the current picture
     instead, which reads as the film holding rather than teleporting. */
  function nearestDecoded(i) {
    if (frames.current.has(i)) return frames.current.get(i);
    const reach = AHEAD + BEHIND;
    for (let d = 1; d <= reach; d++) {
      if (frames.current.has(i - d)) return frames.current.get(i - d);
      if (frames.current.has(i + d)) return frames.current.get(i + d);
    }
    return null;
  }

  /* Canvas metrics, cached.
     clientWidth/clientHeight are layout reads, and draw() runs after the
     caption style writes in the same tick, so reading them there forced
     a synchronous recalc every frame: measured at 0.388 ms against
     0.013 ms cached, a 30x difference for a number that only changes on
     resize. Invalidated below by a ResizeObserver. */
  const geom = useRef({ el: null, cw: 0, ch: 0, dpr: 0, ctx: null, ro: null, last: null, dirty: true });

  function measure(canvas) {
    const g = geom.current;
    g.dirty = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(canvas.clientWidth * dpr);
    const ch = Math.round(canvas.clientHeight * dpr);
    g.cw = cw;
    g.ch = ch;
    g.dpr = dpr;
    if (cw && ch && (canvas.width !== cw || canvas.height !== ch)) {
      canvas.width = cw;
      canvas.height = ch;
      // The drawing buffer resize resets context state, so re-apply it.
      if (g.ctx) {
        g.ctx.imageSmoothingEnabled = true;
        g.ctx.imageSmoothingQuality = "high";
      }
    }
  }

  function attach(canvas) {
    const g = geom.current;
    if (g.el === canvas) return;
    g.ro?.disconnect();
    g.el = canvas;
    g.ctx = canvas.getContext("2d");
    if (g.ctx) {
      // Chrome defaults imageSmoothingQuality to "low", which is a cheap
      // bilinear filter. Set once rather than per frame; measured at
      // 0.22 ms for the draw either way, so quality is free here.
      g.ctx.imageSmoothingEnabled = true;
      g.ctx.imageSmoothingQuality = "high";
    }
    measure(canvas);
    /* Setting canvas.width clears the drawing buffer, so a resize has to
       repaint or a visitor who resizes without scrolling is left looking
       at a blank hero until the next tick.

       BOTH a ResizeObserver and a window resize listener, which is not
       belt-and-braces for its own sake: ResizeObserver callbacks are
       delivered on the rendering lifecycle, so anything that suppresses
       compositing suppresses them too — measured here in an automated
       browser, where the element's clientWidth changed from 1425 to
       1265 and the observer never fired, leaving the drawing buffer at
       the old size. The window listener does not depend on a frame
       being produced. Whichever arrives first marks the geometry dirty;
       draw() re-measures once and clears the flag, so the per-frame
       layout read this cache exists to remove does not come back. */
    const invalidate = () => {
      g.dirty = true;
      measure(canvas);
      if (g.last) blit(g.last);
    };
    g.ro = new ResizeObserver(invalidate);
    g.ro.observe(canvas);
    g.onResize = invalidate;
    window.addEventListener("resize", invalidate);
    window.addEventListener("orientationchange", invalidate);

    /* Dragging the window to a monitor with a different pixel ratio
       changes how many device pixels the same CSS box needs, and fires
       neither resize nor the observer. The old code caught it only
       because it re-read devicePixelRatio on every single frame. This
       watches for the change instead of polling for it. */
    const dprQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    g.onDpr = () => invalidate();
    dprQuery.addEventListener?.("change", g.onDpr);
    g.dprQuery = dprQuery;
  }

  /** progress in [0,1] -> draw the matching frame, cover-fit and centred */
  function draw(canvas, progress) {
    if (!canvas || countRef.current === 0) return;
    const i = Math.round(
      Math.min(1, Math.max(0, progress)) * (countRef.current - 1)
    );

    // Direction, for the prefetch and the download queue. Sticky: a
    // single frame of noise should not flip which way we read ahead.
    let jumped = false;
    if (i !== head.current) {
      jumped = Math.abs(i - head.current) > BEHIND;
      dir.current = i > head.current ? 1 : -1;
      head.current = i;
    }

    if (geom.current.el !== canvas) attach(canvas);
    const g = geom.current;
    if (g.dirty) measure(canvas);

    manageWindow(i, jumped);
    const frame = nearestDecoded(i);
    if (!frame) return;

    // If the element has no layout size yet, bail rather than sizing the
    // drawing buffer to 0x0. A zeroed buffer renders nothing and only
    // recovers on a later draw — which, if the visitor never scrolls,
    // never comes, leaving a blank hero.
    if (g.cw === 0 || g.ch === 0) {
      measure(canvas);
      if (g.cw === 0 || g.ch === 0) return;
    }
    const ctx = g.ctx;
    if (!ctx) return;

    g.last = frame;
    blit(frame);
  }

  /* The paint itself. Cover-fit, always: fill the stage edge to edge and
     crop whatever does not fit, centred. Contain-fit was tried first and
     left visible gutters on any viewport wider than the frame's 16:9 —
     which is most laptops — and a letterboxed film reads as a video
     embed rather than as the page itself. The subject is centred in
     every chapter, so what gets cropped is always background. */
  function blit(frame) {
    const g = geom.current;
    const ctx = g.ctx;
    if (!ctx || !g.cw || !g.ch) return;
    const src = frame.img;
    ctx.clearRect(0, 0, g.cw, g.ch);
    const s = Math.max(g.cw / src.width, g.ch / src.height);
    ctx.drawImage(src, (g.cw - src.width * s) / 2, (g.ch - src.height * s) / 2,
                  src.width * s, src.height * s);
  }

  useEffect(() => {
    const g = geom.current; // a stable cache object, captured at mount
    return () => {
      g.ro?.disconnect();
      g.ro = null;
      if (g.onResize) {
        window.removeEventListener("resize", g.onResize);
        window.removeEventListener("orientationchange", g.onResize);
        g.onResize = null;
      }
      if (g.dprQuery && g.onDpr) {
        g.dprQuery.removeEventListener?.("change", g.onDpr);
        g.dprQuery = null;
        g.onDpr = null;
      }
      g.el = null;
      g.ctx = null;
      g.last = null;
    };
  }, []);

  return { ready, draw, meta, progressLoaded };
}
