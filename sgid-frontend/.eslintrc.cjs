module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard-with-typescript',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [],
  ignorePatterns: ['vite.config.ts'],
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
    'react/react-in-jsx-scope': 'off',
    'import/no-absolute-path': 'off',
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        tabWidth: 2,
        semi: false,
        singleQuote: true,
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
