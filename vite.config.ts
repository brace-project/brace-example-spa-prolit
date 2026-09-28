import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { run } from 'vite-plugin-run';

const frontendRoot = fileURLToPath(new URL('./app.fe/', import.meta.url));
const publicRoot = fileURLToPath(new URL('./app.fe/public/', import.meta.url));

const packageSource = (name: string, entry = 'index.ts'): string =>
  fileURLToPath(new URL(`./node_modules/@trunkjs/${name}/${entry}`, import.meta.url));

const isViteRequest = (url: string): boolean => {
  const pathname = new URL(url, 'http://vite.local').pathname;

  if (
    pathname === '/@react-refresh'
    || pathname === '/__vite_ping'
    || pathname.startsWith('/@vite/')
    || pathname.startsWith('/@id/')
    || pathname.startsWith('/@fs/')
    || pathname.startsWith('/src/')
    || pathname.startsWith('/node_modules/')
  ) {
    return true;
  }

  const relativePath = pathname.replace(/^\/+/, '');
  return existsSync(resolve(frontendRoot, relativePath))
    || existsSync(resolve(publicRoot, relativePath));
};

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
      '/': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: false,
        bypass: (request) => isViteRequest(request.url ?? '/') ? request.url : undefined,
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
