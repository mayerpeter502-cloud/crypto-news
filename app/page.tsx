'use client';
import React, { useState, useEffect, useRef } from 'react';
import NewsCard from '@/components/NewsCard';
import PriceTicker from '@/components/PriceTicker';
import Header from '@/components/Header';
import { getCryptoNews } from '@/lib/getNews';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const filters = [
    { id: 'ALL', label: 'All News' },
    { id: 'BTC', label: 'Bitcoin' },
    { id: 'ETH', label: 'Ethereum' },
    { id: 'SOL', label: 'Solana' },
    { id: 'REGULATION', label: 'Regulation' }
  ];

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
      <Header />
      <PriceTicker />

      {/* ШАПКА */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e4e4e7' }}>
        <h1 style={{ textAlign: 'center', paddingTop: '24px', fontSize: '24px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '0.1em', color: '#000000', textTransform: 'uppercase', margin: 0 }}>
          MARKET PULSE
        </h1>
        <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3em', paddingBottom: '24px', color: '#52525b', margin: 0 }}>
          REAL-TIME CRYPTO INTELLIGENCE
        </p>
      </div>

      {/* КОНТЕЙНЕР С БАННЕРАМИ */}
      <div className="flex justify-center w-full max-w-[1400px] mx-auto px-4 md:px-8 pt-8 items-start relative gap-8">
        
        {/* ЛЕВАЯ РЕКЛАМА (ПК) */}
        <aside className="hidden xl:block sticky top-[100px]" style={{ width: '160px', minWidth: '160px', flexShrink: 0 }}>
          <div style={{ 
            height: '600px', width: '100%', 
            background: 'linear-gradient(180deg, #ea580c 0%, #facc15 100%)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            writingMode: 'vertical-rl', textOrientation: 'mixed', fontWeight: '900', color: 'black', fontSize: '20px'
          }}>
            ADVERTISING
          </div>
        </aside>

        {/* ЦЕНТРАЛЬНАЯ ЛЕНТА */}
        <div className="w-full max-w-[640px] flex-shrink-0">
          <div className="flex w-full gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setCategory(f.id)}
                className={`flex-1 py-3 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider border text-center whitespace-nowrap ${
                  category === f.id ? 'bg-black border-black text-white shadow-lg' : 'bg-white border-zinc-200 text-zinc-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {news.map((item, index) => (
              <NewsCard key={`${item.id}-${index}`} {...item} currentLang="EN" />
            ))}
          </div>

          <div ref={loaderRef} className="h-24 flex justify-center items-center">
            {hasMore && !loading && (
              <div className="w-6 h-6 border-2 border-[#ea580c] border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>

        {/* ПРАВАЯ РЕКЛАМА (ПК) */}
        <aside className="hidden xl:block sticky top-[100px]" style={{ width: '160px', minWidth: '160px', flexShrink: 0 }}>
          <div style={{ 
            height: '600px', width: '100%', 
            background: 'linear-gradient(180deg, #facc15 0%, #ea580c 100%)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            writingMode: 'vertical-rl', textOrientation: 'mixed', fontWeight: '900', color: 'black', fontSize: '20px'
          }}>
            ADVERTISING
          </div>
        </aside>

      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}