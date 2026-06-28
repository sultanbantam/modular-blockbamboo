import type { NextConfig } from "next";

const nextConfig: any = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: true,
  },
};

export default nextConfig;
