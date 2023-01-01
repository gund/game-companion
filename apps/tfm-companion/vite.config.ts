import { defineConfig } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 4200,
    host: 'localhost',
  },

  plugins: [
    viteTsConfigPaths({
      root: '../../',
    }),
    VitePWA({
      devOptions: { enabled: false, type: 'module' },
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        id: 'com.game-companion.tfm',
        name: 'Terraforming Mars Companion App',
        short_name: 'TFM Companion',
        description: 'Terraforming Mars Companion App',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),
  ],

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.spec.{js,ts}'],
  },
});
