import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Dev-only screenshot sink.
 *
 * POST a PNG data URL to /__shot and it lands in .shots/<name>.png,
 * which turns "does this actually look right?" into a file that can be
 * opened. Useful for anything drawn in code — SVG marks, canvas output,
 * a component in a state that is awkward to reach by hand.
 *
 * `apply: 'serve'` keeps it out of the build; nothing here ships.
 */
function shotSink() {
  return {
    name: 'mrakee-shot-sink',
    apply: 'serve',
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
            // refuse anything that would escape the shots directory
            const safe = String(name).replace(/[^a-z0-9_.-]/gi, '_')
            const dir = path.resolve(process.cwd(), '.shots')
            fs.mkdirSync(dir, { recursive: true })
            fs.writeFileSync(
              path.join(dir, `${safe}.png`),
              Buffer.from(data.replace(/^data:image\/png;base64,/, ''), 'base64')
            )
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
  plugins: [react(), shotSink()],
  // Relative asset paths so the build works from a subpath as well as a
  // domain root — GitHub Pages project sites serve from /<repo>/, where the
  // default absolute "/assets/..." would 404. The frame fetches in
  // useFrameSequence are already relative for the same reason.
  base: './',
})
