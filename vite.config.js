import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/uploads': {
        target: 'http://localhost:2025',  // ✅ MUST be 2025
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:2025',  // ✅ MUST be 2025
        changeOrigin: true,
      }
    }
  }
})