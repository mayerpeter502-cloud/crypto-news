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
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-4 pt-6">
      
      {/* ВЕРХНИЙ РЕКЛАМНЫЙ БЛОК (теперь для него есть место) */}
      <div style={{ width: '100%', maxWidth: '600px', height: '90px', backgroundColor: '#111', border: '1px dashed #333', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#444', fontSize: '10px', textTransform: 'uppercase' }}>
        Место для баннера 728x90 / Ad space
      </div>

      <div className="max-w-xl w-full bg-[#0a0a0a] border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* КОНТЕЙНЕР ДЛЯ КАРТИНКИ: теперь с отступами, чтобы она не была на весь экран */}
        <div style={{ padding: '20px 20px 0 20px' }}>
          <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#111' }}>
            <img 
              src={news?.imageurl} 
              alt="" 
              style={{ width: '100%', height: '100%', objectCover: 'cover', opacity: '0.8' }} 
            />
          </div>
        </div>

        <div className="p-6 text-center">
          <p style={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
            Market Pulse News AI
          </p>
          
          <h1 style={{ color: '#ffffff', fontSize: '20px', fontWeight: '900', lineHeight: '1.3', marginBottom: '15px' }}>
            {news?.title}
          </h1>

          {/* БОКОВОЙ/НИЖНИЙ РЕКЛАМНЫЙ БЛОК ВНУТРИ КАРТОЧКИ */}
          <div style={{ backgroundColor: '#161616', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #222' }}>
            <p style={{ color: '#ea580c', fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>СПОНСОР: ВАША ССЫЛКА</p>
            <p style={{ color: '#71717a', fontSize: '12px' }}>Тут может быть ваша партнерская ссылка на биржу или сервис.</p>
          </div>

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
              fontSize: '14px'
            }}
          >
            ПЕРЕЙТИ К ИСТОЧНИКУ
          </a>
          
          <button 
            onClick={() => router.push('/')}
            style={{ color: '#3f3f46', fontSize: '10px', marginTop: '20px', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            ← На главную
          </button>
        </div>
      </div>

      {/* НИЖНИЙ РЕКЛАМНЫЙ БЛОК */}
      <div style={{ marginTop: '20px', width: '100%', maxWidth: '600px', padding: '20px', textAlign: 'center', color: '#222', fontSize: '10px' }}>
        РЕКЛАМА / ADVERTISING CONTACT @pulse_admin
      </div>
    </div>
  );
}