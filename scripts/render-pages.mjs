import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ejs from 'ejs';

const sourceRoot = new URL('../src/', import.meta.url);
const pageNames = ['index', 'list', 'details', 'form'];

// Обробляємо EJS у Node.js і зберігаємо готовий HTML для будь-якого статичного сервера.
export async function renderPages() {
  const courses = JSON.parse(await readFile(new URL('data/courses.json', sourceRoot), 'utf8'));
  await Promise.all(pageNames.map(async (page) => {
    const template = fileURLToPath(new URL(`pages/${page}.ejs`, sourceRoot));
    const rendered = await ejs.renderFile(template, { courses });
    const html = rendered.replace('<!DOCTYPE html>',
      `<!DOCTYPE html>\n<!-- Згенеровано з src/pages/${page}.ejs; редагуйте шаблон і виконайте npm run render. -->`);
    const output = new URL(`${page}.html`, sourceRoot);
    // Записуємо лише зміни, щоб не створювати зайвих перезавантажень у режимі розробки.
    const existing = await readFile(output, 'utf8').catch((error) => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    if (existing !== html) await writeFile(output, html, 'utf8');
  }));
}

// Окрема команда оновлює HTML навіть без запуску Vite.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await renderPages();
  process.stdout.write('Rendered index.html, list.html, details.html, form.html\n');
}
