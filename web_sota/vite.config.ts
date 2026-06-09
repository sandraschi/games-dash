import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['goliath'],
    port: 10986,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:10987',
        changeOrigin: true,
      },
      '/mcp': {
        target: 'http://127.0.0.1:10987',
        changeOrigin: true,
        ws: true,
      },
      '/health': {
        target: 'http://127.0.0.1:10987',
        changeOrigin: true,
      },
    },
  },
})
