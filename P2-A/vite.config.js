import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// P2-A — admin panel (mobile only)
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Firebase alag chunk me — app chunk chhota rehta hai
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase'
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5176,
    allowedHosts: true,
    headers: { 'X-Frame-Options': 'ALLOWALL' },
  },
})
