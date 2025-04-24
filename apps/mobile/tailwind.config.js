/* eslint-disable @typescript-eslint/no-require-imports */
const sharedConfig = require("../../packages/ui/tailwind.config");

module.exports = {
  ...sharedConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
};
