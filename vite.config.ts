import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3500,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
