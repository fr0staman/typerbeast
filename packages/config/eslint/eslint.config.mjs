// packages/config/eslint.config.js
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import typescriptEslint from "typescript-eslint";
import globals from "globals";
import migratedRules from "./react-native-eslint.config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default typescriptEslint.config(
  ...typescriptEslint.configs.recommended,
  ...migratedRules,
  ...compat.extends("plugin:prettier/recommended"),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        React: true,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      quotes: "off",
    },
  },
  { ignores: ["*eslint.config.mjs", "*prettier.config.mjs"] },
);
