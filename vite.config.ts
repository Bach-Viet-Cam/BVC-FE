import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import type { Plugin } from "vite";
import { readFileSync } from "node:fs";

const SITE_URL = "https://bachvietcam.io.vn";

function seoPlugin(): Plugin {
  const base = SITE_URL;
  return {
    name: "bvc-seo",
    transformIndexHtml: (html) =>
      base ? html.replaceAll("%SITE_URL%", base) : html.replace(/^.*%SITE_URL%.*\r?\n/gm, ""),
    generateBundle() {
      const urls = ["/", "/login", "/library", "/help", "/install"];
      const body = urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join("\n");
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemap });
      const robots = readFileSync("public/robots.txt", "utf8").trimEnd();
      this.emitFile({ type: "asset", fileName: "robots.txt", source: `${robots}\n\nSitemap: ${base}/sitemap.xml\n` });
    },

  };
}

export default defineConfig({
  plugins: [
    seoPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Bách Việt Cầm",
        short_name: "BVC",
        description: "Nền tảng luyện tập và học nhạc cụ truyền thống Bách Việt Cầm",
        id: "/",
        lang: "vi",
        dir: "ltr",
        categories: ["education", "music"],
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#ffffff",
        theme_color: "#14b8a6",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,webmanifest}", "icons/*.png", "favicon.png"],
        globIgnores: ["samples/**"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && /^\/assets\/.*\.(png|jpe?g|webp)$/.test(url.pathname),
            handler: "CacheFirst",
            options: { cacheName: "bvc-images", expiration: { maxEntries: 40 } },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-css" },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
