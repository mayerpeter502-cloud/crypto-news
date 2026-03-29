'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Header from '@/components/Header';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [data, setData] = useState<{ articles: any[], summary: string }>({ articles: [], summary: '' });
  const [loading, setLoading] = useState(true);
  const [isExtendedSearch, setIsExtendedSearch] = useState(false);

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
      setData({
        articles: Array.isArray(result.articles) ? result.articles : [],
        summary: result.summary || ''
      });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Terminal Search / {query}</h1>

        {/* AI SUMMARY BLOCK */}
        {!loading && data.summary && (
          <div className="w-full mb-12 p-10 border border-zinc-800 bg-[#0a0a0a] rounded-2xl relative overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
            <span className="text-[12px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6 opacity-80">
              AI Market Intelligence Verdict
            </span>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight italic max-w-4xl" style={{ color: '#ffffff' }}>
              "{data.summary}"
            </p>
          </div>
        )}

        {/* RESULTS GRID */}
        <div className="w-full grid gap-4">
          {loading ? (
            <div className="py-20 text-center animate-pulse text-zinc-600 font-bold uppercase tracking-widest">
              Scanning...
            </div>
          ) : (
            <>
              {data.articles.length > 0 ? (
                data.articles.map((item: any, idx: number) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row items-stretch w-full bg-[#0a0a0a] border border-zinc-900 hover:border-zinc-700 transition-colors rounded-xl overflow-hidden h-[160px]"
                    style={{ textDecoration: 'none' }}
                  >
                    {/* ИЗОБРАЖЕНИЕ */}
                    <div className="w-32 md:w-56 h-full shrink-0 overflow-hidden border-r border-zinc-900 bg-[#111]">
                      <img
                        src={item.image_url || `https://loremflickr.com/400/300/crypto?lock=${idx}`}
                        alt=""
                        className="w-full h-full object-cover opacity-70 transition-opacity hover:opacity-100"
                      />
                    </div>

                    {/* КОНТЕНТ: ОТСТУП 12px ОТ КАРТИНКИ */}
                    <div className="flex flex-col justify-center flex-grow min-w-0" style={{ paddingLeft: '12px', paddingRight: '32px' }}>
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#a1a1aa' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US') : 'RECENT'} • MARKET PULSE
                      </div>

                      <h3 className="text-lg md:text-xl font-bold uppercase transition-colors hover:text-blue-500 line-clamp-2 leading-tight mb-1" style={{ color: '#ffffff' }}>
                        {item.title}
                      </h3>

                      {/* ОПИСАНИЕ СТАТЬИ */}
                      <p className="text-[11px] line-clamp-3 leading-normal" style={{ color: '#d4d4d8', margin: 0 }}>
                        {item.body || item.description || "Loading intelligence data..."}
                      </p>
                    </div>
                  </a>
                ))
              ) : (
                <div className="py-20 text-center border border-dashed border-zinc-800 rounded-xl w-full">
                  <p className="text-zinc-600 uppercase text-xs font-bold tracking-widest">
                    No active signals detected in this sector
                  </p>
                </div>
              )}

              {/* КНОПКА GLOBAL SEARCH: ВЫСОТА 38px + ОТСТУПЫ */}
              <div className="w-full flex justify-center mt-12 mb-20 py-8">
                <button
                  onClick={() => {
                    setIsExtendedSearch(true);
                    fetchResults(true);
                  }}
                  className="will-change-transform transition-transform duration-200 hover:scale-[1.03] active:scale-95 flex items-center justify-center"
                  style={{
                    width: '280px',
                    height: '38px', // Подтвержденная высота без бага
                    backgroundColor: '#f97316',
                    border: 'none',
                    color: '#000000',
                    borderRadius: '8px',
                    fontWeight: '900',
                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.2)'
                  }}
                >
                  <span className="font-black uppercase tracking-[0.4em] text-[12px]">Global Search</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}