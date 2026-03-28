'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Header from '@/components/Header';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [data, setData] = useState<{articles: any[], summary: string}>({ articles: [], summary: '' });
  const [loading, setLoading] = useState(true);
  const [isExtendedSearch, setIsExtendedSearch] = useState(false);

  useEffect(() => { setIsExtendedSearch(false); }, [query]);
  useEffect(() => { if (query) fetchResults(isExtendedSearch); }, [query, isExtendedSearch]);

  const fetchResults = async (extended: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query || '')}&extended=${extended}`);
      const result = await res.json();
      setData({
        articles: Array.isArray(result.articles) ? result.articles : [],
        summary: result.summary || ''
      });
    } catch (error) { console.error("Search error:", error); } finally { setLoading(false); }
  };

  return (
    <div className="w-[96%] max-w-[1200px] mx-auto py-8 px-4 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-zinc-500 font-bold text-sm uppercase tracking-[0.2em]">
          Terminal Search / <span className="text-white">{query}</span>
        </h1>
      </div>

      {/* AI SUMMARY BLOCK — ВОЗВРАЩЕНЫ ЦВЕТА */}
      {!loading && data.summary && (
        <div className="w-full mb-12 p-10 border border-zinc-800 bg-[#0a0a0a] rounded-2xl relative overflow-hidden text-center flex flex-col items-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
          <span className="text-[12px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6 opacity-80">AI Market Intelligence Verdict</span>
          <p className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight italic max-w-4xl" style={{ color: '#ffffff' }}>
            "{data.summary}"
          </p>
        </div>
      )}

      {/* RESULTS — ВОЗВРАЩЕНЫ ЦВЕТА КАРТОЧЕК */}
      <div className="w-full grid gap-4">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-zinc-600 font-bold uppercase tracking-widest">Scanning...</div>
        ) : data.articles.length > 0 ? (
          <>
            {data.articles.map((item: any, idx: number) => (
              <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-stretch w-full bg-[#0a0a0a] border border-zinc-900 hover:border-zinc-700 transition-all rounded-xl overflow-hidden group h-[160px]" style={{ textDecoration: 'none' }}>
                <div className="w-32 md:w-56 h-full shrink-0 overflow-hidden border-r border-zinc-900 bg-[#111]">
                  <img src={item.image_url || `https://loremflickr.com/400/300/crypto?lock=${idx}`} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                </div>
                {/* ТЕКСТОВЫЙ КОНТЕНТ С ВОЗВРАЩЕННЫМИ ОТСТУПАМИ (32px) */}
<div 
  className="flex flex-col justify-center flex-grow min-w-0" 
  style={{ paddingLeft: '32px', paddingRight: '32px' }} 
>
  {/* ДАТА */}
  <div 
    className="text-[10px] font-bold uppercase tracking-widest mb-1.5" 
    style={{ color: '#a1a1aa' }}
  >
    {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US') : 'RECENT'} • MARKET PULSE
  </div>
  
  {/* ЗАГОЛОВОК — БЕЛЫЙ (#ffffff) */}
  <h3 
    className="text-lg md:text-xl font-bold uppercase truncate transition-colors group-hover:text-blue-500" 
    style={{ color: '#ffffff' }}
  >
    {item.title}
  </h3>
  
  {/* ОПИСАНИЕ — СЕРЫЙ (#d4d4d8) */}
  <p 
    className="text-xs md:text-sm line-clamp-2" 
    style={{ color: '#d4d4d8', margin: 0 }}
  >
    {item.body}
  </p>
</div>
              </a>
            ))}

            {/* ORANGE GLOBAL SEARCH BUTTON — СОХРАНЕНА */}
            {!isExtendedSearch && (
              <div className="w-full flex justify-center mt-12 mb-20">
                <button 
                  onClick={() => setIsExtendedSearch(true)}
                  className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  style={{ 
                    width: '280px', height: '50px', backgroundColor: '#f97316', 
                    border: '1px solid #f97316', color: '#000000', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900',
                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.2)'
                  }}
                >
                  <span className="font-black uppercase tracking-[0.4em] text-[12px]">Global Search</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-xl w-full">
            <p className="text-zinc-600 uppercase text-xs font-bold tracking-widest">No signals found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <Header />
      <Suspense fallback={<div className="text-center py-20 text-zinc-700 uppercase font-black text-xs">Loading...</div>}>
        <SearchResults />
      </Suspense>
    </main>
  );
}