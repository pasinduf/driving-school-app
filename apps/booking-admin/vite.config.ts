import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Emit built assets under /ba-assets instead of /assets so this app can be
    // served on the same domain as the website (subpath hosting) without its
    // asset URLs colliding with the website's /assets/*.
    assetsDir: 'ba-assets',
  },
})
