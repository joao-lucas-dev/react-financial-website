// Flat ESLint config for ESLint v9
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  // Ignore build and deps
  { ignores: ['dist', 'node_modules'] },

  // Base JS config
  js.configs.recommended,

  // Provide globals for all files (no type-aware parser here)
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // TypeScript (non type-checked to keep it lightweight)
  ...tseslint.configs.recommended,

  // TS rules adjustments
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // React Hooks rules for React files
  {
    files: ['**/*.{tsx,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
)
