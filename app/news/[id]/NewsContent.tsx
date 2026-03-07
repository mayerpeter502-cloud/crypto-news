'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function NewsContent({ article, id }: { article: any, id: string }) {
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
        <button onClick={() => router.push('/')} style={{ backgroundColor: '#ea580c', padding: '12px 32px', borderRadius: '9999px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer' }}>
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-4 pt-6 text-white font-sans">
      
      {/* ВЕРХНИЙ БАННЕР */}
      <div style={{ width: '100%', maxWidth: '600px', height: '150px', backgroundColor: '#0c0c0c', border: '1px dashed #27272a', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
        Место для баннера 728x90
      </div>

      {/* КАРТОЧКА НОВОСТИ */}
      <div style={{ maxWidth: '36rem', width: '100%', backgroundColor: '#050505', border: '1px solid #18181b', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* КНОПКА ПОДЕЛИТЬСЯ (🔗) */}
        {mounted && (
          <button 
            onClick={handleCopy}
            style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50, width: '48px', height: '48px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s', backgroundColor: copied ? '#16a34a' : 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            {copied ? '✅' : '🔗'}
          </button>
        )}

        <div style={{ padding: '16px' }}>
          <div style={{ width: '100%', height: '220px', borderRadius: '18px', overflow: 'hidden', backgroundColor: '#18181b' }}>
            <img src={article.imageurl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        
        <div style={{ padding: '32px', paddingTop: '8px', textAlign: 'center' }}>
          {/* ЗАГОЛОВОК: ПРИНУДИТЕЛЬНО БЕЛЫЙ */}
          <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-0.025em' }}>
            {article.title}
          </h1>

          {/* ОПИСАНИЕ: ПРИНУДИТЕЛЬНО БЕЛО-СЕРЫЙ */}
          <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6', marginBottom: '40px', textAlign: 'left', opacity: 0.9 }}>
            {article.body?.substring(0, 300)}...
          </p>

          {/* КНОПКА ОРИГИНАЛА: 11px, tracking 0.4em */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px 48px', backgroundColor: '#ea580c', color: 'white', fontWeight: '900', fontSize: '11px', borderRadius: '9999px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.4em', transition: 'transform 0.2s' }}
            >
              Читать оригинал
            </a>
          </div>
        </div>
      </div>

      {/* КНОПКА НАЗАД: ВЫНЕСЕНА ПОД КАРТОЧКУ */}
      <div style={{ width: '100%', maxWidth: '36rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px' }}>
        <button 
          onClick={() => router.push('/')} 
          style={{ marginBottom: '32px', color: '#000000', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.4em', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', padding: '8px' }}
        >
          ← Вернуться на главную
        </button>

        {/* НИЖНЯЯ ЛИНИЯ И РЕКЛАМА */}
        <div style={{ width: '100%', paddingTop: '32px', borderTop: '1px solid #18181b', textAlign: 'center' }}>
          <p style={{ color: '#3f3f46', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
            МЕСТО ДЛЯ ВАШЕЙ РЕКЛАМЫ / CONTACT @pulse_admin
          </p>
        </div>
      </div>
    </div>
  );
}