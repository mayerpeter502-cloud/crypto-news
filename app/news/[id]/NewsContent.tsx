'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PriceTicker from '@/components/PriceTicker';

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
        <button onClick={() => router.push('/')} className="bg-[#ea580c] px-8 py-3 rounded-full font-black uppercase text-white">
          На главную
        </button>
      </div>
    );
  }

  return (
    // ВОЗВРАЩАЕМ ЧЕРНЫЙ ФОН ДЛЯ ВСЕЙ СТРАНИЦЫ
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <PriceTicker />

<div className="flex flex-col items-center pt-8 pb-4 bg-white">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-black">
          MARKET PULSE
        </h2>
        <p className="text-[10px] font-bold uppercase letter spacing tracking-[0.3em] text-zinc-400 mt-2">
          REAL-TIME CRYPTO INTELLIGENCE
        </p>
      </div>

      {/* ВОЗВРАЩАЕМ СВЕТЛО-СЕРЫЙ ФОН КОНТЕНТНОЙ ОБЛАСТИ (как на скриншотах) */}
      <div style={{ backgroundColor: '#f4f4f5' }} className="flex flex-col items-center p-4 pt-8">
        
        <div className="relative flex justify-center w-full max-w-[1200px] gap-8">
          
          {/* Яркие баннеры оставляем по бокам */}
          <aside className="hidden lg:flex flex-col gap-4 w-[160px] shrink-0">
            <div style={{ height: '600px', width: '100%', background: 'linear-gradient(180deg, #ea580c 0%, #facc15 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', textOrientation: 'mixed', fontWeight: '900', color: 'black', fontSize: '20px', boxShadow: '0 0 20px rgba(234, 88, 12, 0.3)' }}>
              РЕКЛАМА / ADVERTISING
            </div>
          </aside>

          <div className="w-full max-w-[640px]">
            {/* КАРТОЧКА НОВОСТИ - СТРОГО ЧЕРНАЯ */}
            <div style={{ backgroundColor: '#050505', border: '1px solid #18181b', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              
              {mounted && (
                <button 
                  onClick={handleCopy}
                  style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50, width: '40px', height: '40px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: copied ? '#16a34a' : 'rgba(0,0,0,0.6)', color: 'white' }}
                >
                  {copied ? '✅' : '🔗'}
                </button>
              )}

              <div style={{ padding: '16px' }}>
                <div style={{ width: '100%', height: '280px', borderRadius: '18px', overflow: 'hidden', backgroundColor: '#18181b' }}>
                  <img src={article.imageurl || article.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
              
              <div style={{ padding: '32px', paddingTop: '8px', textAlign: 'center' }}>
                <h1 style={{ color: '#ffffff', fontSize: '26px', fontStyle: 'italic', fontWeight: '900', lineHeight: '1.2', marginBottom: '20px', letterSpacing: '-0.025em', textTransform: 'uppercase' }}>
                  {article.title}
                </h1>

                <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px', textAlign: 'left' }}>
                  {article.body}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                  <a 
                    href={article.url || article.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '18px 50px', backgroundColor: '#ea580c', color: 'white', fontWeight: '900', fontSize: '13px', borderRadius: '9999px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.4em' }}
                  >
                    Read the original
                  </a>
                </div>
              </div>
            </div>

            {/* ПОХОЖИЕ НОВОСТИ */}
            {related && related.length > 0 && (
              <div style={{ marginTop: '48px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '24px', color: '#ea580c', textAlign: 'left' }}>
                  Similar news
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {related.map((item: any) => (
                    <div 
                      key={item.news_id} 
                      onClick={() => router.push(`/news/${item.news_id}`)}
                      style={{ backgroundColor: '#050505', border: '1px solid #18181b', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div style={{ width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', marginRight: '16px', flexShrink: 0 }}>
                        <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: '700', lineHeight: '1.3', color: '#f4f4f5' }}>{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="hidden lg:flex flex-col gap-4 w-[160px] shrink-0">
            <div style={{ height: '600px', width: '100%', background: 'linear-gradient(180deg, #facc15 0%, #ea580c 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', textOrientation: 'mixed', fontWeight: '900', color: 'black', fontSize: '20px', boxShadow: '0 0 20px rgba(234, 88, 12, 0.3)' }}>
              РЕКЛАМА / ADVERTISING
            </div>
          </aside>
        </div>

        {/* КНОПКА НАЗАД - ТЕПЕРЬ ОНА ЧЕРНАЯ, ЧТОБЫ ВЫДЕЛЯТЬСЯ НА СЕРОМ ФОНЕ */}
        <div style={{ marginTop: '56px', paddingBottom: '80px' }}>
          <button 
            onClick={() => router.push('/')} 
            style={{ padding: '14px 32px', backgroundColor: '#000000', borderRadius: '9999px', color: '#ffffff', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', border: 'none' }}
          >
            ← Home
          </button>
        </div>
      </div>
    </div>
  );
}