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
        <button onClick={() => router.push('/')} className="bg-orange-600 px-8 py-3 rounded-full font-black uppercase text-sm">
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-4 pt-6 text-white font-sans">
      
      {/* ВЕРХНИЙ БАННЕР */}
      <div className="w-full max-w-[600px] h-[90px] bg-[#0c0c0c] border border-dashed border-zinc-800 rounded-xl mb-6 flex items-center justify-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">
        Место для баннера 728x90
      </div>

      {/* КАРТОЧКА НОВОСТИ */}
      <div className="max-w-xl w-full bg-[#050505] border border-zinc-900 rounded-[24px] overflow-hidden shadow-2xl relative">
        
        {/* КНОПКА ПОДЕЛИТЬСЯ */}
        {mounted && (
          <button 
            onClick={handleCopy}
            className={`absolute top-5 right-5 z-50 w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl ${
              copied 
              ? 'bg-green-600 border-green-500 text-white' 
              : 'bg-black/70 border-white/20 text-white hover:bg-orange-600 hover:border-orange-600'
            }`}
          >
            {copied ? '✅' : '🔗'}
          </button>
        )}

        <div className="p-4">
          <div className="w-full h-[220px] rounded-[18px] overflow-hidden bg-zinc-900">
            <img src={article.imageurl} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
        
        <div className="p-8 pt-2 text-center">
          {/* ЗАГОЛОВОК: ЧИСТО БЕЛЫЙ */}
          <h1 className="text-white text-2xl font-black leading-tight mb-6 tracking-tight">
            {article.title}
          </h1>

          {/* ОПИСАНИЕ: БЕЛО-СЕРЫЙ (zinc-400) */}
          <p className="text-zinc-400 text-sm leading-relaxed mb-10 text-left opacity-90">
            {article.body?.substring(0, 300)}...
          </p>

          {/* КНОПКА ОРИГИНАЛА: ТЕПЕРЬ 11px И tracking-[0.4em] КАК НАЗАД */}
          <div className="flex justify-center mb-4">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center px-12 py-4 bg-orange-600 text-white font-black text-[11px] rounded-full no-underline uppercase tracking-[0.4em] hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-orange-600/20"
            >
              Читать оригинал
            </a>
          </div>
        </div>
      </div>

      {/* КНОПКА НАЗАД */}
      <div className="w-full max-w-xl flex flex-col items-center mt-8">
        <button 
          onClick={() => router.push('/')} 
          className="mb-8 text-white text-[11px] font-black uppercase tracking-[0.4em] transition-all cursor-pointer py-2 hover:text-orange-500"
        >
          ← Вернуться на главную
        </button>

        {/* НИЖНЯЯ ЛИНИЯ И РЕКЛАМА */}
        <div className="w-full pt-8 border-t border-zinc-900 text-center">
          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.25em]">
            МЕСТО ДЛЯ ВАШЕЙ РЕКЛАМЫ / CONTACT @pulse_admin
          </p>
        </div>
      </div>
    </div>
  );
}