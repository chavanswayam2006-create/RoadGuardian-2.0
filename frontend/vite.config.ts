import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Base path is configurable via VITE_BASE_PATH env var.
// - Vercel: defaults to '/' (no prefix needed)
// - GitHub Pages: set VITE_BASE_PATH=/RoadGuardian-2.0/ in workflow env
export default defineConfig(() => ({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
}))

