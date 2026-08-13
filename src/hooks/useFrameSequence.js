import { useEffect, useRef, useState } from "react";

/**
 * Loads the WebP frame sequence in public/frames/<name>/ and exposes a
 * draw(canvas, progress) scrubber.
 *
 * Memory strategy: the compressed blobs stay resident (~14 MB), but decoded
 * frames live only in a sliding window around the playhead — decoding all
 * 334 frames at 1400x788 would be well over a gigabyte of pixels.
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

export function useFrameSequence(name) {
  const blobs = useRef([]);
  const frames = useRef(new Map());
  const decoding = useRef(new Set());
  const countRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(0);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    let alive = true;

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

      // Then pull the rest. Small concurrency keeps the main thread free.
      let done = 1;
      const queue = Array.from({ length: m.count - 1 }, (_, k) => k + 1);
      const workers = Array.from({ length: 8 }, async () => {
        while (alive && queue.length) {
          const i = queue.shift();
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
      frames.current.forEach(releaseFrame);
      frames.current.clear();
    };
  }, [name]);

  function decode(i) {
    if (frames.current.has(i) || decoding.current.has(i) || !blobs.current[i]) return;
    decoding.current.add(i);
    decodeBlob(blobs.current[i])
      .then((f) => frames.current.set(i, f))
      .catch(() => {})
      .finally(() => decoding.current.delete(i));
  }

  /** decode ahead of the playhead, evict far-away frames */
  function manageWindow(center) {
    const AHEAD = 16;
    const KEEP = 32;
    for (let d = 0; d <= AHEAD; d++) {
      if (center + d < countRef.current) decode(center + d);
      if (center - d >= 0) decode(center - d);
    }
    if (frames.current.size > KEEP * 2) {
      for (const [idx, f] of frames.current) {
        if (Math.abs(idx - center) > KEEP) {
          releaseFrame(f);
          frames.current.delete(idx);
        }
      }
    }
  }

  function nearestDecoded(i) {
    if (frames.current.has(i)) return frames.current.get(i);
    for (let d = 1; d < countRef.current; d++) {
      if (frames.current.has(i - d)) return frames.current.get(i - d);
      if (frames.current.has(i + d)) return frames.current.get(i + d);
    }
    return null;
  }

  /** progress in [0,1] -> draw the matching frame, contain-fit and centred */
  function draw(canvas, progress) {
    if (!canvas || countRef.current === 0) return;
    const i = Math.round(
      Math.min(1, Math.max(0, progress)) * (countRef.current - 1)
    );
    manageWindow(i);
    const frame = nearestDecoded(i);
    if (!frame) return;
    const src = frame.img;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(canvas.clientWidth * dpr);
    const ch = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, cw, ch);

    // Adaptive fit. On a landscape viewport the frame's aspect is close to
    // the stage's, so contain-fit shows the whole composition with only a
    // sliver of letterbox. On a portrait phone contain-fit would shrink a
    // 16:9 frame to a thin strip marooned in a tall stage, so cover-fit and
    // crop the sides instead — the subject is centred in every chapter.
    const stageAspect = cw / ch;
    const cover = stageAspect < 1.3;
    const s = cover
      ? Math.max(cw / src.width, ch / src.height)
      : Math.min(cw / src.width, ch / src.height);
    const w = src.width * s;
    const h = src.height * s;
    ctx.drawImage(src, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  return { ready, draw, meta, progressLoaded };
}
