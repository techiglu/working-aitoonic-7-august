import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      jsxRuntime: 'automatic',
    })
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', '@supabase/supabase-js']
        }
      }
    },
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
  },
  server: {
    cors: true,
    hmr: {
      overlay: false
    }
  },
  esbuild: {
    target: 'es2020',
    format: 'esm',
    treeShaking: true,
  }
});