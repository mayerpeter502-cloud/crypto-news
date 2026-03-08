import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ТЗ: Игнорируем ошибки TypeScript при сборке
    ignoreBuildErrors: true,
  },
  eslint: {
    // ТЗ: Игнорируем ошибки ESLint при сборке
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;