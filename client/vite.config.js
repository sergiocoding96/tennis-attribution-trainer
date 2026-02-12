import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Long timeout for body-language video analysis (up to 10 min)
        timeout: 660000,
        proxyTimeout: 660000,
      }
    }
  }
})
