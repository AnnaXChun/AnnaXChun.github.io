import {defineConfig} from 'vite';

export default defineConfig({
  base: './',
  // Keep this standalone site independent of the legacy app's PostCSS config.
  css: {postcss: {plugins: []}},
  build: {outDir: '../dist-pages', emptyOutDir: true},
});
