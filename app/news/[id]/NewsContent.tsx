'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Добавляем типизацию для похожих новостей
export default function NewsContent({ article, id, related = [] }: { article: any, id: string, related?: any[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    try {
      const shareUrl = `${window.location.origin}/news/${id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-xl font-black mb-4 uppercase">Новость не найдена</h1>
        <button onClick={() => router.push('/')} style={{ backgroundColor: '#ea580c', padding: '12px 32px', borderRadius: '9999px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', border: 'none', color: 'white' }}>
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-4 pt-6 text-white font-sans">
      
      {/* МЕСТО ДЛЯ БАННЕРА */}
      <div style={{ width: '100%', maxWidth: '600px', height: '90px', backgroundColor: '#0c0c0c', border: '1px dashed #27272a', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
        Место для баннера 728x90
      </div>

      {/* КАРТОЧКА НОВОСТИ */}
      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: '#050505', border: '1px solid #18181b', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {mounted && (
          <button 
            onClick={handleCopy}
            style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50, width: '40px', height: '40px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s', backgroundColor: copied ? '#16a34a' : 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            {copied ? '✅' : '🔗'}
          </button>
        )}

        <div style={{ padding: '16px' }}>
          <div style={{ width: '100%', height: '180px', borderRadius: '18px', overflow: 'hidden', backgroundColor: '#18181b' }}>
            <img src={article.imageurl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        
        <div style={{ padding: '32px', paddingTop: '0px', textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '900', lineHeight: '1.2', marginBottom: '16px', letterSpacing: '-0.025em' }}>
            {article.title}
          </h1>

          <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px', textAlign: 'left' }}>
            {article.body}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 40px', backgroundColor: '#ea580c', color: 'white', fontWeight: '900', fontSize: '11px', borderRadius: '9999px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.4em' }}
            >
              Читать оригинал
            </a>
          </div>
        </div>
      </div>

      {/* БЛОК ПОХОЖИХ НОВОСТЕЙ (5-6 шт) */}
      {related.length > 0 && (
        <div style={{ width: '100%', maxWidth: '600px', marginTop: '40px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '20px', color: '#ea580c', textAlign: 'center' }}>
            Похожие новости
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {related.map((item: any) => (
              <div 
                key={item.news_id} 
                onClick={() => router.push(`/news/${item.news_id}`)}
                style={{ backgroundColor: '#050505', border: '1px solid #18181b', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', marginRight: '16px', flexShrink: 0 }}>
                  <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: '700', lineHeight: '1.3', color: '#e4e4e7' }}>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* КНОПКА НАЗАД */}
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '48px' }}>
        <button 
          onClick={() => router.push('/')} 
          style={{ marginBottom: '32px', color: '#a1a1aa', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.4em', cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}
        >
          ← На главную
        </button>
      </div>
    </div>
  );
}