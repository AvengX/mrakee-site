import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works from a subpath as well as a
  // domain root — GitHub Pages project sites serve from /<repo>/, where the
  // default absolute "/assets/..." would 404. The frame fetches in
  // useFrameSequence are already relative for the same reason.
  base: './',
})
