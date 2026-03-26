'use client';
import React, { useState, useEffect, useRef } from 'react';
import NewsCard from '@/components/NewsCard';
import PriceTicker from '@/components/PriceTicker';
import Header from '@/components/Header';
import { getCryptoNews } from '@/lib/getNews';
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://crypto-news-swart.vercel.app'),
  title: 'Market Pulse | Crypto News Terminal',
  description: 'Real-time cryptocurrency news aggregation and market analysis.',
  openGraph: {
    title: 'Market Pulse | Crypto News Terminal',
    description: 'Real-time cryptocurrency news aggregation and market analysis.',
    url: '/',
    siteName: 'Market Pulse',
    images: [
      {
        url: '/og-main.png', // Положите любую картинку в папку public с таким названием
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market Pulse | Crypto News Terminal',
    description: 'Real-time cryptocurrency news aggregation and market analysis.',
    images: ['/og-main.png'],
  },
};

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  
  // Состояния видимости баннеров
  const [showTopAd, setShowTopAd] = useState(false);
  const [showBottomAd, setShowBottomAd] = useState(false);
  
  const loaderRef = useRef<HTMLDivElement>(null);

  const filters = [
    { id: 'ALL', label: 'All News' },
    { id: 'BTC', label: 'Bitcoin' },
    { id: 'ETH', label: 'Ethereum' },
    { id: 'SOL', label: 'Solana' },
    { id: 'REGULATION', label: 'Regulation' }
  ];

  // Управление таймерами баннеров
  useEffect(() => {
    let topTimer: NodeJS.Timeout;
    let bottomTimer: NodeJS.Timeout;

    // Верхний баннер: первое появление через 15с, повторное после закрытия через 60с
    if (!showTopAd) {
      topTimer = setTimeout(() => setShowTopAd(true), 15000);
    }

    // Нижний баннер: первое появление через 25с, повторное после закрытия через 60с
    if (!showBottomAd) {
      bottomTimer = setTimeout(() => setShowBottomAd(true), 25000);
    }

    return () => {
      clearTimeout(topTimer);
      clearTimeout(bottomTimer);
    };
  }, [showTopAd, showBottomAd]);

  const loadNews = async (isInitial: boolean = false) => {
    if (isInitial) setLoading(true);
    try {
      const lastTimestamp = !isInitial && news.length > 0 ? news[news.length - 1].published_on : 0;
      const newData = await getCryptoNews('EN', lastTimestamp, category);
      if (newData && newData.length > 0) {
        setNews(prev => isInitial ? newData : [...prev, ...newData]);
      } else {
        setHasMore(false);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    setNews([]);
    setHasMore(true);
    loadNews(true);
  }, [category]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) loadNews(false);
    }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, news]);

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      
      {/* ВЕРХНИЙ БАННЕР */}
      {showTopAd && (
        <div style={{ position: 'fixed', top: '8px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 9999, padding: '0 16px', pointerEvents: 'none' }}>
          <div style={{ 
            pointerEvents: 'auto', width: '100%', maxWidth: '850px', height: '60px',
            background: 'linear-gradient(90deg, #ea580c 0%, #facc15 100%)',
            borderRadius: '12px', border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            animation: 'slideDownAd 0.5s ease-out forwards'
          }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 40px' }}>
              <span style={{ color: 'black', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
                Premium Crypto Intelligence — Join the Terminal Elite
              </span>
            </div>
            <button onClick={() => setShowTopAd(false)} style={{ marginRight: '12px', width: '32px', height: '32px', background: 'black', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px' }}>×</button>
          </div>
        </div>
      )}

      {/* НИЖНИЙ БАННЕР */}
      {showBottomAd && (
        <div style={{ position: 'fixed', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 9999, padding: '0 16px', pointerEvents: 'none' }}>
          <div style={{ 
            pointerEvents: 'auto', width: '100%', maxWidth: '850px', height: '60px',
            background: 'linear-gradient(90deg, #facc15 0%, #ea580c 100%)',
            borderRadius: '12px', border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
            animation: 'slideUpAd 0.5s ease-out forwards'
          }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 40px' }}>
              <span style={{ color: 'black', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
                Trade Smarter with AI Signals. Connect Wallet to start.
              </span>
            </div>
            <button onClick={() => setShowBottomAd(false)} style={{ marginRight: '12px', width: '32px', height: '32px', background: 'black', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px' }}>×</button>
          </div>
        </div>
      )}

      <Header />
      <PriceTicker />

      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e4e4e7' }}>
        <h1 style={{ textAlign: 'center', paddingTop: '24px', fontSize: '24px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '0.1em', color: '#000000', textTransform: 'uppercase', margin: 0 }}>
          MARKET PULSE
        </h1>
        <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3em', paddingBottom: '24px', color: '#52525b', margin: 0 }}>
          REAL-TIME CRYPTO INTELLIGENCE
        </p>
      </div>

      {/* РАСШИРЕННАЯ ЛЕНТА НОВОСТЕЙ */}
      <div className="flex justify-center w-full px-4 pt-8">
        <div className="w-full" style={{ maxWidth: '850px' }}> {/* Ширина теперь как у баннеров */}
          <div className="flex w-full gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setCategory(f.id)}
                className={`flex-1 py-3 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider border text-center whitespace-nowrap transition-all ${
                  category === f.id ? 'bg-black border-black text-white shadow-lg' : 'bg-white border-zinc-200 text-zinc-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6"> {/* Увеличил отступ между карточками для широкой ленты */}
            {news.map((item, index) => (
              <div key={`${item.id}-${index}`} className="w-full">
                <NewsCard {...item} currentLang="EN" />
              </div>
            ))}
          </div>

          <div ref={loaderRef} className="h-24 flex justify-center items-center">
            {hasMore && !loading && (
              <div className="w-6 h-6 border-2 border-[#ea580c] border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideDownAd { from { transform: translateY(-100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideUpAd { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </main>
  );
}