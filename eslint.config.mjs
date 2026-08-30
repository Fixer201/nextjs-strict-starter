import cspellPlugin from '@cspell/eslint-plugin'
import eslintReact from '@eslint-react/eslint-plugin'
import jsPlugin from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prismaPlugin from '@v2nic/eslint-plugin-prisma'
import noSecretsPlugin from 'eslint-plugin-no-secrets'
import noUnsanitizedPlugin from 'eslint-plugin-no-unsanitized'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import oxlintPlugin from 'eslint-plugin-oxlint'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import promisePlugin from 'eslint-plugin-promise'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRsc from 'eslint-plugin-react-rsc'
import securityPlugin from 'eslint-plugin-security'
import sonarjsPlugin from 'eslint-plugin-sonarjs'
import tailwindcssPlugin from 'eslint-plugin-tailwindcss'
import unicornModule from 'eslint-plugin-unicorn'

const unicornPlugin = unicornModule.default ?? unicornModule
const sourceFiles = [
  'src/**/*.{ts,tsx}',
  'tests/**/*.ts',
  'prisma/**/*.ts',
  'next.config.ts',
  'prisma.config.ts',
]
const reactFiles = ['src/**/*.{ts,tsx}']

export default [
  {
    ignores: [
      '.next/**',
      'build/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'out/**',
      'public/**',
      'src/generated/**',
      'next-env.d.ts',
    ],
  },

  {
    files: ['src/lib/**/*.ts', 'src/app/api/**/*.ts'],
    ignores: ['**/*.test.ts'],
    plugins: { jsdoc: jsdocPlugin },
    rules: {
      'jsdoc/require-jsdoc': [
        'warn',
        {
          contexts: ['ExportNamedDeclaration > FunctionDeclaration'],
          require: {
            ArrowFunctionExpression: false,
            ClassDeclaration: false,
            ClassExpression: false,
            FunctionDeclaration: false,
            FunctionExpression: false,
            MethodDefinition: false,
          },
        },
      ],
    },
  },

  jsPlugin.configs.recommended,
  tsPlugin.configs['flat/eslint-recommended'],
  { ...nextPlugin.configs['core-web-vitals'], files: reactFiles },
  { ...eslintReact.configs.recommended, files: reactFiles },
  { ...eslintReact.configs['recommended-typescript'], files: reactFiles },
  { ...reactHooks.configs.flat.recommended, files: reactFiles },
  { ...reactRsc.configs.recommended, files: reactFiles },
  { ...unicornPlugin.configs['flat/recommended'], files: sourceFiles },
  { ...securityPlugin.configs.recommended, files: sourceFiles },
  { ...noUnsanitizedPlugin.configs.recommended, files: reactFiles },
  { ...sonarjsPlugin.configs.recommended, files: sourceFiles },
  ...oxlintPlugin.configs['flat/recommended'],
  ...prismaPlugin.configs['prisma-schema-flat-recommended'],

  {
    files: sourceFiles,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        projectService: true,
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      cspell: cspellPlugin,
      'no-secrets': noSecretsPlugin,
      perfectionist: perfectionistPlugin,
      prisma: prismaPlugin,
      promise: promisePlugin,
      tailwindcss: tailwindcssPlugin,
    },
    settings: {
      react: { version: 'detect' },
      tailwindcss: { cssConfigPath: './src/app/globals.css' },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-type-checked'].rules,

      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      'cspell/spellchecker': [
        'warn',
        {
          checkComments: true,
          checkIdentifiers: true,
          checkJSXText: true,
          checkStrings: false,
          cspell: { words: ['Millis', 'Turbopack'] },
        },
      ],
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-secrets/no-secrets': ['error', { ignoreContent: '^https', tolerance: 4.2 }],
      'perfectionist/sort-imports': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          newlinesBetween: 0,
          order: 'asc',
          type: 'natural',
        },
      ],
      'perfectionist/sort-jsx-props': ['warn', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-named-exports': ['warn', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-named-imports': ['warn', { order: 'asc', type: 'natural' }],
      'perfectionist/sort-union-types': ['warn', { order: 'asc', type: 'natural' }],
      'preserve-caught-error': 'error',
      'promise/avoid-new': 'warn',
      'promise/no-new-statics': 'error',
      'promise/no-return-wrap': 'warn',
      'promise/spec-only': 'warn',
      'promise/valid-params': 'warn',
      'security/detect-object-injection': 'off',
      'sonarjs/cognitive-complexity': ['warn', 15],
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/enforces-negative-arbitrary-values': 'warn',
      'tailwindcss/enforces-shorthand': 'warn',
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/no-unnecessary-arbitrary-value': 'warn',
      'unicorn/filename-case': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-non-function-verb-prefix': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',

      'no-restricted-syntax': [
        'error',
        {
          message: 'Dynamic function construction via Function() is prohibited.',
          selector: "CallExpression[callee.name='Function']",
        },
        {
          message: 'Dynamic function construction via new Function() is prohibited.',
          selector: "NewExpression[callee.name='Function']",
        },
        {
          message: 'Dynamic function construction via globalThis.Function() is prohibited.',
          selector:
            "CallExpression[callee.object.name='globalThis'][callee.property.name='Function']",
        },
        {
          message: "postMessage with '*' as targetOrigin is prohibited.",
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.property.name='postMessage'] > Literal.Argument[value='*']",
        },
        {
          message: 'Writing to document.domain is prohibited.',
          selector:
            "AssignmentExpression[left.type='MemberExpression'][left.object.name='document'][left.property.name='domain']",
        },
      ],
    },
  },

  {
    files: ['src/**/*.{ts,tsx}', 'prisma/seed.ts'],
    rules: {
      'prisma/no-snake-case-in-ts': 'warn',
      'prisma/no-unsafe': 'error',
      'prisma/require-select': 'error',
    },
  },
  {
    files: ['prisma/seed.ts', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/*.integration.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      'no-console': 'off',
    },
  },
]
