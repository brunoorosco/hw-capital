import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'node18',
  clean: true,
  minify: false,
  sourcemap: true,
  tsconfig: 'tsconfig.json',
});
