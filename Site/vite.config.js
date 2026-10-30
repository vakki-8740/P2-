import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
build: {
    rollupOptions: {
      output: {
        // Firebase alag chunk me — pehla page load chhota rehta hai.
        manualChunks: { firebase: ['firebase/app', 'firebase/firestore'] },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL'
    }
  }
})
