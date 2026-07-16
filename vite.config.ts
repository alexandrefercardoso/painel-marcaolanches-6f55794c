import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import compression from "vite-plugin-compression";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

const buildDate = new Date();
const pad = (n: number) => String(n).padStart(2, "0");
const autoVersion = `${buildDate.getFullYear()}.${pad(buildDate.getMonth() + 1)}.${pad(buildDate.getDate())}.${pad(buildDate.getHours())}${pad(buildDate.getMinutes())}`;

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(autoVersion),
    __APP_BUILD_DATE__: JSON.stringify(buildDate.toISOString()),
  },
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      routeFileIgnorePrefix: "-",
      quoteStyle: "double",
      autoCodeSplitting: true,
    }),
    react(),
    tsconfigPaths(),
    tailwindcss(),
    compression(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Meupedix Sistema Delivery",
        short_name: "Meupedix Delivery",
        description: "Sistema de Delivery Profissional Meupedix",
        theme_color: "#ef4444",
        background_color: "#ffffff",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone"],
        orientation: "portrait-primary",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" || request.destination === "style" || request.destination === "document",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
