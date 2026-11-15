import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';

// Корінь вихідних сторінок і спільні дані карток із desktop-макета Figma.
const root = fileURLToPath(new URL('./src/', import.meta.url));
const courses = JSON.parse(readFileSync(new URL('./src/data/courses.json', import.meta.url), 'utf8'));

export default defineConfig({
  root,
  base: './',
  // EJS обробляється на сервері розробки та під час збирання готових HTML-сторінок.
  plugins: [ViteEjsPlugin({ courses })],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    // Кожна з чотирьох сторінок є окремою точкою входу багатосторінкової збірки.
    rollupOptions: {
      input: Object.fromEntries(['index', 'list', 'details', 'form'].map((page) => [
        page, fileURLToPath(new URL(`./src/${page}.html`, import.meta.url)),
      ])),
    },
  },
});
