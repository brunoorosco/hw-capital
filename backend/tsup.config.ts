import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'es2022',
  clean: true,
  bundle: true,
  skipNodeModulesBundle: true,
  sourcemap: false,
  external: ['@prisma/client', 'prisma'],
  esbuildOptions(options) {
    options.alias = {
      '@domain': './src/domain',
      '@application': './src/application',
      '@infrastructure': './src/infrastructure',
    };
  },
});