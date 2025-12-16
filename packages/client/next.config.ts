import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude server-side packages from serverless bundle
  // These are only needed client-side (browser) for WebGPU/WASM
  serverExternalPackages: ['onnxruntime-node', 'sharp'],

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
