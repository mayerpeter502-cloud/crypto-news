import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// 1. Настраиваем шрифт Inter
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

// 2. Глобальные метаданные (теперь они здесь одни)
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

// 3. Единственная функция RootLayout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}