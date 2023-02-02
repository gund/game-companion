import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { VitePWA } from 'vite-plugin-pwa';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 4200,
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
        id: 'com.game-companion.game',
        name: 'Game Companion App',
        short_name: 'Game Companion',
        description: 'Game Companion App',
        theme_color: '#5b217f',
        background_color: '#5b217f',
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
