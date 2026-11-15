import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ejs from 'ejs';

const sourceRoot = new URL('../src/', import.meta.url);
const pageNames = ['index', 'list', 'details', 'form'];

// Межі спільних блоків позначені HTML-коментарями; решта сторінки редагується вручну.
const blockPattern = /^([ \t]*)<!-- Початок EJS:(header|footer|course-card) (\{[^\r\n]*\}) -->\r?\n[\s\S]*?^[ \t]*<!-- Кінець EJS:\2 -->/gm;

// Оновлюємо лише повторювані блоки, зберігаючи власний вміст чотирьох HTML-сторінок.
export async function renderPages() {
  const courses = JSON.parse(await readFile(new URL('data/courses.json', sourceRoot), 'utf8'));
  await Promise.all(pageNames.map(async (page) => {
    const output = new URL(`${page}.html`, sourceRoot);
    const existing = await readFile(output, 'utf8');
    const parts = [];
    let cursor = 0;
    for (const match of existing.matchAll(blockPattern)) {
      const [block, indent, name, options] = match;
      const data = JSON.parse(options);
      if (name === 'course-card') {
        const course = courses.find((item) => item.id === data.course);
        if (!course) throw new Error(`Unknown course: ${data.course}`);
        data.course = course;
      }
      const template = fileURLToPath(new URL(`partials/${name}.ejs`, sourceRoot));
      const rendered = await ejs.renderFile(template, data);
      const lines = rendered.trimEnd().split(/\r?\n/);
      const padding = Math.min(...lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)[0].length));
      const content = lines.map((line) => line.trim() ? indent + line.slice(padding) : '').join('\n');
      parts.push(existing.slice(cursor, match.index),
        `${indent}<!-- Початок EJS:${name} ${options} -->\n${content}\n${indent}<!-- Кінець EJS:${name} -->`);
      cursor = match.index + block.length;
    }
    parts.push(existing.slice(cursor));
    const html = parts.join('');
    // Записуємо лише зміни, щоб не створювати зайвих перезавантажень у режимі розробки.
    if (existing !== html) await writeFile(output, html, 'utf8');
  }));
}

// Окрема команда оновлює спільні блоки навіть без запуску Vite.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await renderPages();
  process.stdout.write('Rendered index.html, list.html, details.html, form.html\n');
}
