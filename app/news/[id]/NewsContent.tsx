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
      {/* 1. ШАПКА (В ней уже должна быть кнопка переключения языка, если она есть в компоненте Header) */}
      <Header />
      
      {/* 2. БЕГУЩАЯ СТРОКА С ОТСТУПОМ */}
      <div className="pt-2">
        <PriceTicker />
      </div>

      {/* 3. MARKET PULSE ЗАГОЛОВОК (как на главной) */}
      <div className="flex flex-col items-center pt-8 pb-4 bg-white">
        <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-black">
          MARKET PULSE
        </h2>
        <p className="text-[10px] font-bold uppercase letter spacing tracking-[0.3em] text-zinc-400 mt-2">
          REAL-TIME CRYPTO INTELLIGENCE
        </p>
      </div>

      {/* 4. ОСНОВНОЙ КОНТЕНТ НА СЕРОМ ФОНЕ (чтобы не сливалось) */}
      <div style={{ backgroundColor: '#f4f4f5' }} className="flex flex-col items-center p-4 pt-10">
        
        <div className="relative flex justify-center w-full max-w-[1300px] gap-6">
          
          {/* ЛЕВЫЙ РЕКЛАМНЫЙ БАННЕР */}
          <aside className="hidden xl:flex flex-col w-[180px] shrink-0">
            <div style={{ 
              height: '600px', 
              width: '100%', 
              background: 'linear-gradient(180deg, #ea580c 0%, #facc15 100%)', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              writingMode: 'vertical-rl', 
              fontWeight: '900', 
              color: 'black', 
              fontSize: '24px',
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
                  className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center transition-colors"
                  style={{ backgroundColor: copied ? '#16a34a' : 'rgba(0,0,0,0.6)' }}
                >
                  {copied ? '✅' : '🔗'}
                </button>
              )}

              <div className="p-4">
                <div className="w-full h-[300px] rounded-2xl overflow-hidden bg-zinc-900">
                  <img src={article.imageurl || article.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <div className="px-8 pb-10 pt-4 text-center">
                <h1 className="text-2xl md:text-3xl font-black italic uppercase leading-tight mb-6 tracking-tight">
                  {article.title}
                </h1>

                <p className="text-zinc-400 text-lg leading-relaxed mb-10 text-left">
                  {article.body}
                </p>

                <a 
                  href={article.url || article.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block px-12 py-5 bg-[#ea580c] text-white font-black text-xs rounded-full uppercase tracking-[0.4em] hover:scale-105 transition-transform"
                >
                  Читать оригинал
                </a>
              </div>
            </div>

            {/* ПОХОЖИЕ НОВОСТИ */}
            {related && related.length > 0 && (
              <div className="mt-16">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-[#ea580c] text-left ml-2">
                  Похожие новости
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {related.map((item: any) => (
                    <div 
                      key={item.news_id} 
                      onClick={() => router.push(`/news/${item.news_id}`)}
                      className="bg-[#050505] border border-zinc-900 hover:border-[#ea580c] rounded-2xl p-3 flex items-center cursor-pointer transition-all"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden mr-4 shrink-0">
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm font-bold leading-snug text-zinc-100">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ПРАВЫЙ РЕКЛАМНЫЙ БАННЕР */}
          <aside className="hidden xl:flex flex-col w-[180px] shrink-0">
            <div style={{ 
              height: '600px', 
              width: '100%', 
              background: 'linear-gradient(180deg, #facc15 0%, #ea580c 100%)', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              writingMode: 'vertical-rl', 
              fontWeight: '900', 
              color: 'black', 
              fontSize: '24px',
              boxShadow: '0 20px 40px rgba(234, 88, 12, 0.2)' 
            }}>
              ADVERTISING / REKLAMA
            </div>
          </aside>
        </div>

        {/* КНОПКА НА ГЛАВНУЮ */}
        <div className="mt-16 mb-20">
          <button 
            onClick={() => router.push('/')} 
            className="px-10 py-4 bg-black text-white rounded-full font-black uppercase text-[11px] tracking-[0.2em] border-none hover:bg-zinc-800 transition-colors"
          >
            ← На главную
          </button>
        </div>
      </div>
    </div>
  );
}