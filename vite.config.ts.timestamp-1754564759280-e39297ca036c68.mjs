// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
import prerender from "file:///home/project/node_modules/vite-plugin-prerender/dist/index.mjs";

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic2NyaXB0cy9nZW5lcmF0ZS1wcmVyZW5kZXItcm91dGVzLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XG5pbXBvcnQgcHJlcmVuZGVyIGZyb20gJ3ZpdGUtcGx1Z2luLXByZXJlbmRlcic7XG5pbXBvcnQgeyBnZW5lcmF0ZVByZXJlbmRlclJvdXRlcyB9IGZyb20gJy4vc2NyaXB0cy9nZW5lcmF0ZS1wcmVyZW5kZXItcm91dGVzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICh7IGNvbW1hbmQgfSkgPT4ge1xuICAvLyBHZW5lcmF0ZSByb3V0ZXMgZm9yIHByZXJlbmRlcmluZyBkdXJpbmcgYnVpbGRcbiAgbGV0IHByZXJlbmRlclJvdXRlcyA9IFtcbiAgICAnLycsXG4gICAgJy9jYXRlZ29yaWVzJyxcbiAgICAnL2FpLWFnZW50JyxcbiAgICAnL2Fib3V0JyxcbiAgICAnL2NvbnRhY3QnLFxuICAgICcvdGVybXMnLFxuICAgICcvcHJpdmFjeScsXG4gICAgJy9hZHZlcnRpc2UnLFxuICAgICcvYWZmaWxpYXRlJyxcbiAgICAnL3NpdGVtYXAnXG4gIF07XG5cbiAgaWYgKGNvbW1hbmQgPT09ICdidWlsZCcpIHtcbiAgICB0cnkge1xuICAgICAgcHJlcmVuZGVyUm91dGVzID0gYXdhaXQgZ2VuZXJhdGVQcmVyZW5kZXJSb3V0ZXMoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS53YXJuKCdcdTI2QTBcdUZFMEYgIENvdWxkIG5vdCBnZW5lcmF0ZSBkeW5hbWljIHJvdXRlcywgdXNpbmcgc3RhdGljIHJvdXRlcyBvbmx5Jyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgcHJlcmVuZGVyKHtcbiAgICAgIHJvdXRlczogcHJlcmVuZGVyUm91dGVzLFxuICAgICAgbWluaWZ5OiB7XG4gICAgICAgIGNvbGxhcHNlQm9vbGVhbkF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgIGNvbGxhcHNlV2hpdGVzcGFjZTogdHJ1ZSxcbiAgICAgICAgZGVjb2RlRW50aXRpZXM6IHRydWUsXG4gICAgICAgIGtlZXBDbG9zaW5nU2xhc2g6IHRydWUsXG4gICAgICAgIHNvcnRBdHRyaWJ1dGVzOiB0cnVlXG4gICAgICB9LFxuICAgICAgcG9zdFByb2Nlc3MocmVuZGVyZWRSb3V0ZSkge1xuICAgICAgICAvLyBDbGVhbiB1cCBhbnkgaHlkcmF0aW9uIGFydGlmYWN0c1xuICAgICAgICByZW5kZXJlZFJvdXRlLmh0bWwgPSByZW5kZXJlZFJvdXRlLmh0bWxcbiAgICAgICAgICAucmVwbGFjZSgvZGF0YS1yZWFjdHJvb3Q9XCJcIi9nLCAnJylcbiAgICAgICAgICAucmVwbGFjZSgvZGF0YS1yZWFjdC1oZWxtZXQ9XCJ0cnVlXCIvZywgJycpXG4gICAgICAgICAgLnJlcGxhY2UoLzwhLS1yZWFjdC1lbXB0eVtePl0qLS0+L2csICcnKTtcbiAgICAgICAgcmV0dXJuIHJlbmRlcmVkUm91dGU7XG4gICAgICB9XG4gICAgfSksXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nLCAncm9ib3RzLnR4dCcsICdhcHBsZS10b3VjaC1pY29uLnBuZyddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ0FpdG9vbmljJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ0FpdG9vbmljJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdEaXNjb3ZlciB0aGUgYmVzdCBBSSB0b29scyBhbmQgYWdlbnRzJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMWEyMzdlJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMxMjEyMTInLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy9hbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJy9hbmRyb2lkLWNocm9tZS01MTJ4NTEyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9KVxuICBdLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgIHVpOiBbJ2x1Y2lkZS1yZWFjdCcsICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ2FjaGUtQ29udHJvbCc6ICdwdWJsaWMsIG1heC1hZ2U9MzE1MzYwMDAnXG4gICAgfVxuICB9XG4gIH07XG59KTsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Byb2plY3Qvc2NyaXB0c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9zY3JpcHRzL2dlbmVyYXRlLXByZXJlbmRlci1yb3V0ZXMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9zY3JpcHRzL2dlbmVyYXRlLXByZXJlbmRlci1yb3V0ZXMuanNcIjtpbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBMb2FkIGVudmlyb25tZW50IHZhcmlhYmxlc1xuY29uc3Qgc3VwYWJhc2VVcmwgPSBwcm9jZXNzLmVudi5WSVRFX1NVUEFCQVNFX1VSTCB8fCAnaHR0cHM6Ly95b3VyLXByb2plY3Quc3VwYWJhc2UuY28nO1xuY29uc3Qgc3VwYWJhc2VBbm9uS2V5ID0gcHJvY2Vzcy5lbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWSB8fCAneW91ci1hbm9uLWtleSc7XG5cbmNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzdXBhYmFzZUFub25LZXkpO1xuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVByZXJlbmRlclJvdXRlcygpIHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZygnXHVEODNEXHVERTgwIEdlbmVyYXRpbmcgcHJlcmVuZGVyIHJvdXRlcy4uLicpO1xuICAgIFxuICAgIGNvbnN0IHJvdXRlcyA9IFtcbiAgICAgIC8vIFN0YXRpYyByb3V0ZXNcbiAgICAgICcvJyxcbiAgICAgICcvY2F0ZWdvcmllcycsXG4gICAgICAnL2FpLWFnZW50JyxcbiAgICAgICcvYWJvdXQnLFxuICAgICAgJy9jb250YWN0JyxcbiAgICAgICcvdGVybXMnLFxuICAgICAgJy9wcml2YWN5JyxcbiAgICAgICcvYWR2ZXJ0aXNlJyxcbiAgICAgICcvYWZmaWxpYXRlJyxcbiAgICAgICcvc2l0ZW1hcCdcbiAgICBdO1xuXG4gICAgLy8gRmV0Y2ggY2F0ZWdvcmllc1xuICAgIGNvbnN0IHsgZGF0YTogY2F0ZWdvcmllcyB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdjYXRlZ29yaWVzJylcbiAgICAgIC5zZWxlY3QoJ25hbWUnKVxuICAgICAgLm9yZGVyKCduYW1lJyk7XG5cbiAgICBpZiAoY2F0ZWdvcmllcykge1xuICAgICAgY2F0ZWdvcmllcy5mb3JFYWNoKGNhdGVnb3J5ID0+IHtcbiAgICAgICAgY29uc3Qgc2x1ZyA9IGNhdGVnb3J5Lm5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMrL2csICctJyk7XG4gICAgICAgIHJvdXRlcy5wdXNoKGAvY2F0ZWdvcnkvJHtzbHVnfWApO1xuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZyhgXHUyNzA1IEFkZGVkICR7Y2F0ZWdvcmllcy5sZW5ndGh9IGNhdGVnb3J5IHJvdXRlc2ApO1xuICAgIH1cblxuICAgIC8vIEZldGNoIHRvb2xzXG4gICAgY29uc3QgeyBkYXRhOiB0b29scyB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCd0b29scycpXG4gICAgICAuc2VsZWN0KCduYW1lJylcbiAgICAgIC5vcmRlcignbmFtZScpXG4gICAgICAubGltaXQoNTAwKTsgLy8gTGltaXQgdG8gcHJldmVudCB0b28gbWFueSByb3V0ZXNcblxuICAgIGlmICh0b29scykge1xuICAgICAgdG9vbHMuZm9yRWFjaCh0b29sID0+IHtcbiAgICAgICAgY29uc3Qgc2x1ZyA9IHRvb2wubmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccysvZywgJy0nKTtcbiAgICAgICAgcm91dGVzLnB1c2goYC9haS8ke3NsdWd9YCk7XG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKGBcdTI3MDUgQWRkZWQgJHt0b29scy5sZW5ndGh9IHRvb2wgcm91dGVzYCk7XG4gICAgfVxuXG4gICAgLy8gRmV0Y2ggYWdlbnRzXG4gICAgY29uc3QgeyBkYXRhOiBhZ2VudHMgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbSgnYWdlbnRzJylcbiAgICAgIC5zZWxlY3QoJ25hbWUnKVxuICAgICAgLmVxKCdzdGF0dXMnLCAnYWN0aXZlJylcbiAgICAgIC5vcmRlcignbmFtZScpO1xuXG4gICAgaWYgKGFnZW50cykge1xuICAgICAgYWdlbnRzLmZvckVhY2goYWdlbnQgPT4ge1xuICAgICAgICBjb25zdCBzbHVnID0gYWdlbnQubmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccysvZywgJy0nKTtcbiAgICAgICAgcm91dGVzLnB1c2goYC9haS1hZ2VudC8ke3NsdWd9YCk7XG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKGBcdTI3MDUgQWRkZWQgJHthZ2VudHMubGVuZ3RofSBhZ2VudCByb3V0ZXNgKTtcbiAgICB9XG5cbiAgICAvLyBXcml0ZSByb3V0ZXMgdG8gZmlsZVxuICAgIGNvbnN0IHJvdXRlc0NvbnRlbnQgPSBgZXhwb3J0IGNvbnN0IHByZXJlbmRlclJvdXRlcyA9ICR7SlNPTi5zdHJpbmdpZnkocm91dGVzLCBudWxsLCAyKX07YDtcbiAgICBcbiAgICBjb25zdCBvdXRwdXRQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdzcmMnLCAncHJlcmVuZGVyLXJvdXRlcy5qcycpO1xuICAgIGZzLndyaXRlRmlsZVN5bmMob3V0cHV0UGF0aCwgcm91dGVzQ29udGVudCk7XG4gICAgXG4gICAgY29uc29sZS5sb2coYFx1RDgzQ1x1REY4OSBHZW5lcmF0ZWQgJHtyb3V0ZXMubGVuZ3RofSB0b3RhbCByb3V0ZXMgZm9yIHByZXJlbmRlcmluZ2ApO1xuICAgIGNvbnNvbGUubG9nKGBcdUQ4M0RcdURDREQgUm91dGVzIHNhdmVkIHRvOiAke291dHB1dFBhdGh9YCk7XG4gICAgXG4gICAgcmV0dXJuIHJvdXRlcztcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdcdTI3NEMgRXJyb3IgZ2VuZXJhdGluZyBwcmVyZW5kZXIgcm91dGVzOicsIGVycm9yKTtcbiAgICBcbiAgICAvLyBGYWxsYmFjayB0byBzdGF0aWMgcm91dGVzIG9ubHlcbiAgICBjb25zdCBmYWxsYmFja1JvdXRlcyA9IFtcbiAgICAgICcvJyxcbiAgICAgICcvY2F0ZWdvcmllcycsXG4gICAgICAnL2FpLWFnZW50JyxcbiAgICAgICcvYWJvdXQnLFxuICAgICAgJy9jb250YWN0JyxcbiAgICAgICcvdGVybXMnLFxuICAgICAgJy9wcml2YWN5JyxcbiAgICAgICcvYWR2ZXJ0aXNlJyxcbiAgICAgICcvYWZmaWxpYXRlJyxcbiAgICAgICcvc2l0ZW1hcCdcbiAgICBdO1xuICAgIFxuICAgIGNvbnN0IHJvdXRlc0NvbnRlbnQgPSBgZXhwb3J0IGNvbnN0IHByZXJlbmRlclJvdXRlcyA9ICR7SlNPTi5zdHJpbmdpZnkoZmFsbGJhY2tSb3V0ZXMsIG51bGwsIDIpfTtgO1xuICAgIGNvbnN0IG91dHB1dFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3NyYycsICdwcmVyZW5kZXItcm91dGVzLmpzJyk7XG4gICAgZnMud3JpdGVGaWxlU3luYyhvdXRwdXRQYXRoLCByb3V0ZXNDb250ZW50KTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhgXHUyNkEwXHVGRTBGICBVc2luZyBmYWxsYmFjayByb3V0ZXMgKCR7ZmFsbGJhY2tSb3V0ZXMubGVuZ3RofSByb3V0ZXMpYCk7XG4gICAgcmV0dXJuIGZhbGxiYWNrUm91dGVzO1xuICB9XG59XG5cbi8vIFJ1biBpZiBjYWxsZWQgZGlyZWN0bHlcbmlmIChpbXBvcnQubWV0YS51cmwgPT09IGBmaWxlOi8vJHtwcm9jZXNzLmFyZ3ZbMV19YCkge1xuICBnZW5lcmF0ZVByZXJlbmRlclJvdXRlcygpO1xufVxuXG5leHBvcnQgeyBnZW5lcmF0ZVByZXJlbmRlclJvdXRlcyB9OyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixPQUFPLGVBQWU7OztBQ0h1UCxTQUFTLG9CQUFvQjtBQUMxUyxPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFGK0ksSUFBTSwyQ0FBMkM7QUFLak4sSUFBTSxjQUFjLFFBQVEsSUFBSSxxQkFBcUI7QUFDckQsSUFBTSxrQkFBa0IsUUFBUSxJQUFJLDBCQUEwQjtBQUU5RCxJQUFNLFdBQVcsYUFBYSxhQUFhLGVBQWU7QUFFMUQsZUFBZSwwQkFBMEI7QUFDdkMsTUFBSTtBQUNGLFlBQVEsSUFBSSwwQ0FBbUM7QUFFL0MsVUFBTSxTQUFTO0FBQUE7QUFBQSxNQUViO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUdBLFVBQU0sRUFBRSxNQUFNLFdBQVcsSUFBSSxNQUFNLFNBQ2hDLEtBQUssWUFBWSxFQUNqQixPQUFPLE1BQU0sRUFDYixNQUFNLE1BQU07QUFFZixRQUFJLFlBQVk7QUFDZCxpQkFBVyxRQUFRLGNBQVk7QUFDN0IsY0FBTSxPQUFPLFNBQVMsS0FBSyxZQUFZLEVBQUUsUUFBUSxRQUFRLEdBQUc7QUFDNUQsZUFBTyxLQUFLLGFBQWEsSUFBSSxFQUFFO0FBQUEsTUFDakMsQ0FBQztBQUNELGNBQVEsSUFBSSxnQkFBVyxXQUFXLE1BQU0sa0JBQWtCO0FBQUEsSUFDNUQ7QUFHQSxVQUFNLEVBQUUsTUFBTSxNQUFNLElBQUksTUFBTSxTQUMzQixLQUFLLE9BQU8sRUFDWixPQUFPLE1B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
