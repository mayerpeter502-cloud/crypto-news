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
        if (article) setNews(article);
        setLoading(false);
      } catch (e) { setLoading(false); }
    }
    fetchSpecificNews();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-4 pt-10">
      <div className="max-w-xl w-full bg-[#0a0a0a] border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Картинка: теперь маленькая и аккуратная */}
        <div className="w-full h-48 bg-zinc-900">
          <img src={news?.imageurl} alt="" className="w-full h-full object-cover opacity-80" />
        </div>

        <div className="p-6 text-center">
          <p style={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
            Переход из Telegram
          </p>
          
          {/* ЗАГОЛОВОК: Принудительно белый */}
          <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '900', lineHeight: '1.2', marginBottom: '15px' }}>
            {news?.title}
          </h1>

          {/* ОПИСАНИЕ: Принудительно серое */}
          <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.5', marginBottom: '25px' }}>
            {news?.body?.substring(0, 150)}...
          </p>

          {/* КНОПКА: Оранжевая, без красных/фиолетовых цветов */}
          <a 
            href={news?.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '16px', 
              backgroundColor: '#ea580c', 
              color: '#ffffff', 
              fontWeight: 'bold', 
              borderRadius: '12px', 
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            ЧИТАТЬ ПОЛНОСТЬЮ
          </a>
          
          <button 
            onClick={() => router.push('/')}
            style={{ color: '#52525b', fontSize: '11px', marginTop: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ВЕРНУТЬСЯ НА ГЛАВНУЮ
          </button>
        </div>
      </div>
    </div>
  );
}