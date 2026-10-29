import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Root (combined) project: Landing at "/", Support Center under "/site".
// All Site code is imported from ../Site/src, so there is only one copy.
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_BASE_PATH': JSON.stringify('/site'),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    fs: {
      // allow importing ../Site/src during dev
      allow: [fileURLToPath(new URL('.', import.meta.url)), fileURLToPath(new URL('../Site', import.meta.url))],
    },
    headers: {
      'X-Frame-Options': 'ALLOWALL'
    }
  }
})
