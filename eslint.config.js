import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'legacy/**', 'prototypes/**', 'Inspirações/**'],
  },
  {
    files: ['*.config.js', '*.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser, ...globals.es2022, ...globals.node },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      boundaries,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
      'boundaries/root-path': process.cwd(),
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/**', match: 'file' },
        { type: 'application', pattern: 'src/application/**', match: 'file' },
        { type: 'infrastructure', pattern: 'src/infrastructure/**', match: 'file' },
        { type: 'presentation-app', pattern: 'src/presentation/app/**', match: 'file' },
        { type: 'presentation', pattern: 'src/presentation/**', match: 'file' },
        { type: 'content', pattern: 'src/content/**', match: 'file' },
        { type: 'config', pattern: 'src/config/**', match: 'file' },
      ],
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'domain', allow: [] },
            { from: 'application', allow: ['domain'] },
            { from: 'infrastructure', allow: ['domain', 'application', 'config'] },
            {
              from: 'presentation-app',
              allow: ['domain', 'application', 'infrastructure', 'content', 'config', 'presentation'],
            },
            {
              from: 'presentation',
              allow: ['domain', 'application', 'content', 'config', 'presentation-app'],
            },
            { from: 'content', allow: ['domain'] },
            { from: 'config', allow: ['domain'] },
          ],
        },
      ],
    },
  },
  {
    // Testes de integração podem cruzar camadas de propósito (ex.: exercitar
    // application + infrastructure + content juntos contra o motor real do laboratório).
    files: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    rules: {
      'boundaries/element-types': 'off',
    },
  },
];
