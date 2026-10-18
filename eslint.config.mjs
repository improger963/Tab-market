import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

/**
 * Native flat ESLint config.
 *
 * The canonical `eslint-config-next` preset is NOT used here because it routes
 * through `@eslint/eslintrc`'s FlatCompat, which throws a circular-JSON error on
 * the pinned ESLint 9.39 / eslintrc 3.3 combination. We instead wire the exact
 * same plugins (`@next/eslint-plugin-next`, `eslint-plugin-react-hooks`) and the
 * TypeScript parser directly. Full type-checking stays enforced by `tsc`/`next build`.
 */
export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'dist/**',
      'node_modules/**',
      'next-env.d.ts',
      'server/data/**',
      'scripts/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
