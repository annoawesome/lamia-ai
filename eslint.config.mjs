import globals from 'globals';
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from '@stylistic/eslint-plugin';
import reactEslintPlugin from 'eslint-plugin-react';

const globalConfig = {
  plugins: {
    '@stylistic': stylistic
  },
  rules: {
    '@stylistic/semi': 'error',
    'eqeqeq': [ 'error', 'always', { 'null': 'ignore' } ],
    'no-undef': 'off',
  },
};

const nodeJsEnvConfig = {
  files: [ 'src/**/*.ts' ],
  ignores: [ 'src/public/**/*.{ts,tsx}' ],
  languageOptions: {
    globals: globals.node
  },
};

const browserEnvConfig = {
  files: [ 'src/public/**/*.{ts,tsx}' ],
  languageOptions: {
    globals: globals.browser
  },
};

export default tseslint.config(
  tseslint.configs.recommended,
  eslint.configs.recommended,
  reactEslintPlugin.configs.flat.recommended,

  globalConfig,
  nodeJsEnvConfig,
  browserEnvConfig,
);

