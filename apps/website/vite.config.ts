import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Distinct ports so `website` and `booking-admin` can run at the same time
// (turbo run dev launches both in parallel).
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  preview: { port: 4174 },
})
