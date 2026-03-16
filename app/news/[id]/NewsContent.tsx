'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    } catch (err) { console.error('Ошибка:', err); }
  };
  
  if (!article) return <div className="p-20 text-center"><h1 style={{color: 'black'}}>No news found</h1></div>;
  
  return (
    // ГЛАВНЫЙ ФОН САЙТА — СВЕТЛО-СЕРЫЙ (как на главной)
    <main style={{ backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
      <Header />
      <PriceTicker />
      
      {/* ВЕРХНИЙ БЛОК (MARKET PULSE) */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e4e4e7', textAlign: 'center', padding: '24px 0' }}>
        <h1 style={{ color: '#000000', fontSize: '24px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
          MARKET PULSE
        </h1>
        <p style={{ color: '#71717a', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3em', marginTop: '8px' }}>
          REAL-TIME CRYPTO INTELLIGENCE
        </p>
      </div>

      {/* МОБИЛЬНЫЙ БАННЕР 1 (ВЕРХНИЙ) */}
      <div className="block xl:hidden w-full px-4 pt-4">
        <div style={{ height: '120px', background: 'linear-gradient(90deg, #ea580c 0%, #facc15 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.2)' }}>
          <span style={{ color: 'black', fontWeight: '900', fontSize: '10px', letterSpacing: '0.4em' }}>ADVERTISING</span>
        </div>
      </div>

      <div className="flex justify-center w-full max-w-[1400px] mx-auto xl:gap-[64px] px-0 md:px-6 pt-4 md:pt-12 items-start relative">
        
        {/* ЛЕВАЯ РЕКЛАМА (ПК) */}
        <aside className="hidden xl:flex w-[160px] shrink-0 sticky top-[100px]">
          <div style={{ height: '600px', width: '100%', background: 'linear-gradient(180deg, #ea580c 0%, #facc15 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', fontWeight: '900', color: 'black', fontSize: '20px', boxShadow: '0 0 20px rgba(234, 88, 12, 0.3)', border: '2px solid rgba(255,255,255,0.2)' }}>
            ADVERTISING
          </div>
        </aside>

        <div className="w-full max-w-[640px] shrink-0">
          {/* КАРТОЧКА НОВОСТИ (ТЕМНАЯ) */}
          <div style={{ backgroundColor: '#050505' }} className="md:rounded-[24px] overflow-hidden relative shadow-2xl border-x md:border border-zinc-900">
            {mounted && (
              <button onClick={handleCopy} className={`absolute top-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center ${copied ? 'bg-green-600' : 'bg-black/60'} text-white border border-white/10`}>
                {copied ? '✅' : '🔗'}
              </button>
            )}
            
            <div className="p-0 md:p-4">
              <div className="w-full h-[250px] md:h-[320px] md:rounded-xl overflow-hidden bg-zinc-900">
                <img src={article.imageurl || article.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="p-6 md:p-10 pt-4 text-center">
              <h1 style={{ color: '#ffffff' }} className="text-xl md:text-3xl font-black italic leading-tight mb-6 uppercase tracking-tight">
                {article.title}
              </h1>
              <p style={{ color: '#a1a1aa' }} className="text-sm md:text-lg font-medium leading-relaxed mb-8 text-left">
                {article.body}
              </p>
              <div className="flex justify-center pb-4">
                <a href={article.url || article.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} className="px-10 py-4 bg-[#ea580c] text-white font-black text-xs rounded-full uppercase tracking-[0.3em] active:scale-95 transition-transform">
                  Read original
                </a>
              </div>
            </div>
          </div>

          {/* МОБИЛЬНЫЙ БАННЕР 2 (НИЖНИЙ) */}
          <div className="block xl:hidden w-full px-4 py-8">
            <div style={{ height: '120px', background: 'linear-gradient(90deg, #facc15 0%, #ea580c 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.2)' }}>
              <span style={{ color: 'black', fontWeight: '900', fontSize: '10px', letterSpacing: '0.4em' }}>ADVERTISING</span>
            </div>
          </div>

          {/* ПОХОЖИЕ НОВОСТИ */}
          {related && related.length > 0 && (
            <div className="mt-12 px-4 md:px-0">
              <h3 style={{ color: '#ea580c', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '24px' }}>
                Similar news
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {related.map((item: any) => (
                  <div key={item.news_id} onClick={() => router.push(`/news/${item.news_id}`)} style={{ backgroundColor: '#050505' }} className="border border-zinc-900 rounded-xl p-3 flex items-center cursor-pointer hover:border-orange-600/50 transition-all">
                    <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 shrink-0 bg-zinc-800">
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: '700', margin: 0 }} className="line-clamp-2 leading-snug">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* КНОПКА НАЗАД */}
          <div className="mt-12 pb-20 text-center">
            <button 
              onClick={() => router.push('/')} 
              style={{ backgroundColor: '#000000', color: '#ffffff' }} 
              className="px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-colors"
            >
              ← Back to pulse
            </button>
          </div>
        </div>

        {/* ПРАВАЯ РЕКЛАМА (ПК) */}
        <aside className="hidden xl:flex w-[160px] shrink-0 sticky top-[100px]">
          <div style={{ height: '600px', width: '100%', background: 'linear-gradient(180deg, #facc15 0%, #ea580c 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', fontWeight: '900', color: 'black', fontSize: '20px', boxShadow: '0 0 20px rgba(234, 88, 12, 0.3)', border: '2px solid rgba(255,255,255,0.2)' }}>
            ADVERTISING
          </div>
        </aside>
      </div>
    </main>
  );
}