'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Список монет для подсказок
const COINS = [
  { name: 'Bitcoin', ticker: 'BTC', synonyms: ['биткоин', 'биток', 'btc'] },
  { name: 'Ethereum', ticker: 'ETH', synonyms: ['эфир', 'эфириум', 'eth'] },
  { name: 'Solana', ticker: 'SOL', synonyms: ['солана', 'сол', 'sol'] },
  { name: 'Polkadot', ticker: 'DOT', synonyms: ['полькадот', 'dot'] },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter(); // Для перехода на страницу поиска
  
  // Логика фильтрации для подсказок
  const filteredCoins = COINS.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.synonyms.some(s => s.includes(searchQuery.toLowerCase()))
  );

  // Функция для выполнения поиска по сайту
  const handleSearch = () => {
    if (searchQuery.trim().length > 1) {
      // Переходим на страницу поиска с запросом (нужно создать app/search/page.tsx)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      // Закрываем подсказки
      setSearchQuery('');
    }
  };

  return (
    <header className="w-full bg-black border-b border-zinc-900 sticky top-0 z-[100] h-16 flex items-center justify-center">
      <div className="w-[96%] max-w-[1440px] flex items-center justify-between px-4 gap-4">
        
        {/* ЛОГО И ТЕКСТ (без изменений) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-orange-600 flex items-center justify-center shrink-0">
            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white font-black text-xl tracking-tighter uppercase whitespace-nowrap">
            CRYPTO<span className="text-orange-600">FLOW</span>
          </h1>
        </div>

        {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: КОМПАКТНЫЙ ПОИСК */}
        <div className="flex-1 relative group flex items-center min-w-[180px] justify-end">
          {/* Контейнер для поля ввода и кнопки */}
          <div className="relative flex items-center w-full max-w-[180px]">
            <input
              type="text"
              placeholder="BTC, Эфир..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // Нажатие Enter вызывает поиск
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              // p-1.5 pr-8 делает поле компактным по высоте
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full p-1.5 pr-8 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-600/50 transition-all"
            />
            
            {/* КНОПКА ПОИСКА (ЛУПА) В КОНЦЕ СТРОКИ */}
            <button 
              onClick={handleSearch}
              className="absolute right-2 text-zinc-600 group-focus-within:text-orange-500 hover:text-orange-400 transition-colors"
              title="Искать по сайту"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* СПИСОК ПОДСКАЗОК (выводится поверх контента) */}
          {searchQuery.length > 1 && (
            <div className="absolute top-full right-0 mt-2 w-full max-w-[200px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[110]">
              {filteredCoins.length > 0 ? (
                filteredCoins.map(coin => (
                  <div 
                    key={coin.ticker}
                    onClick={() => {
                      setSearchQuery(coin.name);
                      // Переход на страницу конкретной монеты (нужно создать)
                    }}
                    className="px-4 py-3 hover:bg-zinc-900 cursor-pointer flex justify-between items-center group transition-colors border-b border-zinc-900 last:border-none"
                  >
                    <span className="text-zinc-200 text-xs group-hover:text-white">{coin.name}</span>
                    <span className="text-orange-600 font-mono text-xs font-bold">{coin.ticker}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-zinc-600 italic">Монета не найдена</div>
              )}
            </div>
          )}
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ИКОНКА ТЕЛЕГРАМ */}
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