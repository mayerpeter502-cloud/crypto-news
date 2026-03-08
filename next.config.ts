import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ТЗ: Игнорируем ошибки TS при сборке
    ignoreBuildErrors: true,
  },
  // В Next.js 16+ настройки линтера вынесены или обрабатываются иначе, 
  // для прохождения билда достаточно игнорирования ошибок TS.
};

export default nextConfig;