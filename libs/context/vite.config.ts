/// <reference types="vitest" />
import { join } from 'path';
import glob from 'fast-glob';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import viteTsConfigPaths from 'vite-tsconfig-paths';

const entries = glob.sync('./src/*/index.ts', { cwd: __dirname });
const entriesObj = entries.reduce((obj, entry) => {
  const [, , libName] = entry.split('/');
  const name = libName === 'lib' ? 'index' : libName;
  obj[name] = entry;
  return obj;
}, {} as Record<string, string>);

console.log('Entries:', entriesObj);

export default defineConfig({
  plugins: [
    dts({
      tsConfigFilePath: join(__dirname, 'tsconfig.lib.json'),
      // Faster builds by skipping tests. Set this to false to enable type checking.
      skipDiagnostics: false,
    }),

    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: entriesObj,
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
      // Change this to the formats you want to support.
      // Don't forgot to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: (module) => !/^\./.test(module) && !/\.ts$/.test(module),
    },
  },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
