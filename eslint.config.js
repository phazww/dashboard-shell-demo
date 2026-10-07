import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'node_modules/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  { files: ['src/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['scripts/**/*.js', 'scripts/**/*.mjs', 'server.mjs', 'playwright.config.js', 'eslint.config.js'], languageOptions: { globals: globals.node } },
  { files: ['tests/**/*.js'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
];
