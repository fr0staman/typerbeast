/* eslint-disable @typescript-eslint/no-require-imports */
const sharedConfig = require("../../packages/ui/tailwind.config");

module.exports = {
  ...sharedConfig,
  important: "html",
  content: [
    "../../packages/ui/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
};
