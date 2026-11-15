import html from '@html-eslint/eslint-plugin';
import htmlParser from '@html-eslint/parser';

// Перевіряємо готовий HTML після оброблення EJS і конфігураційні файли JavaScript.
export default [
  { ignores: ['node_modules/**', 'dist/assets/**'] },
  {
    files: ['src/*.html', 'dist/*.html'],
    languageOptions: { parser: htmlParser },
    plugins: { html },
    rules: {
      'html/require-doctype': 'error',
      'html/require-lang': 'error',
      'html/require-title': 'error',
      'html/require-meta-charset': 'error',
      'html/require-meta-description': 'error',
      'html/require-meta-viewport': 'error',
      'html/require-img-alt': 'error',
      'html/require-explicit-size': 'error',
      'html/require-input-label': 'error',
      'html/require-button-type': 'error',
      'html/no-duplicate-id': 'error',
      'html/no-duplicate-attrs': 'error',
      'html/no-skip-heading-levels': 'error',
      'html/no-invalid-role': 'error',
      'html/require-li-container': 'error',
    },
  },
  {
    files: ['*.js', 'scripts/*.mjs'],
    rules: { 'no-unused-vars': 'error', 'no-unreachable': 'error' },
  },
];
