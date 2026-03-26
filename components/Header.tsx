'use client';
import React, { useState } from 'react';

// Список монет для поиска (позже можно вынести в отдельный JSON)
const COINS = [
  { name: 'Bitcoin', ticker: 'BTC', synonyms: ['биткоин', 'биток', 'btc'] },
  { name: 'Ethereum', ticker: 'ETH', synonyms: ['эфир', 'эфириум', 'eth'] },
  { name: 'Solana', ticker: 'SOL', synonyms: ['солана', 'сол', 'sol'] },
  { name: 'Cardano', ticker: 'ADA', synonyms: ['кардано', 'ada'] },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Фильтрация монет по вводу
  const filteredCoins = COINS.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.synonyms.some(s => s.includes(searchQuery.toLowerCase()))
  );

  return (
    <header className="w-full bg-black border-b border-zinc-900 sticky top-0 z-[100] h-16 flex items-center justify-center">
      <div className="w-[96%] max-w-[1440px] flex items-center justify-between px-4 gap-6">
        
        {/* ЛОГО И ТЕКСТ (теперь зафиксированы и не исчезают) */}
        <div className="flex items-center gap-3 shrink-0 min-w-[200px]">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-orange-600 flex items-center justify-center shrink-0">
            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white font-black text-xl tracking-tighter uppercase whitespace-nowrap">
            CRYPTO<span className="text-orange-600">FLOW</span>
          </h1>
        </div>

        {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: ПОИСК (с ограничением ширины) */}
        <div className="flex-1 max-w-md relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Поиск крипты..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-600/50 transition-all"
          />
          
          {/* СПИСОК ПОДСКАЗОК */}
          {searchQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[110]">
              <div className="px-4 py-2 text-[10px] text-zinc-500 border-b border-zinc-900 uppercase tracking-widest">
                Результаты
              </div>
              {filteredCoins.length > 0 ? (
                filteredCoins.map(coin => (
                  <div 
                    key={coin.ticker}
                    onClick={() => {
                      setSearchQuery(coin.name);
                      // Тут можно добавить переход на страницу монеты
                    }}
                    className="px-4 py-3 hover:bg-zinc-900 cursor-pointer flex justify-between items-center group transition-colors"
                  >
                    <span className="text-zinc-200 group-hover:text-white">{coin.name}</span>
                    <span className="text-orange-600 font-mono text-xs font-bold">{coin.ticker}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-zinc-600 italic">Ничего не найдено</div>
              )}
            </div>
          )}
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ИКОНКИ (сюда будем добавлять новые) */}
        <div className="flex items-center gap-3 shrink-0 min-w-[40px] justify-end">
          <a href="https://t.me/pulse_news_hub" target="_blank" className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#24A1DE">
              <path d="M11.944 0C5.356 0 0 5.356 0 11.944c0 6.589 5.356 11.944 11.944 11.944 6.589 0 11.944-5.356 11.944-11.944C23.888 5.356 18.533 0 11.944 0zM17.484 8.243l-1.897 8.941c-.143.644-.523.804-1.063.501l-2.892-2.132-1.396 1.343c-.154.154-.284.284-.582.284l.207-2.943 5.357-4.841c.233-.207-.051-.322-.361-.116L8.214 12.247l-2.854-.892c-.62-.194-.632-.62.129-.917l11.161-4.301c.517-.188.969.123.834.106z"/>
            </svg>
          </a>
        </div>
        
      </div>
    </header>
  );
}