import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Exclude sibling worktrees so vitest doesn't double-discover tests there
    // (a worktree's `src/` would otherwise load alongside the parent's `src/`,
    // producing duplicate React instances and Provider-state pollution).
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/worktrees/**'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});