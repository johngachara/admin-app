import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2,ttf}'],
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches : true,
      },
      manifest: {
        name: 'Admin',
        short_name: 'Alltech Admin',
        description: 'Administrator',
        theme_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        background_color: '#ffffff',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      injectRegister: 'auto',
    })
  ],
  server: {
    open: false,
    port: 5173,
    historyApiFallback: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
});