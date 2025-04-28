import type { NextConfig } from "next";
// This adapter downloads entire next 13 and not maintained well.
// So, I added transpilePackages from sources by myself :P
// import { withGluestackUI } from "@gluestack/ui-next-adapter";

const nextConfig: NextConfig = {
  /* FIXME: https://github.com/vercel/next.js/issues/43886
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
    },
    resolveExtensions: [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ".mdx",
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".mjs",
      ".json",
    ],
  },
  */
  webpack: config => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];
    return config;
  },
  transpilePackages: [
    "nativewind",
    "react-native-reanimated",
    "react-native-css-interop",
    "@expo",
    "expo-",
    "@gluestack-ui",
  ],
  compress: false,
  reactStrictMode: false,
};

export default nextConfig;
