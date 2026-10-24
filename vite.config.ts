import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const ONE_MONTH_SECONDS = 60 * 60 * 24 * 30;
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Có bản mới thì hỏi người dùng (PwaUpdatePrompt), không tự tải lại giữa lúc đang thu âm
      registerType: "prompt",
      manifest: {
        name: "Bách Việt Cầm",
        short_name: "Bách Việt Cầm",
        description: "Học và luyện tập nhạc cụ dân tộc Việt Nam",
        lang: "vi",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Ảnh lớn (logo, ảnh đăng nhập) không đưa vào bộ cài sẵn mà cache khi dùng tới
        globPatterns: ["**/*.{js,css,html,svg,woff2}", "*.png", "worklets/*.js"],
        // Bundle chính gần 2 MB (mức mặc định của Workbox), nâng lên để không bị bỏ khỏi bộ cài sẵn
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "bvc-images",
              expiration: { maxEntries: 60, maxAgeSeconds: ONE_MONTH_SECONDS },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 30, maxAgeSeconds: ONE_YEAR_SECONDS },
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
