import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    viteTsConfigPaths({ root: '../../' }),
    checker({
      typescript: { tsconfigPath: resolve(__dirname, 'tsconfig.app.json') },
    }),
    VitePWA({
      devOptions: { enabled: false, type: 'module' },
      registerType: 'prompt',
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
