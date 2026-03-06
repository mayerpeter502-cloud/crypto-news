// app/news/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function NewsRedirectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpecificNews() {
      try {
        // Запрашиваем новости, чтобы найти ту самую по ID
        const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN`);
        const data = await res.json();
        const article = data.Data.find((a: any) => a.id === id);
        
        if (article) {
          setNews(article);
        }
        setLoading(false);
      } catch (error) {
        console.error("Ошибка загрузки новости:", error);
        setLoading(false);
      }
    }
    fetchSpecificNews();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Новость не найдена</h1>
        <button onClick={() => router.push('/')} className="text-orange-500 underline">На главную</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-[#0a0a0a] border border-zinc-900 p-6 md:p-10 rounded-2xl shadow-2xl">
        
        {/* Логотип вашего сайта */}
        <div className="flex justify-center mb-8">
          <div className="bg-orange-600 text-white px-4 py-1 rounded font-black tracking-tighter text-xl">
            PULSE NEWS
          </div>
        </div>

        <div className="text-center">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Вы переходите из Telegram</p>
          
          <h1 className="text-xl md:text-3xl font-bold leading-tight mb-6">
            {news.title}
          </h1>

          {/* Место под будущую рекламу */}
          <div className="w-full h-32 bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl mb-8 flex items-center justify-center">
            <span className="text-zinc-600 text-xs uppercase tracking-widest">Рекламный блок (Place for Ad)</span>
          </div>

          <div className="flex flex-col gap-4">
            <a 
              href={news.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)]"
            >
              Читать оригинал
            </a>
            
            <button 
              onClick={() => router.push('/')}
              className="w-full py-3 text-zinc-500 hover:text-white text-sm transition-colors"
            >
              Вернуться на главную сайта
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-10 text-zinc-600 text-[10px] uppercase tracking-widest">
        &copy; 2026 Crypto Pulse AI
      </footer>
    </div>
  );
}