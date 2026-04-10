import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'es2022',
  clean: true,
  bundle: true,
  skipNodeModulesBundle: true,
  external: ['@prisma/client', 'prisma', 'pino-pretty', 'pino-http'],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
  esbuildOptions(options) {
    options.alias = {
      '@domain': './src/domain',
      '@application': './src/application',
      '@infrastructure': './src/infrastructure',
    };
  },
});