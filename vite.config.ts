import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Aitoonic',
        short_name: 'Aitoonic',
        description: 'Discover the best AI tools and agents',
        theme_color: '#1a237e',
        background_color: '#121212',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', '@supabase/supabase-js'],
          utils: ['react-helmet-async', 'react-hot-toast']
        }
      }
    },
    // Enable minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  server: {
    cors: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    },
    // Enable HTTP/2 push
    http2: true,
    // Optimize dev server
    hmr: {
      overlay: false
    },
    // Add proxy for Supabase if needed
    proxy: {
      '/api': {
        target: 'https://opmsmqtxqrivlyigpudk.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // Enable experimental features for better performance
  esbuild: {
    target: 'es2020',
    format: 'esm',
    treeShaking: true,
  },
  // Optimize CSS
  css: {
    devSourcemap: false,
  }
});