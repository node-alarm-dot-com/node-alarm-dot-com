import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['**/node_modules', '**/dist', '**/dist-test']),
  js.configs.recommended,
  {
    // Scoped to .ts so plain JS config files (e.g. this one) aren't sent through
    // type-aware linting, which requires a tsconfig that covers the file.
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  prettierConfig,
  {
    plugins: {
      prettier
    },

    rules: {
      'no-console': 1,
      'prettier/prettier': 2
    }
  },
  {
    // projectService only auto-discovers files named `tsconfig.json`, which excludes test/**.
    // Point these files at tsconfig.test.json (which extends tsconfig.json and includes both dirs) instead.
    files: ['test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: './tsconfig.test.json',
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
]);
