import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { run } from 'vite-plugin-run';

const packageSource = (name: string, entry = 'index.ts'): string =>
  fileURLToPath(new URL(`./node_modules/@trunkjs/${name}/${entry}`, import.meta.url));

export default defineConfig({
  root: 'app.fe',
  cacheDir: '../node_modules/.vite',
  plugins: [
    run({
      name: 'Brace API stub',
      run: ['vendor/bin/brace', 'spa-api-build'],
      startup: true,
      build: true,
    }),
  ],
  resolve: {
    alias: [
      { find: '@trunkjs/scope/runtime', replacement: packageSource('scope', 'src/runtime.ts') },
      { find: '@trunkjs/scope', replacement: packageSource('scope') },
      { find: '@trunkjs/browser-utils', replacement: packageSource('browser-utils') },
      { find: '@trunkjs/prolit-renderer', replacement: packageSource('prolit-renderer') },
      { find: '@trunkjs/prolit', replacement: packageSource('prolit') },
      { find: '@trunkjs/router', replacement: packageSource('router') },
      { find: '@trunkjs/responsive', replacement: packageSource('responsive') },
      { find: '@trunkjs/api-stub', replacement: packageSource('api-stub') },
    ],
  },
  server: {
    port: 4000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: false,
      },
      '^/(?!@vite/|@id/|@fs/|src/|node_modules/|.*\\.(?:js|css|ts|tsx|scss|map)$).*': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: fileURLToPath(new URL('./app.fe/src/main.ts', import.meta.url)),
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (asset) =>
          asset.name?.endsWith('.css') ? 'assets/app.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
