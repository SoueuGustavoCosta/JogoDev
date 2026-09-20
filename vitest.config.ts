import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // Vários testes sobem uma instância real do PGlite (Postgres em WebAssembly).
    // Rodar arquivos de teste em paralelo derruba os workers por contenção de
    // memória/WASM; sequencial é mais lento mas estável.
    fileParallelism: false,
  },
});
