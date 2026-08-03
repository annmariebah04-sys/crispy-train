import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves project sites from /<repo-name>/, so assets need that
// prefix when built in CI. Local dev and other hosts (Vercel, etc.) keep '/'.
const base = process.env.GITHUB_PAGES === 'true' ? '/crispy-train/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
