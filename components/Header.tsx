'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const COINS = [
  { name: 'Bitcoin', ticker: 'BTC', synonyms: ['биткоин', 'btc'] },
  { name: 'Ethereum', ticker: 'ETH', synonyms: ['эфир', 'eth'] },
  { name: 'Solana', ticker: 'SOL', synonyms: ['солана', 'sol'] },
  { name: 'Polkadot', ticker: 'DOT', synonyms: ['dot'] },
  { name: 'Cardano', ticker: 'ADA', synonyms: ['ada'] },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  const filteredCoins = COINS.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.synonyms.some(s => s.includes(searchQuery.toLowerCase()))
  );

  const handleSearch = () => {
    if (searchQuery.trim().length > 1) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="w-full bg-black border-b border-zinc-900 sticky top-0 z-[100] h-14 flex items-center justify-center">
      <div className="w-[98%] max-w-[1440px] flex items-center justify-between px-2 gap-4">
        
        {/* ЛЕВАЯ ЧАСТЬ: ЛОГО + ПОИСК */}
        <div className="flex items-center gap-6 flex-1">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-7 h-7 rounded bg-orange-600 flex items-center justify-center overflow-hidden">
              <img src="/favicon.ico" alt="L" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-white font-black text-lg tracking-tighter uppercase leading-none">
              CRYPTO<span className="text-orange-600">FLOW</span>
            </h1>
          </div>

          {/* СТРОКА ПОИСКА: ТЕПЕРЬ СЛЕВА И ШИРЕ */}
          <div className="relative w-full max-w-[320px] group">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg py-1.5 pl-3 pr-10 text-sm text-white focus:outline-none focus:border-orange-600/40 transition-all"
            />
            {/* КНОПКА ЛУПА СПРАВА ВНУТРИ СТРОКИ */}
            <button 
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* ПОДСКАЗКИ */}
            {searchQuery.length > 1 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl z-[110] overflow-hidden">
                {filteredCoins.length > 0 ? (
                  filteredCoins.map(coin => (
                    <div 
                      key={coin.ticker}
                      onClick={() => { setSearchQuery(coin.name); handleSearch(); }}
                      className="px-3 py-2 hover:bg-zinc-900 cursor-pointer flex justify-between items-center border-b border-zinc-900 last:border-none"
                    >
                      <span className="text-zinc-300 text-xs">{coin.name}</span>
                      <span className="text-orange-600 font-mono text-[10px] font-bold">{coin.ticker}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-zinc-600 italic">No assets found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ТЕЛЕГРАМ */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="https://t.me/pulse_news_hub" target="_blank" className="p-1.5 rounded-full hover:bg-zinc-900 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#24A1DE">
              <path d="M11.944 0C5.356 0 0 5.356 0 11.944c0 6.589 5.356 11.944 11.944 11.944 6.589 0 11.944-5.356 11.944-11.944C23.888 5.356 18.533 0 11.944 0zM17.484 8.243l-1.897 8.941c-.143.644-.523.804-1.063.501l-2.892-2.132-1.396 1.343c-.154.154-.284.284-.582.284l.207-2.943 5.357-4.841c.233-.207-.051-.322-.361-.116L8.214 12.247l-2.854-.892c-.62-.194-.632-.62.129-.917l11.161-4.301c.517-.188.969.123.834.106z"/>
            </svg>
          </a>
        </div>
        
      </div>
    </header>
  );
}