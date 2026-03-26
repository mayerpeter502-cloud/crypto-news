import type { Metadata } from "next";
// 1. Меняем импорт Geist на Inter
import { Inter } from "next/font/google"; 
import "./globals.css";

// 2. Настраиваем шрифт Inter
const inter = Inter({
  subsets: ["latin", "cyrillic"], // Добавляем поддержку кириллицы
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://crypto-news-swart.vercel.app'),
  title: 'Market Pulse | Crypto News Terminal',
  description: 'Real-time cryptocurrency news aggregation and market analysis.',
  openGraph: {
    title: 'Market Pulse | Crypto News Terminal',
    description: 'Real-time cryptocurrency news aggregation and market analysis.',
    url: '/',
    siteName: 'Market Pulse',
    images: [{ url: '/og-main.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market Pulse | Crypto News Terminal',
    description: 'Real-time cryptocurrency news aggregation and market analysis.',
    images: ['/og-main.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Применяем шрифт Inter ко всему сайту через className */}
      <body className={inter.className}>
  {children} {/* Шапка должна быть внутри children или прямо здесь, но БЕЗ оберток с max-w */}
</body>
    </html>
  );
}