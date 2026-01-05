import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readdirSync } from 'fs'

// Collect all landing HTML files for multi-page build
const landingDir = path.resolve(__dirname, 'public/landing')
const landingHtmlFiles = readdirSync(landingDir)
  .filter(file => file.endsWith('.html'))
  .reduce((entries, file) => {
    const name = file.replace('.html', '')
    entries[`landing/${name}`] = path.resolve(landingDir, file)
    return entries
  }, {})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure assets use absolute paths from root
  server: {
    allowedHosts: true,
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        ...landingHtmlFiles
      },
      output: {
        // Ensure consistent asset naming for cache busting
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      }
    },
    // Copy public folder assets correctly
    copyPublicDir: true,
  },
}) 
