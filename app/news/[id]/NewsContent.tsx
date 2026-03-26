'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PriceTicker from '@/components/PriceTicker';

export default function NewsContent({ article, id, related = [] }: { article: any, id: string, related?: any[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Состояния для всплывающих баннеров
  const [showTopAd, setShowTopAd] = useState(false);
  const [showBottomAd, setShowBottomAd] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Логика таймеров для баннеров (15с и 25с)
  useEffect(() => {
    let topTimer: NodeJS.Timeout;
    let bottomTimer: NodeJS.Timeout;

    if (!showTopAd) {
      topTimer = setTimeout(() => setShowTopAd(true), 15000);
    }
    if (!showBottomAd) {
      bottomTimer = setTimeout(() => setShowBottomAd(true), 25000);
    }

    return () => {
      clearTimeout(topTimer);
      clearTimeout(bottomTimer);
    };
  }, [showTopAd, showBottomAd]);
  
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
    <main style={{ backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
      
      {/* ВЕРХНИЙ ВСПЛЫВАЮЩИЙ БАННЕР */}
      {showTopAd && (
        <div style={{ position: 'fixed', top: '8px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 9999, padding: '0 16px', pointerEvents: 'none' }}>
          <div style={{ 
            pointerEvents: 'auto', width: '100%', maxWidth: '850px', height: '60px',
            background: 'linear-gradient(90deg, #ea580c 0%, #facc15 100%)',
            borderRadius: '12px', border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            animation: 'slideDownAd 0.5s ease-out forwards'
          }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 40px' }}>
              <span style={{ color: 'black', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
                Premium Crypto Intelligence — Join the Terminal Elite
              </span>
            </div>
            <button onClick={() => setShowTopAd(false)} style={{ marginRight: '12px', width: '32px', height: '32px', background: 'black', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px' }}>×</button>
          </div>
        </div>
      )}

      {/* НИЖНИЙ ВСПЛЫВАЮЩИЙ БАННЕР */}
      {showBottomAd && (
        <div style={{ position: 'fixed', bottom: '16px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 9999, padding: '0 16px', pointerEvents: 'none' }}>
          <div style={{ 
            pointerEvents: 'auto', width: '100%', maxWidth: '850px', height: '60px',
            background: 'linear-gradient(90deg, #facc15 0%, #ea580c 100%)',
            borderRadius: '12px', border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
            animation: 'slideUpAd 0.5s ease-out forwards'
          }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 40px' }}>
              <span style={{ color: 'black', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>
                Trade Smarter with AI Signals. Connect Wallet to start.
              </span>
            </div>
            <button onClick={() => setShowBottomAd(false)} style={{ marginRight: '12px', width: '32px', height: '32px', background: 'black', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '20px' }}>×</button>
          </div>
        </div>
      )}

      <Header />
      <PriceTicker />
      
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e4e4e7', textAlign: 'center', padding: '24px 0' }}>
        <h1 style={{ color: '#000000', fontSize: '24px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
          MARKET PULSE
        </h1>
        <p style={{ color: '#71717a', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3em', marginTop: '8px' }}>
          REAL-TIME CRYPTO INTELLIGENCE
        </p>
      </div>

      {/* Основной контейнер новости расширен до 850px для симметрии с баннерами */}
      <div className="flex justify-center w-full px-4 pt-4 md:pt-12">
        <div className="w-full" style={{ maxWidth: '850px' }}>
          
          <div style={{ backgroundColor: '#050505' }} className="md:rounded-[24px] overflow-hidden relative shadow-2xl border-x md:border border-zinc-900">
            {mounted && (
              <button onClick={handleCopy} className={`absolute top-5 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center ${copied ? 'bg-green-600' : 'bg-black/60'} text-white border border-white/10`}>
                {copied ? '✅' : '🔗'}
              </button>
            )}
            
            <div className="p-0 md:p-4">
              <div className="w-full h-[250px] md:h-[450px] md:rounded-xl overflow-hidden bg-zinc-900">
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

          {/* ПОХОЖИЕ НОВОСТИ */}
{mounted && related && related.length > 0 && (
  <div className="mt-12">
    <h3 style={{ color: '#ea580c', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '24px' }}>
      Similar news
    </h3>
    <div className="grid grid-cols-1 gap-3">
      {related.map((item: any) => (
        <div 
          key={item.news_id} 
          onClick={() => router.push(`/news/${item.news_id}`)} 
          style={{ backgroundColor: '#050505' }} 
          className="border border-zinc-900 rounded-xl p-3 flex items-center cursor-pointer hover:border-orange-600/50 transition-all w-full"
        >
          {/* ФИКСИРОВАННЫЙ КОНТЕЙНЕР ДЛЯ КАРТИНКИ */}
          <div className="w-16 h-16 min-w-[64px] rounded-lg overflow-hidden mr-4 shrink-0 bg-zinc-800 relative">
            <img 
              src={item.image_url} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          </div>
          
          {/* ТЕКСТ ЗАГОЛОВКА */}
          <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: '700', margin: 0 }} className="line-clamp-2 leading-snug flex-1">
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
      </div>

      <style jsx>{`
        @keyframes slideDownAd { from { transform: translateY(-100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideUpAd { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </main>
  );
}