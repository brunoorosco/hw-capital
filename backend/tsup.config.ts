import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['esm'],        // ✅ era 'cjs', causa do .cjs
  target: 'es2022',       // ✅ alinha com o tsconfig
  clean: true,
  minify: false,
  sourcemap: false,       // ✅ era true, causa do .map
  tsconfig: 'tsconfig.json',
  splitting: false,
  bundle: true,
  skipNodeModulesBundle: true,
  external: ['@prisma/client', 'prisma'],
  esbuildOptions(options) {
    options.alias = {     // ✅ resolve @domain, @application, @infrastructure
      '@domain': './src/domain',
      '@application': './src/application',
      '@infrastructure': './src/infrastructure',
    };
  },
});