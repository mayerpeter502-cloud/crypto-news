'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Автофокус на инпут при открытии
  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = () => {
    if (searchQuery.trim().length > 1) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="w-full bg-black border-b border-zinc-900 sticky top-0 z-[100] h-16 flex items-center justify-center">
      <div className="w-[96%] max-w-[1440px] h-full flex items-center justify-between px-4 relative">
        
        {/* LOGO AREA */}
        <div className="flex items-center gap-4 shrink-0 z-10">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white font-black text-2xl tracking-tighter uppercase whitespace-nowrap">
            CRYPTO<span className="text-orange-600">FLOW</span>
          </h1>
        </div>

        {/* ПРАВАЯ ЧАСТЬ И КОНТЕЙНЕР ПОИСКА (КАК НА РЕФЕРЕНСЕ) */}
        <div className="flex items-center justify-end relative h-full flex-1 ml-4 gap-3">
          
          {/* 1. БЛОК TELEGRAM (Скрывается, когда поиск открыт) */}
          <div 
            className="shrink-0 transition-all duration-300 ease-in-out"
            style={{ 
              opacity: isSearchOpen ? 0 : 1,
              pointerEvents: isSearchOpen ? 'none' : 'auto',
              // !IMPORTANT ИНЛАЙН-РАЗМЕР 24px
              width: isSearchOpen ? '0' : '24px !important',
              height: isSearchOpen ? '0' : '24px !important'
            }}
          > 
            <a href="https://t.me/pulse_news_hub" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-all group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#24A1DE"><path d="M11.944 0C5.356 0 0 5.356 0 11.944c0 6.589 5.356 11.944 11.944 11.944 6.589 0 11.944-5.356 11.944-11.944C23.888 5.356 18.533 0 11.944 0zm5.54 8.243l-1.897 8.941c-.143.644-.523.804-1.063.501l-2.892-2.132-1.396 1.343c-.154.154-.284.284-.582.284l.207-2.943 5.357-4.841c.233-.207-.051-.322-.361-.116L8.214 12.247l-2.854-.892c-.62-.194-.632-.62.129-.917l11.161-4.301c.517-.188.969.123.834.106z"/></svg>
            </a>
          </div>

          {/* 2. КОНТЕЙНЕР ВЫЕЗЖАЮЩЕГО ИНПУТА (НАШИ ДАННЫЕ В СТИЛЕ РЕФЕРЕНСА) */}
          <div className="flex-1 flex justify-end relative h-full">
            <input
              ref={inputRef}
              type="text"
              placeholder="What are you searching for?" // Текст как на референсе
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onBlur={() => !searchQuery && closeSearch()} // Автозакрытие если пустое
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-transparent border-b-2 border-orange-600/50 py-1.5 text-sm text-white placeholder-zinc-600 transition-all duration-300 ease-in-out outline-none focus:border-orange-500 ${
                isSearchOpen 
                  ? 'opacity-100 w-full pl-0 pr-10' // Занимает всё место, оставляя место для крестика
                  : 'opacity-0 w-0 pointer-events-none'
              }`}
              style={{ maxHeight: '24px' }} // Высота как у лого
            />
          </div>

          {/* 3. КНОПКА-ТРИГГЕР (ЛУПА ИЛИ КРЕСТИК) */}
          <div className="shrink-0 relative z-20">
            <button 
              onClick={() => isSearchOpen ? closeSearch() : setIsSearchOpen(true)}
              title={isSearchOpen ? 'Close Search' : 'Open Search'}
              className="flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
              style={{ width: '24px !important', height: '24px !important' }} // Гарантированный размер
            >
              {/* ЛУПА (Когда закрыто) */}
              <svg 
                className={`w-4 h-4 text-white/70 group-hover:text-orange-500 transition-all ${isSearchOpen ? 'opacity-0 scale-50 absolute' : 'opacity-100 scale-100 relative'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* КРЕСТИК (Когда открыто - КАК НА РЕФЕРЕНСЕ) */}
              <svg 
                className={`w-4 h-4 text-white/90 transition-all ${isSearchOpen ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-50 absolute'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

        </div>
        
      </div>
    </header>
  );
}