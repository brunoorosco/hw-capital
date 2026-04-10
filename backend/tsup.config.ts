import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  target: 'es2022',
  clean: true,
  bundle: true,
  skipNodeModulesBundle: true,
  external: ['@prisma/client', 'prisma', 'pino-pretty', 'pino-http'],
  esbuildOptions(options) {
    options.alias = {
      '@domain': './src/domain',
      '@application': './src/application',
      '@infrastructure': './src/infrastructure',
    };
  },
});