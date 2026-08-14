import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Opt-in ResizeObserver shim, injected in dev only, active only on
 * `?grab=1`.
 *
 * react-three-fiber's <Canvas> does not create its WebGL root until
 * react-use-measure reports a non-zero size, and that measurement comes
 * from a ResizeObserver. In any embedded browser that does not composite,
 * ResizeObserver never fires — so the scene never mounts at all, and the
 * failure looks exactly like "the 3D is broken" when in fact nothing has
 * been asked to draw yet.
 *
 * This swaps in a polling implementation backed by getBoundingClientRect,
 * which does return correct values there. Gated behind a query flag so a
 * normal dev session is untouched.
 */
const RO_SHIM = `
(function () {
  if (!location.search.includes("grab=1")) return;
  window.ResizeObserver = class {
    constructor(cb) { this.cb = cb; this.els = new Set();
      this.t = setInterval(() => this.poll(), 120); }
    observe(el) { this.els.add(el); setTimeout(() => this.poll(), 0); }
    unobserve(el) { this.els.delete(el); }
    disconnect() { clearInterval(this.t); this.els.clear(); }
    poll() {
      const entries = [];
      for (const el of this.els) {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        const box = [{ inlineSize: r.width, blockSize: r.height }];
        entries.push({ target: el, contentRect: r,
          borderBoxSize: box, contentBoxSize: box, devicePixelContentBoxSize: box });
      }
      if (entries.length) this.cb(entries, this);
    }
  };
})();
`;

/**
 * Dev-only frame grabber.
 *
 * A scroll-scrubbed WebGL sequence is unusually hard to inspect: you
 * cannot see progress 0.47 without physically scrolling to it. This
 * accepts a PNG data URL on POST /__shot and writes it to
 * .shots/<name>.png, which turns "what does it look like at t?" into a
 * file that can be opened. Combined with the window.__forge handle the
 * scene installs in dev, any frame can be rendered on demand.
 *
 * Dev server only — `apply: "serve"` keeps it out of the build.
 */
function frameGrabber() {
  return {
    name: 'mrakee-frame-grabber',
    apply: 'serve',
    transformIndexHtml() {
      return [{ tag: 'script', injectTo: 'head-prepend', children: RO_SHIM }]
    },
    configureServer(server) {
      server.middlewares.use('/__shot', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end('POST only')
        }
        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', () => {
          try {
            const { name, data } = JSON.parse(body)
            // Refuse anything that would escape the shots directory.
            const safe = String(name).replace(/[^a-z0-9_.-]/gi, '_')
            const dir = path.resolve(process.cwd(), '.shots')
            fs.mkdirSync(dir, { recursive: true })
            const b64 = data.replace(/^data:image\/png;base64,/, '')
            fs.writeFileSync(path.join(dir, `${safe}.png`), Buffer.from(b64, 'base64'))
            res.end('ok')
          } catch (e) {
            res.statusCode = 400
            res.end(String(e))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), frameGrabber()],
  // Relative asset paths so the build works from a subpath as well as a
  // domain root — GitHub Pages project sites serve from /<repo>/, where the
  // default absolute "/assets/..." would 404. The frame fetches in
  // useFrameSequence are already relative for the same reason.
  base: './',
})
