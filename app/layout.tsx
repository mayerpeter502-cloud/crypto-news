import type { Metadata } from "next";
// 1. Меняем импорт Geist на Inter
import { Inter } from "next/font/google"; 
import "./globals.css";

// 2. Настраиваем шрифт Inter
const inter = Inter({
  subsets: ["latin", "cyrillic"], // Добавляем поддержку кириллицы
  variable: "--font-inter",
});

// app/layout.tsx
export const metadata = {
  // Этот заголовок будет отображаться в карточке Telegram вместо домена
  title: 'CRYPTOFLOW | Market Pulse', 
  description: 'Intelligence', // Короткое описание
  icons: {
    icon: '/favicon.ico',
  },
  // Добавляем OpenGraph данные специально для соцсетей и мессенджеров
  openGraph: {
    title: 'CRYPTOFLOW | Market Pulse',
    description: 'Market Intelligence',
    siteName: 'CRYPTOFLOW',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Применяем шрифт Inter ко всему сайту через className */}
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}