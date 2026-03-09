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

  if (!article) return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* 1. ШАПКА И БЕГУЩАЯ СТРОКА */}
      <Header />
      <div className="bg-black">
        <PriceTicker />
      </div>

      {/* 2. БЕЛЫЙ БЛОК MARKET PULSE (КАК НА ГЛАВНОЙ) */}
      <div className="bg-white py-12 flex flex-col items-center justify-center border-b border-zinc-200">
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-black leading-none">
          MARKET PULSE
        </h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="h-[1px] w-12 bg-zinc-300"></div>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-zinc-500">
            Real-time Crypto Intelligence
          </p>
          <div className="h-[1px] w-12 bg-zinc-300"></div>
        </div>
      </div>

      {/* 3. КОНТЕНТНАЯ ОБЛАСТЬ НА СЕРОМ ФОНЕ */}
      <div style={{ backgroundColor: '#f4f4f5' }} className="flex flex-col items-center p-4 pt-12">
        
        <div className="relative flex justify-center w-full max-w-[1300px] gap-8">
          
          {/* ЛЕВЫЙ ЯРКИЙ БАННЕР */}
          <aside className="hidden xl:flex flex-col w-[160px] shrink-0">
            <div style={{ 
              height: '600px', 
              width: '100%', 
              background: 'linear-gradient(180deg, #ea580c 0%, #facc15 100%)', 
              borderRadius: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              writingMode: 'vertical-rl', 
              fontWeight: '900', 
              color: 'black', 
              fontSize: '22px',
              boxShadow: '0 20px 40px rgba(234, 88, 12, 0.2)' 
            }}>
              ADVERTISING / REKLAMA
            </div>
          </aside>

          {/* КАРТОЧКА НОВОСТИ */}
          <div className="w-full max-w-[680px]">
            <div style={{ backgroundColor: '#050505', border: '1px solid #18181b', borderRadius: '32px', overflow: 'hidden', position: 'relative', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.4)' }}>
              
              {mounted && (
                <button 
                  onClick={handleCopy}
                  className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-all hover:bg-white/10"
                  style={{ backgroundColor: copied ? '#16a34a' : 'rgba(0,0,0,0.6)' }}
                >
                  {copied ? '✅' : '🔗'}
                </button>
              )}

              <div className="p-4">
                <div className="w-full h-[320px] rounded-[20px] overflow-hidden bg-zinc-900">
                  <img src={article.imageurl || article.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <div className="px-8 pb-12 pt-4 text-center">
                <h1 className="text-2xl md:text-4xl font-black italic uppercase leading-tight mb-8 tracking-tighter">
                  {article.title}
                </h1>

                <p className="text-zinc-400 text-lg leading-relaxed mb-12 text-left border-l-2 border-[#ea580c] pl-6">
                  {article.body}
                </p>

                <a 
                  href={article.url || article.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block px-14 py-5 bg-[#ea580c] text-white font-black text-xs rounded-full uppercase tracking-[0.5em] hover:scale-105 transition-transform shadow-lg shadow-orange-900/20"
                >
                  Читать оригинал
                </a>
              </div>
            </div>

            {/* ПОХОЖИЕ НОВОСТИ */}
            {related && related.length > 0 && (
              <div className="mt-16">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-[#ea580c] text-left ml-2">
                  Похожие новости
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {related.map((item: any) => (
                    <div 
                      key={item.news_id} 
                      onClick={() => router.push(`/news/${item.news_id}`)}
                      className="bg-[#050505] border border-zinc-900 hover:border-[#ea580c] rounded-2xl p-4 flex items-center cursor-pointer transition-all group"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden mr-5 shrink-0">
                        <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-base font-bold leading-tight text-zinc-100">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ПРАВЫЙ ЯРКИЙ БАННЕР */}
          <aside className="hidden xl:flex flex-col w-[160px] shrink-0">
            <div style={{ 
              height: '600px', 
              width: '100%', 
              background: 'linear-gradient(180deg, #facc15 0%, #ea580c 100%)', 
              borderRadius: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              writingMode: 'vertical-rl', 
              fontWeight: '900', 
              color: 'black', 
              fontSize: '22px',
              boxShadow: '0 20px 40px rgba(234, 88, 12, 0.2)' 
            }}>
              ADVERTISING / REKLAMA
            </div>
          </aside>
        </div>

        {/* КНОПКА НАЗАД (ЧЕРНАЯ НА СЕРОМ) */}
        <div className="mt-20 mb-24">
          <button 
            onClick={() => router.push('/')} 
            className="px-12 py-5 bg-black text-white rounded-full font-black uppercase text-[11px] tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl"
          >
            ← На главную
          </button>
        </div>
      </div>
    </div>
  );
}