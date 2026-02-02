import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,        // Disable sourcemaps in production for security
    minify: 'terser',        // Better minification than esbuild
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react']
        }
      }
    }
  },
  server: {
    proxy: {
      '/upload': 'http://localhost:7001',
      '/download-docx': 'http://localhost:7001',
      '/health': 'http://localhost:7001'
    }
  }
})
