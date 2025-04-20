import nextPlugin from "@next/eslint-plugin-next";
import standardEslint from "./eslint.config.mjs";

const eslintConfig = [
  {
    name: "Next Plugin",
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  ...standardEslint,
];

export default eslintConfig;
