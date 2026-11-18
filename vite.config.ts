import { defineConfig } from 'vite';
import { run } from 'vite-plugin-run';
import { fileURLToPath } from 'node:url';

const backendRoot = fileURLToPath(new URL('./app.be', import.meta.url));

export default defineConfig({
  root: 'app.fe',
  plugins: [
    // Reboot the SPA backend API build when a backend file changes. The generated frontend file does not trigger another API build.
    {
      name: 'watch-backend-directory',
      apply: 'serve',
      configureServer(server) {
        server.watcher.add(backendRoot);
      },
    },
    run({
      silent: false,
      input: [{
        name: 'rebuild-spa-backend-api',
        run: ['vendor/bin/brace', 'spa-api-build'],
        pattern: '../app.be/**/*',
        debounce: 200,
        startup: true,
        build: true,
      }],
    }),
  ],
  base: '/',
  // CSS-Source-Maps führen globale Entwicklungsstyles auf ihre SCSS-Quelldateien zurück.
  css: {
    devSourcemap: true,
  },
  // Development only: Vite forwards application requests unchanged to Brace.
  // Prefix evaluation is handled exclusively by Brace and does not happen in this proxy.
  server: {
    port: 4000,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "^(?!/@vite|/@fs/|/@id/|/docs/_src/|/node_modules/|/workspaces/|.*\\.(?:js|css|ts|tsx|vue|svelte|scss|sass|less|map)(?:\\?.*)?$).*": {
        target: "http://127.0.0.1:80",
        changeOrigin: false,
        autoRewrite: true,
      },
    },
    hmr: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: fileURLToPath(new URL('./app.fe/src/main.ts', import.meta.url)),
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: asset => asset.name?.endsWith('.css') ? 'assets/app.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
});
