import { defineConfig, loadEnv } from 'vite'
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

/**
 * Dev-only serverless handler for /api/enquiry.
 * Enables local testing of the Web3Forms contact form under `npm run dev`
 * without requiring `vercel dev`.
 */
function devApi() {
  return {
    name: 'mrakee-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/enquiry', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ error: 'POST only' }))
        }
        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', async () => {
          try {
            req.body = body ? JSON.parse(body) : {}
          } catch {
            req.body = {}
          }

          if (!res.status) {
            res.status = (code) => {
              res.statusCode = code
              return res
            }
          }
          if (!res.json) {
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
            }
          }

          try {
            const { default: handler } = await import('./api/enquiry.js')
            await handler(req, res)
          } catch (err) {
            console.error('Local /api/enquiry error:', err)
            if (!res.headersSent) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message || 'Internal server error' }))
            }
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), shotSink(), devApi()],
    // Relative asset paths so the build works from a subpath as well as a
    // domain root — GitHub Pages project sites serve from /<repo>/, where the
    // default absolute "/assets/..." would 404. The frame fetches in
    // useFrameSequence are already relative for the same reason.
    base: './',
  }
})
