import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude heavy server-side packages from Vercel's file tracing
  // These packages are only needed client-side (browser WebGPU/WASM)
  outputFileTracingExcludes: {
    '*': [
      'node_modules/onnxruntime-node/**/*',
      'node_modules/@img/sharp-*/**/*',
      'node_modules/sharp/**/*',
    ],
  },

  webpack: (config) => {
    // See https://xenova.github.io/transformers.js/docs/getting-started.html#nextjs
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    return config;
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin',
        },
        {
          key: 'Cross-Origin-Embedder-Policy',
          value: 'require-corp',
        },
      ],
    },
  ],
};

export default nextConfig;
