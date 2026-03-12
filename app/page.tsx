'use client';
import { useState, useEffect, useRef } from 'react';
import NewsCard from '@/components/NewsCard';
import PriceTicker from '@/components/PriceTicker';
import Header from '@/components/Header';
import { getCryptoNews } from '@/lib/getNews';

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [lang, setLang] = useState('EN');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  // УДАЛЕНО: Автоматический запуск синхронизации при каждом входе пользователя
  // Это предотвращает появление ошибок 403 в логах Vercel

  const filters = [
    { id: 'ALL', label: lang === 'EN' ? 'All News' : 'Все новости' },
    { id: 'BTC', label: 'Bitcoin' },
    { id: 'ETH', label: 'Ethereum' },
    { id: 'SOL', label: 'Solana' },
    { id: 'REGULATION', label: lang === 'EN' ? 'Regulation' : 'Законы' }
  ];

  const loadNews = async (isInitial: boolean = false) => {
    if (isInitial) setLoading(true);
    try {
      const lastTimestamp = !isInitial && news.length > 0 ? news[news.length - 1].published_on : 0;
      const newData = await getCryptoNews(lang, lastTimestamp, category);
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
  }, [lang, category]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) loadNews(false);
    }, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, news]);

  return (
    <main className="min-h-screen bg-black text-white">
      <Header currentLang={lang} onLangChange={setLang} />
      <PriceTicker />
      <div className="max-w-[800px] mx-auto py-10 px-4">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
            {lang === 'EN' ? 'Market' : 'Пульс'} <span className="text-orange-600">{lang === 'EN' ? 'Pulse' : 'Рынка'}</span>
          </h1>
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            {lang === 'EN' ? 'Real-time crypto intelligence' : 'Крипто-аналитика в реальном времени'}
          </p>
          <div className="flex w-full gap-2 mt-8">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setCategory(f.id)}
                className={`flex-1 py-3 px-1 rounded text-[10px] font-black uppercase tracking-wider transition-all duration-200 border text-center whitespace-nowrap cursor-pointer active:scale-95 ${category === f.id ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/40' : 'bg-zinc-900 border-zinc-900 text-zinc-500 hover:border-orange-600/50 hover:text-white hover:bg-zinc-800'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="py-20 text-center text-orange-600 animate-pulse font-bold uppercase text-xs tracking-widest">
            {lang === 'EN' ? 'Loading Intelligence...' : 'Загрузка данных...'}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {news.map((item, index) => (
              <NewsCard key={`${item.id}-${index}`} {...item} currentLang={lang} />
            ))}
          </div>
        )}
        <div ref={loaderRef} className="h-24 flex justify-center items-center">
          {hasMore && !loading && (
            <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </div>
    </main>
  );
}