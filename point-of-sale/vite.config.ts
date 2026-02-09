import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    legalComments: 'none',
  },
  build: {
    minify: 'esbuild',
  },
  server: {
    allowedHosts: ['0b0f-105-163-1-103.ngrok-free.app'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
