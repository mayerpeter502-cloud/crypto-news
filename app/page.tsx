'use client';

import { useState, useEffect } from 'react';
import NewsCard from '@/components/NewsCard';
import PriceTicker from '@/components/PriceTicker';
import Header from '@/components/Header';
import { getCryptoNews } from '@/lib/getNews';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [lang, setLang] = useState('EN');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: 'ALL', label: lang === 'EN' ? 'All News' : 'Все новости' },
    { id: 'BTC', label: 'Bitcoin' },
    { id: 'ETH', label: 'Ethereum' },
    { id: 'SOL', label: 'Solana' },
    { id: 'REGULATION', label: lang === 'EN' ? 'Regulation' : 'Законы' }
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Прямой вызов функции
        const data = await getCryptoNews(lang, 0, category);
        if (data && Array.isArray(data)) {
          setNews(data);
        }
      } catch (err) {
        console.error("Error loading news:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [category, lang]);

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Header setLang={setLang} currentLang={lang} />
      <PriceTicker />

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2">
            PULSE <span className="text-orange-600">TERMINAL</span>
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] mb-8">
            {lang === 'EN' ? 'Neural Market Intelligence 24/7' : 'Крипто-аналитика в реальном времени'}
          </p>
          
          <div className="flex w-full gap-2 overflow-x-auto pb-4">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setCategory(f.id)}
                className={`flex-1 py-3 px-6 rounded text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap ${
                  category === f.id 
                  ? 'bg-orange-600 border-orange-600 text-white' 
                  : 'bg-zinc-900 border-zinc-900 text-zinc-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-orange-600 animate-pulse font-bold uppercase text-xs">
            {lang === 'EN' ? 'Loading...' : 'Загрузка...'}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {news.map((item, index) => (
              <NewsCard key={`${item.id}-${index}`} {...item} currentLang={lang} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}