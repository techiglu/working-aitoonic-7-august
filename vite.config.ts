import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { prerender } from 'vite-plugin-prerender';
import { generatePrerenderRoutes } from './scripts/generate-prerender-routes.js';

export default defineConfig(async ({ command }) => {
  // Generate routes for prerendering during build
  let prerenderRoutes = [
    '/',
    '/categories',
    '/ai-agent',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/advertise',
    '/affiliate',
    '/sitemap'
  ];

  if (command === 'build') {
    try {
      prerenderRoutes = await generatePrerenderRoutes();
    } catch (error) {
      console.warn('⚠️  Could not generate dynamic routes, using static routes only');
    }
  }

  return {
  plugins: [
    react(),
    prerender({
      routes: prerenderRoutes,
      minify: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        keepClosingSlash: true,
        sortAttributes: true
      },
      postProcess(renderedRoute) {
        // Clean up any hydration artifacts
        renderedRoute.html = renderedRoute.html
          .replace(/data-reactroot=""/g, '')
          .replace(/data-react-helmet="true"/g, '')
          .replace(/<!--react-empty[^>]*-->/g, '');
        return renderedRoute;
      }
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
    exclude: ['lucide-react']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', '@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
  };
});