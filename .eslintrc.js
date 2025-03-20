module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'react', 'react-hooks'],
  extends: [
    'plugin:@typescript-eslint/recommended', // TypeScript linting rules
    'plugin:prettier/recommended', // Integrates Prettier with ESLint
    'plugin:react/recommended', // React linting rules
    'plugin:react-hooks/recommended', // React hooks linting
    'next/core-web-vitals', // Next.js specific rules (including web vitals)
  ],
  root: true,
  env: {
    node: true,
    jest: true,
    browser: true, // Required for Next.js
  },
  ignorePatterns: ['.eslintrc.js', 'jest.config.ts'],
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
  overrides: [
    {
      // Frontend (Next.js) specific rules
      files: ['apps/frontend/**/*.{js,jsx,ts,tsx}'],
      extends: [
        'plugin:react/recommended',
        'plugin:prettier/recommended',
        'plugin:react-hooks/recommended',
        'next/core-web-vitals',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        // React and Next.js specific adjustments for frontend
        'react/prop-types': 'off', // Turn off PropTypes check if using TypeScript
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      // Backend (NestJS) specific rules
      files: ['apps/backend/**/*.{js,ts}'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {
        '@typescript-eslint/interface-name-prefix': 'off', // Custom rules for NestJS
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off', // Allow explicit any (customizable)
    '@typescript-eslint/explicit-function-return-type': 'off', // Allow implicit return type
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
  },
};
