import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";

export default defineConfig([
  { files: ["src/public/**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.browser } },
  { files: ["src/**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.node } },
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { 
    plugins: [
      '@typescript-eslint'
    ],
    rules: {
      semi: [ 'error' ],
      eqeqeq: [ 'error', 'always', { 'null': 'ignore' } ],
    }
  }
]);