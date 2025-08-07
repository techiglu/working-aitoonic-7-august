import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import ssr from 'vite-plugin-ssr/plugin';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    react(),
    ssr({ prerender: true }),
    imagetools(),
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
    exclude: ['lucide-react']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
          supabase: ['@supabase/supabase-js'],
          editor: ['@tiptap/react', '@tiptap/starter-kit'],
          utils: ['react-helmet-async', 'react-hot-toast']
        }
      }
    }
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  },
  ssr: {
    noExternal: ['@supabase/supabase-js', 'lucide-react']
  }
});