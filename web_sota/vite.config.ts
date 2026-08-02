import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base: the built dashboard is mounted at /mcp-dashboard/ (gateway),
  // loaded from tauri://localhost (Tauri), and served at / (Vite dev).
  base: './',
  server: {
    host: '0.0.0.0',
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
