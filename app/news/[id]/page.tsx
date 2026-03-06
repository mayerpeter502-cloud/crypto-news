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
      <div className="max-w-2xl w-full bg-[#0a0a0a] border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Изображение новости */}
        <div className="w-full h-64 overflow-hidden bg-zinc-900">
          <img 
            src={news.imageurl} 
            alt="" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        <div className="p-6 md:p-10 text-center">
          <div className="inline-block bg-orange-600 text-white px-3 py-1 rounded text-[10px] font-black tracking-widest mb-6 uppercase">
            PULSE NEWS INTEL
          </div>
          
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-4">Переход из Telegram канала</p>
          
          {/* Заголовок теперь принудительно белый */}
          <h1 className="text-2xl md:text-4xl font-black leading-tight mb-6 text-white">
            {news.title}
          </h1>

          {/* Описание бело-серое */}
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            {news.body.length > 200 ? news.body.substring(0, 200) + '...' : news.body}
          </p>

          {/* Рекламный блок */}
          <div className="w-full py-8 border border-dashed border-zinc-800 rounded-xl mb-8 flex flex-col items-center justify-center bg-zinc-900/30">
            <span className="text-zinc-600 text-[9px] uppercase tracking-widest mb-2">Спонсируемый контент</span>
            <span className="text-zinc-400 font-bold text-sm">Ваша реклама здесь</span>
          </div>

          <div className="flex flex-col gap-4">
            <a 
              href={news.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl transition-all hover:bg-orange-600 hover:text-white"
              style={{ textDecoration: 'none' }}
            >
              Читать оригинал
            </a>
            
            <button 
              onClick={() => router.push('/')}
              className="text-zinc-500 hover:text-white text-xs uppercase tracking-widest transition-colors py-2"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-zinc-700 text-[9px] uppercase tracking-[0.3em]">
        © 2026 CRYPTO PULSE AI • SYSTEM OPERATIONAL
      </footer>
    </div>
  );
}