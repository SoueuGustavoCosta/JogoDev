import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    // O pré-bundle do esbuild quebra os assets .data/.wasm do PGlite (Postgres em
    // WebAssembly) e do php-wasm (PHP em WebAssembly): o dev server passa a servir
    // HTML no lugar do binário.
    exclude: ['@electric-sql/pglite', 'php-wasm'],
  },
});
