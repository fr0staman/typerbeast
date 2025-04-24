/* eslint-disable @typescript-eslint/no-require-imports */
const sharedConfig = require("../../packages/ui/tailwind.config");

module.exports = {
  ...sharedConfig,
  content: ["./**/*.{js,ts,jsx,tsx}"],
};
