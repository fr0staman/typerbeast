/* eslint-disable @typescript-eslint/no-require-imports */
const sharedConfig = require("../../packages/ui/tailwind.config");

module.exports = {
  ...sharedConfig,
  important: "html",
  content: [...sharedConfig.content, "./src/**/*.{js,ts,jsx,tsx}"],
};
