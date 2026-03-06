import type { Metadata } from "next";
// 1. Меняем импорт Geist на Inter
import { Inter } from "next/font/google"; 
import "./globals.css";

// 2. Настраиваем шрифт Inter
const inter = Inter({
  subsets: ["latin", "cyrillic"], // Добавляем поддержку кириллицы
  variable: "--font-inter",
});

export const metadata = {
  // Это будет единственная надпись в карточке (вместо домена)
  title: 'CRYPTOFLOW', 
  description: ' ', // Ставим пробел, чтобы убрать "Market Intelligence" или "Aggregator"
  openGraph: {
    title: 'CRYPTOFLOW',
    description: ' ',
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