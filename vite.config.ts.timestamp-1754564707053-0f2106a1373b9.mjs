// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
import { prerender } from "file:///home/project/node_modules/vite-plugin-prerender/dist/index.mjs";

// scripts/generate-prerender-routes.js
import { createClient } from "file:///home/project/node_modules/@supabase/supabase-js/dist/main/index.js";
import fs from "fs";
import path from "path";
var __vite_injected_original_import_meta_url = "file:///home/project/scripts/generate-prerender-routes.js";
var supabaseUrl = process.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
var supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";
var supabase = createClient(supabaseUrl, supabaseAnonKey);
async function generatePrerenderRoutes() {
  try {
    console.log("\u{1F680} Generating prerender routes...");
    const routes = [
      // Static routes
      "/",
      "/categories",
      "/ai-agent",
      "/about",
      "/contact",
      "/terms",
      "/privacy",
      "/advertise",
      "/affiliate",
      "/sitemap"
    ];
    const { data: categories } = await supabase.from("categories").select("name").order("name");
    if (categories) {
      categories.forEach((category) => {
        const slug = category.name.toLowerCase().replace(/\s+/g, "-");
        routes.push(`/category/${slug}`);
      });
      console.log(`\u2705 Added ${categories.length} category routes`);
    }
    const { data: tools } = await supabase.from("tools").select("name").order("name").limit(500);
    if (tools) {
      tools.forEach((tool) => {
        const slug = tool.name.toLowerCase().replace(/\s+/g, "-");
        routes.push(`/ai/${slug}`);
      });
      console.log(`\u2705 Added ${tools.length} tool routes`);
    }
    const { data: agents } = await supabase.from("agents").select("name").eq("status", "active").order("name");
    if (agents) {
      agents.forEach((agent) => {
        const slug = agent.name.toLowerCase().replace(/\s+/g, "-");
        routes.push(`/ai-agent/${slug}`);
      });
      console.log(`\u2705 Added ${agents.length} agent routes`);
    }
    const routesContent = `export const prerenderRoutes = ${JSON.stringify(routes, null, 2)};`;
    const outputPath = path.join(process.cwd(), "src", "prerender-routes.js");
    fs.writeFileSync(outputPath, routesContent);
    console.log(`\u{1F389} Generated ${routes.length} total routes for prerendering`);
    console.log(`\u{1F4DD} Routes saved to: ${outputPath}`);
    return routes;
  } catch (error) {
    console.error("\u274C Error generating prerender routes:", error);
    const fallbackRoutes = [
      "/",
      "/categories",
      "/ai-agent",
      "/about",
      "/contact",
      "/terms",
      "/privacy",
      "/advertise",
      "/affiliate",
      "/sitemap"
    ];
    const routesContent = `export const prerenderRoutes = ${JSON.stringify(fallbackRoutes, null, 2)};`;
    const outputPath = path.join(process.cwd(), "src", "prerender-routes.js");
    fs.writeFileSync(outputPath, routesContent);
    console.log(`\u26A0\uFE0F  Using fallback routes (${fallbackRoutes.length} routes)`);
    return fallbackRoutes;
  }
}
if (__vite_injected_original_import_meta_url === `file://${process.argv[1]}`) {
  generatePrerenderRoutes();
}

// vite.config.ts
var vite_config_default = defineConfig(async ({ command }) => {
  let prerenderRoutes = [
    "/",
    "/categories",
    "/ai-agent",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
    "/advertise",
    "/affiliate",
    "/sitemap"
  ];
  if (command === "build") {
    try {
      prerenderRoutes = await generatePrerenderRoutes();
    } catch (error) {
      console.warn("\u26A0\uFE0F  Could not generate dynamic routes, using static routes only");
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
          renderedRoute.html = renderedRoute.html.replace(/data-reactroot=""/g, "").replace(/data-react-helmet="true"/g, "").replace(/<!--react-empty[^>]*-->/g, "");
          return renderedRoute;
        }
      }),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
        manifest: {
          name: "Aitoonic",
          short_name: "Aitoonic",
          description: "Discover the best AI tools and agents",
          theme_color: "#1a237e",
          background_color: "#121212",
          icons: [
            {
              src: "/android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: "/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png"
            }
          ]
        }
      })
    ],
    optimizeDeps: {
      exclude: ["lucide-react"]
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            ui: ["lucide-react", "@supabase/supabase-js"]
          }
        }
      }
    },
    server: {
      headers: {
        "Cache-Control": "public, max-age=31536000"
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic2NyaXB0cy9nZW5lcmF0ZS1wcmVyZW5kZXItcm91dGVzLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XG5pbXBvcnQgeyBwcmVyZW5kZXIgfSBmcm9tICd2aXRlLXBsdWdpbi1wcmVyZW5kZXInO1xuaW1wb3J0IHsgZ2VuZXJhdGVQcmVyZW5kZXJSb3V0ZXMgfSBmcm9tICcuL3NjcmlwdHMvZ2VuZXJhdGUtcHJlcmVuZGVyLXJvdXRlcy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhc3luYyAoeyBjb21tYW5kIH0pID0+IHtcbiAgLy8gR2VuZXJhdGUgcm91dGVzIGZvciBwcmVyZW5kZXJpbmcgZHVyaW5nIGJ1aWxkXG4gIGxldCBwcmVyZW5kZXJSb3V0ZXMgPSBbXG4gICAgJy8nLFxuICAgICcvY2F0ZWdvcmllcycsXG4gICAgJy9haS1hZ2VudCcsXG4gICAgJy9hYm91dCcsXG4gICAgJy9jb250YWN0JyxcbiAgICAnL3Rlcm1zJyxcbiAgICAnL3ByaXZhY3knLFxuICAgICcvYWR2ZXJ0aXNlJyxcbiAgICAnL2FmZmlsaWF0ZScsXG4gICAgJy9zaXRlbWFwJ1xuICBdO1xuXG4gIGlmIChjb21tYW5kID09PSAnYnVpbGQnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHByZXJlbmRlclJvdXRlcyA9IGF3YWl0IGdlbmVyYXRlUHJlcmVuZGVyUm91dGVzKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUud2FybignXHUyNkEwXHVGRTBGICBDb3VsZCBub3QgZ2VuZXJhdGUgZHluYW1pYyByb3V0ZXMsIHVzaW5nIHN0YXRpYyByb3V0ZXMgb25seScpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHByZXJlbmRlcih7XG4gICAgICByb3V0ZXM6IHByZXJlbmRlclJvdXRlcyxcbiAgICAgIG1pbmlmeToge1xuICAgICAgICBjb2xsYXBzZUJvb2xlYW5BdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICBjb2xsYXBzZVdoaXRlc3BhY2U6IHRydWUsXG4gICAgICAgIGRlY29kZUVudGl0aWVzOiB0cnVlLFxuICAgICAgICBrZWVwQ2xvc2luZ1NsYXNoOiB0cnVlLFxuICAgICAgICBzb3J0QXR0cmlidXRlczogdHJ1ZVxuICAgICAgfSxcbiAgICAgIHBvc3RQcm9jZXNzKHJlbmRlcmVkUm91dGUpIHtcbiAgICAgICAgLy8gQ2xlYW4gdXAgYW55IGh5ZHJhdGlvbiBhcnRpZmFjdHNcbiAgICAgICAgcmVuZGVyZWRSb3V0ZS5odG1sID0gcmVuZGVyZWRSb3V0ZS5odG1sXG4gICAgICAgICAgLnJlcGxhY2UoL2RhdGEtcmVhY3Ryb290PVwiXCIvZywgJycpXG4gICAgICAgICAgLnJlcGxhY2UoL2RhdGEtcmVhY3QtaGVsbWV0PVwidHJ1ZVwiL2csICcnKVxuICAgICAgICAgIC5yZXBsYWNlKC88IS0tcmVhY3QtZW1wdHlbXj5dKi0tPi9nLCAnJyk7XG4gICAgICAgIHJldHVybiByZW5kZXJlZFJvdXRlO1xuICAgICAgfVxuICAgIH0pLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ3JvYm90cy50eHQnLCAnYXBwbGUtdG91Y2gtaWNvbi5wbmcnXSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6ICdBaXRvb25pYycsXG4gICAgICAgIHNob3J0X25hbWU6ICdBaXRvb25pYycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRGlzY292ZXIgdGhlIGJlc3QgQUkgdG9vbHMgYW5kIGFnZW50cycsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzFhMjM3ZScsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjMTIxMjEyJyxcbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICcvYW5kcm9pZC1jaHJvbWUtMTkyeDE5Mi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICcvYW5kcm9pZC1jaHJvbWUtNTEyeDUxMi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXVxuICB9LFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICB1aTogWydsdWNpZGUtcmVhY3QnLCAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncHVibGljLCBtYXgtYWdlPTMxNTM2MDAwJ1xuICAgIH1cbiAgfVxuICB9O1xufSk7IiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3NjcmlwdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc2NyaXB0cy9nZW5lcmF0ZS1wcmVyZW5kZXItcm91dGVzLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvc2NyaXB0cy9nZW5lcmF0ZS1wcmVyZW5kZXItcm91dGVzLmpzXCI7aW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLy8gTG9hZCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9VUkwgfHwgJ2h0dHBzOi8veW91ci1wcm9qZWN0LnN1cGFiYXNlLmNvJztcbmNvbnN0IHN1cGFiYXNlQW5vbktleSA9IHByb2Nlc3MuZW52LlZJVEVfU1VQQUJBU0VfQU5PTl9LRVkgfHwgJ3lvdXItYW5vbi1rZXknO1xuXG5jb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VBbm9uS2V5KTtcblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVQcmVyZW5kZXJSb3V0ZXMoKSB7XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coJ1x1RDgzRFx1REU4MCBHZW5lcmF0aW5nIHByZXJlbmRlciByb3V0ZXMuLi4nKTtcbiAgICBcbiAgICBjb25zdCByb3V0ZXMgPSBbXG4gICAgICAvLyBTdGF0aWMgcm91dGVzXG4gICAgICAnLycsXG4gICAgICAnL2NhdGVnb3JpZXMnLFxuICAgICAgJy9haS1hZ2VudCcsXG4gICAgICAnL2Fib3V0JyxcbiAgICAgICcvY29udGFjdCcsXG4gICAgICAnL3Rlcm1zJyxcbiAgICAgICcvcHJpdmFjeScsXG4gICAgICAnL2FkdmVydGlzZScsXG4gICAgICAnL2FmZmlsaWF0ZScsXG4gICAgICAnL3NpdGVtYXAnXG4gICAgXTtcblxuICAgIC8vIEZldGNoIGNhdGVnb3JpZXNcbiAgICBjb25zdCB7IGRhdGE6IGNhdGVnb3JpZXMgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbSgnY2F0ZWdvcmllcycpXG4gICAgICAuc2VsZWN0KCduYW1lJylcbiAgICAgIC5vcmRlcignbmFtZScpO1xuXG4gICAgaWYgKGNhdGVnb3JpZXMpIHtcbiAgICAgIGNhdGVnb3JpZXMuZm9yRWFjaChjYXRlZ29yeSA9PiB7XG4gICAgICAgIGNvbnN0IHNsdWcgPSBjYXRlZ29yeS5uYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzKy9nLCAnLScpO1xuICAgICAgICByb3V0ZXMucHVzaChgL2NhdGVnb3J5LyR7c2x1Z31gKTtcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coYFx1MjcwNSBBZGRlZCAke2NhdGVnb3JpZXMubGVuZ3RofSBjYXRlZ29yeSByb3V0ZXNgKTtcbiAgICB9XG5cbiAgICAvLyBGZXRjaCB0b29sc1xuICAgIGNvbnN0IHsgZGF0YTogdG9vbHMgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbSgndG9vbHMnKVxuICAgICAgLnNlbGVjdCgnbmFtZScpXG4gICAgICAub3JkZXIoJ25hbWUnKVxuICAgICAgLmxpbWl0KDUwMCk7IC8vIExpbWl0IHRvIHByZXZlbnQgdG9vIG1hbnkgcm91dGVzXG5cbiAgICBpZiAodG9vbHMpIHtcbiAgICAgIHRvb2xzLmZvckVhY2godG9vbCA9PiB7XG4gICAgICAgIGNvbnN0IHNsdWcgPSB0b29sLm5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMrL2csICctJyk7XG4gICAgICAgIHJvdXRlcy5wdXNoKGAvYWkvJHtzbHVnfWApO1xuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZyhgXHUyNzA1IEFkZGVkICR7dG9vbHMubGVuZ3RofSB0b29sIHJvdXRlc2ApO1xuICAgIH1cblxuICAgIC8vIEZldGNoIGFnZW50c1xuICAgIGNvbnN0IHsgZGF0YTogYWdlbnRzIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgLmZyb20oJ2FnZW50cycpXG4gICAgICAuc2VsZWN0KCduYW1lJylcbiAgICAgIC5lcSgnc3RhdHVzJywgJ2FjdGl2ZScpXG4gICAgICAub3JkZXIoJ25hbWUnKTtcblxuICAgIGlmIChhZ2VudHMpIHtcbiAgICAgIGFnZW50cy5mb3JFYWNoKGFnZW50ID0+IHtcbiAgICAgICAgY29uc3Qgc2x1ZyA9IGFnZW50Lm5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMrL2csICctJyk7XG4gICAgICAgIHJvdXRlcy5wdXNoKGAvYWktYWdlbnQvJHtzbHVnfWApO1xuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZyhgXHUyNzA1IEFkZGVkICR7YWdlbnRzLmxlbmd0aH0gYWdlbnQgcm91dGVzYCk7XG4gICAgfVxuXG4gICAgLy8gV3JpdGUgcm91dGVzIHRvIGZpbGVcbiAgICBjb25zdCByb3V0ZXNDb250ZW50ID0gYGV4cG9ydCBjb25zdCBwcmVyZW5kZXJSb3V0ZXMgPSAke0pTT04uc3RyaW5naWZ5KHJvdXRlcywgbnVsbCwgMil9O2A7XG4gICAgXG4gICAgY29uc3Qgb3V0cHV0UGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnc3JjJywgJ3ByZXJlbmRlci1yb3V0ZXMuanMnKTtcbiAgICBmcy53cml0ZUZpbGVTeW5jKG91dHB1dFBhdGgsIHJvdXRlc0NvbnRlbnQpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKGBcdUQ4M0NcdURGODkgR2VuZXJhdGVkICR7cm91dGVzLmxlbmd0aH0gdG90YWwgcm91dGVzIGZvciBwcmVyZW5kZXJpbmdgKTtcbiAgICBjb25zb2xlLmxvZyhgXHVEODNEXHVEQ0REIFJvdXRlcyBzYXZlZCB0bzogJHtvdXRwdXRQYXRofWApO1xuICAgIFxuICAgIHJldHVybiByb3V0ZXM7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignXHUyNzRDIEVycm9yIGdlbmVyYXRpbmcgcHJlcmVuZGVyIHJvdXRlczonLCBlcnJvcik7XG4gICAgXG4gICAgLy8gRmFsbGJhY2sgdG8gc3RhdGljIHJvdXRlcyBvbmx5XG4gICAgY29uc3QgZmFsbGJhY2tSb3V0ZXMgPSBbXG4gICAgICAnLycsXG4gICAgICAnL2NhdGVnb3JpZXMnLFxuICAgICAgJy9haS1hZ2VudCcsXG4gICAgICAnL2Fib3V0JyxcbiAgICAgICcvY29udGFjdCcsXG4gICAgICAnL3Rlcm1zJyxcbiAgICAgICcvcHJpdmFjeScsXG4gICAgICAnL2FkdmVydGlzZScsXG4gICAgICAnL2FmZmlsaWF0ZScsXG4gICAgICAnL3NpdGVtYXAnXG4gICAgXTtcbiAgICBcbiAgICBjb25zdCByb3V0ZXNDb250ZW50ID0gYGV4cG9ydCBjb25zdCBwcmVyZW5kZXJSb3V0ZXMgPSAke0pTT04uc3RyaW5naWZ5KGZhbGxiYWNrUm91dGVzLCBudWxsLCAyKX07YDtcbiAgICBjb25zdCBvdXRwdXRQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdzcmMnLCAncHJlcmVuZGVyLXJvdXRlcy5qcycpO1xuICAgIGZzLndyaXRlRmlsZVN5bmMob3V0cHV0UGF0aCwgcm91dGVzQ29udGVudCk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFx1MjZBMFx1RkUwRiAgVXNpbmcgZmFsbGJhY2sgcm91dGVzICgke2ZhbGxiYWNrUm91dGVzLmxlbmd0aH0gcm91dGVzKWApO1xuICAgIHJldHVybiBmYWxsYmFja1JvdXRlcztcbiAgfVxufVxuXG4vLyBSdW4gaWYgY2FsbGVkIGRpcmVjdGx5XG5pZiAoaW1wb3J0Lm1ldGEudXJsID09PSBgZmlsZTovLyR7cHJvY2Vzcy5hcmd2WzFdfWApIHtcbiAgZ2VuZXJhdGVQcmVyZW5kZXJSb3V0ZXMoKTtcbn1cblxuZXhwb3J0IHsgZ2VuZXJhdGVQcmVyZW5kZXJSb3V0ZXMgfTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsU0FBUyxpQkFBaUI7OztBQ0htUCxTQUFTLG9CQUFvQjtBQUMxUyxPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFGK0ksSUFBTSwyQ0FBMkM7QUFLak4sSUFBTSxjQUFjLFFBQVEsSUFBSSxxQkFBcUI7QUFDckQsSUFBTSxrQkFBa0IsUUFBUSxJQUFJLDBCQUEwQjtBQUU5RCxJQUFNLFdBQVcsYUFBYSxhQUFhLGVBQWU7QUFFMUQsZUFBZSwwQkFBMEI7QUFDdkMsTUFBSTtBQUNGLFlBQVEsSUFBSSwwQ0FBbUM7QUFFL0MsVUFBTSxTQUFTO0FBQUE7QUFBQSxNQUViO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUdBLFVBQU0sRUFBRSxNQUFNLFdBQVcsSUFBSSxNQUFNLFNBQ2hDLEtBQUssWUFBWSxFQUNqQixPQUFPLE1BQU0sRUFDYixNQUFNLE1BQU07QUFFZixRQUFJLFlBQVk7QUFDZCxpQkFBVyxRQUFRLGNBQVk7QUFDN0IsY0FBTSxPQUFPLFNBQVMsS0FBSyxZQUFZLEVBQUUsUUFBUSxRQUFRLEdBQUc7QUFDNUQsZUFBTyxLQUFLLGFBQWEsSUFBSSxFQUFFO0FBQUEsTUFDakMsQ0FBQztBQUNELGNBQVEsSUFBSSxnQkFBVyxXQUFXLE1BQU0sa0JBQWtCO0FBQUEsSUFDNUQ7QUFHQSxVQUFNLEVBQUUsTUFBTSxNQUFNLElBQUksTUFBTSxTQUMzQixLQUFLLE9BQU8sRUFDWixPQUFPLE1BQU0sRUFDYixNQUFNLE1BQU0sRUFDWixNQUFNLEdBQUc7QUFFWixRQUFJLE9BQU87QUFDVCxZQUFNLFFBQVEsVUFBUTtBQUNwQixjQUFNLE9BQU8sS0FBSyxLQUFLLFlBQVksRUFBRSxRQUFRLFFBQVEsR0FBRztBQUN4RCxlQUFPLEtBQUssT0FBTyxJQUFJLEVBQUU7QUFBQSxNQUMzQixDQUFDO0FBQ0QsY0FBUSxJQUFJLGdCQUFXLE1BQU0sTUFBTSxjQUFjO0FBQUEsSUFDbkQ7QUFHQSxVQUFNLEVBQUUsTUFBTSxPQUFPLElBQUksTUFBTSxTQUM1QixLQUFLLFFBQVEsRUFDYixPQUFPLE1BQU0sRUFDYixHQUFHLFVBQVUsUUFBUSxFQUNyQixNQUFNLE1BQU07QUFFZixRQUFJLFFBQVE7QUFDVixhQUFPLFFBQVEsV0FBUztBQUN0QixjQUFNLE9BQU8sTUFBTSxLQUFLLFlBQVksRUFBRSxRQUFRLFFBQVEsR0FBRztBQUN6RCxlQUFPLEtBQUssYUFBYSxJQUFJLEVBQUU7QUFBQSxNQUNqQyxDQUFDO0FBQ0QsY0FBUSxJQUFJLGdCQUFXLE9BQU8sTUFBTSxlQUFlO0FBQUEsSUFDckQ7QUFHQSxVQUFNLGdCQUFnQixrQ0FBa0MsS0FBSyxVQUFVLFFBQVEsTUFBTSxDQUFDLENBQUM7QUFFdkYsVUFBTSxhQUFhLEtBQUssS0FBSyxRQUFRLElBQUksR0FBRyxPQUFPLHFCQUFxQjtBQUN4RSxPQUFHLGNBQWMsWUFBWSxhQUFhO0FBRTFDLFlBQVEsSUFBSSx1QkFBZ0IsT0FBTyxNQUFNLGdDQUFnQztBQUN6RSxZQUFRLElBQUksOEJBQXVCLFVBQVUsRUFBRTtBQUUvQyxXQUFPO0FBQUEsRUFDVCxTQUFTLE9BQU87QUFDZCxZQUFRLE1BQU0sNkNBQXdDLEtBQUs7QUFHM0QsVUFBTSxpQkFBaUI7QUFBQSxNQUNyQjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFFQSxVQUFNLGdCQUFnQixrQ0FBa0MsS0FBSyxVQUFVLGdCQUFnQixNQUFNLENBQUMsQ0FBQztBQUMvRixVQUFNLGFBQWEsS0FBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLE9BQU8scUJBQXFCO0FBQ3hFLE9BQUcsY0FBYyxZQUFZLGFBQWE7QUFFMUMsWUFBUSxJQUFJLHdDQUE4QixlQUFlLE1BQU0sVUFBVTtBQUN6RSxXQUFPO0FBQUEsRUFDVDtBQUNGO0FBR0EsSUFBSSw2Q0FBb0IsVUFBVSxRQUFRLEtBQUssQ0FBQyxDQUFDLElBQUk7QUFDbkQsMEJBQXdCO0FBQzFCOzs7QUR6R0EsSUFBTyxzQkFBUSxhQUFhLE9BQU8sRUFBRSxRQUFRLE1BQU07QUFFakQsTUFBSSxrQkFBa0I7QUFBQSxJQUNwQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFFQSxNQUFJLFlBQVksU0FBUztBQUN2QixRQUFJO0FBQ0Ysd0JBQWtCLE1BQU0sd0JBQXdCO0FBQUEsSUFDbEQsU0FBUyxPQUFPO0FBQ2QsY0FBUSxLQUFLLDJFQUFpRTtBQUFBLElBQ2hGO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFBQSxJQUNQLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxVQUNOLDJCQUEyQjtBQUFBLFVBQzNCLG9CQUFvQjtBQUFBLFVBQ3BCLGdCQUFnQjtBQUFBLFVBQ2hCLGtCQUFrQjtBQUFBLFVBQ2xCLGdCQUFnQjtBQUFBLFFBQ2xCO0FBQUEsUUFDQSxZQUFZLGVBQWU7QUFFekIsd0JBQWMsT0FBTyxjQUFjLEtBQ2hDLFFBQVEsc0JBQXNCLEVBQUUsRUFDaEMsUUFBUSw2QkFBNkIsRUFBRSxFQUN2QyxRQUFRLDRCQUE0QixFQUFFO0FBQ3pDLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFFBQ2QsZUFBZSxDQUFDLGVBQWUsY0FBYyxzQkFBc0I7QUFBQSxRQUNuRSxVQUFVO0FBQUEsVUFDUixNQUFNO0FBQUEsVUFDTixZQUFZO0FBQUEsVUFDWixhQUFhO0FBQUEsVUFDYixhQUFhO0FBQUEsVUFDYixrQkFBa0I7QUFBQSxVQUNsQixPQUFPO0FBQUEsWUFDTDtBQUFBLGNBQ0UsS0FBSztBQUFBLGNBQ0wsT0FBTztBQUFBLGNBQ1AsTUFBTTtBQUFBLFlBQ1I7QUFBQSxZQUNBO0FBQUEsY0FDRSxLQUFLO0FBQUEsY0FDTCxPQUFPO0FBQUEsY0FDUCxNQUFNO0FBQUEsWUFDUjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUMxQjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osUUFBUSxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxZQUNqRCxJQUFJLENBQUMsZ0JBQWdCLHVCQUF1QjtBQUFBLFVBQzlDO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixTQUFTO0FBQUEsUUFDUCxpQkFBaUI7QUFBQSxNQUNuQjtBQUFBLElBQ0Y7QUFBQSxFQUNBO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
