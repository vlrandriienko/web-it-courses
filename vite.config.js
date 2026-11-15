import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import { renderPages } from './scripts/render-pages.mjs';

// Корінь вихідних сторінок і спільні дані карток із desktop-макета Figma.
const root = fileURLToPath(new URL('./src/', import.meta.url));

// EJS використовується лише для шапки, підвалу та картки; сторінки зберігаються в HTML.
function renderEjsPages() {
  return {
    name: 'render-ejs-pages',
    buildStart: renderPages,
    async configureServer(server) {
      await renderPages();
      // Зміни шаблонів або даних автоматично оновлюють усі чотири сторінки.
      const refresh = async (file) => {
        const isTemplate = file.endsWith('.ejs') && file.startsWith(join(root, 'partials'));
        const isPage = ['index', 'list', 'details', 'form'].some((page) => file === join(root, `${page}.html`));
        if (!isTemplate && !isPage && file !== join(root, 'data', 'courses.json')) return;
        try {
          await renderPages();
          server.ws.send({ type: 'full-reload' });
        } catch (error) {
          server.config.logger.error(error.stack || error.message);
        }
      };
      server.watcher.on('change', refresh);
      server.httpServer?.once('close', () => server.watcher.off('change', refresh));
    },
  };
}

export default defineConfig({
  root,
  base: './',
  // EJS обробляється на сервері розробки та під час збирання готових HTML-сторінок.
  plugins: [renderEjsPages()],
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
