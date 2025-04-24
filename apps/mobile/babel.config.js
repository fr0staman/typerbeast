module.exports = {
  presets: ["module:@react-native/babel-preset", "nativewind/babel"],
  plugins: [
    [
      require.resolve("babel-plugin-module-resolver"),
      {
        root: ["../.."],
        alias: {
          // define aliases to shorten the import paths
          "@/ui": "../../packages/ui",
        },
        extensions: [".js", ".jsx", ".tsx", ".ios.js", ".android.js"],
      },
    ],
    "react-native-reanimated/plugin",
  ],
};
