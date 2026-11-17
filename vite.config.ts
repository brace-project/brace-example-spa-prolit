import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: 'app.fe',
  base: '/',
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
