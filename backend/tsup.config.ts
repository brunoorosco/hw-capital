import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'es2022',
  clean: true,
  minify: false,
  sourcemap: false,
  tsconfig: 'tsconfig.json',
  splitting: false,
  bundle: true,
  skipNodeModulesBundle: true,
  external: ['@prisma/client', 'prisma', 'pino-pretty', 'pino-http'], // 👈 adicione aqui
  esbuildOptions(options) {
    options.alias = {
      '@domain': './src/domain',
      '@application': './src/application',
      '@infrastructure': './src/infrastructure',
    };
  },
});