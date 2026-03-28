'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [data, setData] = useState<{articles: any[], summary: string}>({ articles: [], summary: '' });
  const [loading, setLoading] = useState(true);
  const [isExtendedSearch, setIsExtendedSearch] = useState(false);

  // Сбрасываем флаг расширенного поиска при изменении запроса в URL
  useEffect(() => {
    setIsExtendedSearch(false);
  }, [query]);

  useEffect(() => {
    if (query) fetchResults(isExtendedSearch);
  }, [query, isExtendedSearch]);

  const fetchResults = async (extended: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query || '')}&extended=${extended}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <Header />
      
      <div className="w-[96%] max-w-[1200px] mx-auto py-8 px-4 flex flex-col items-center">
        {/* TOP BAR */}
        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="text-zinc-500 font-bold text-sm uppercase tracking-[0.2em]">
            Terminal Search / <span className="text-white">{query}</span>
          </h1>
        </div>

        {/* AI SUMMARY BLOCK */}
        {!loading && data.summary && (
          <div className="w-full mb-12 p-10 border border-zinc-800 bg-[#0a0a0a] rounded-2xl relative overflow-hidden text-center flex flex-col items-center">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
             <p className="text-3xl md:text-4xl lg:text-5xl font-bold italic" style={{ color: '#ffffff' }}>
               "{data.summary}"
             </p>
          </div>
        )}

        {/* RESULTS */}
        <div className="w-full grid gap-4">
          {loading ? (
            <div className="py-20 text-center animate-pulse text-zinc-600 font-bold uppercase tracking-widest">
              Scanning...
            </div>
          ) : data.articles.length > 0 ? (
            <>
              {data.articles.map((item: any, idx: number) => (
                <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-stretch w-full bg-[#0a0a0a] border border-zinc-900 hover:border-zinc-700 transition-all rounded-xl overflow-hidden group" style={{ height: '160px', textDecoration: 'none' }}>
                  <div className="w-32 md:w-56 h-full shrink-0 overflow-hidden border-r border-zinc-900 bg-[#111]">
                    <img src={item.image_url || `https://loremflickr.com/400/300/crypto?lock=${idx}`} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-col justify-center flex-grow min-w-0" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#a1a1aa' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US') : 'RECENT'} • MARKET PULSE
                    </div>
                    <h3 className="text-lg md:text-xl font-bold uppercase truncate" style={{ color: '#ffffff' }}>{item.title}</h3>
                    <p className="text-xs md:text-sm line-clamp-2" style={{ color: '#d4d4d8', margin: 0 }}>{item.body}</p>
                  </div>
                </a>
              ))}

              {/* КНОПКА: GLOBAL SEARCH — ОРАНЖЕВЫЙ ЦВЕТ И ЧЕРНЫЕ БУКВЫ */}
{!loading && !isExtendedSearch && (
  <div className="w-full flex justify-center mt-12 mb-20">
    <button 
      onClick={() => setIsExtendedSearch(true)}
      className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95"
      style={{ 
        width: '280px', // Размеры не меняем
        height: '50px',
        // --- ЦВЕТ МЕНЯЕМ ЗДЕСЬ ---
        backgroundColor: '#f97316', // Оранжевый фон (orange-600)
        border: '1px solid #f97316', // Оранжевая рамка
        color: '#000000', // Черные буквы
        // -------------------------
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(249, 115, 22, 0.2)' // Мягкое оранжевое свечение
      }}
    >
      <span 
        className="font-black uppercase tracking-[0.4em] text-[12px]"
        // Убрали инлайн-стиль для цвета текста отсюда, чтобы он брался из родительского button
      >
        Global Search
      </span>
    </button>
  </div>
)}
            </>
          ) : (
            <div className="py-20 text-center border border-dashed border-zinc-800 rounded-xl w-full">
              <p className="text-zinc-600 uppercase text-xs font-bold tracking-widest">No active signals found</p>
              <button onClick={() => setIsExtendedSearch(true)} className="mt-4 text-blue-500 hover:text-white cursor-pointer uppercase text-[10px] font-black tracking-widest">
                Try Global Web Search →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}