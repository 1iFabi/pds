import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // Configuración para Vercel
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Asegurar que los assets mantengan nombres consistentes
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
