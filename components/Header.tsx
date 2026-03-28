'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Импортируем Link для навигации

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  const handleSearch = () => {
    if (searchQuery.trim().length > 1) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="w-full bg-black border-b border-zinc-900 sticky top-0 z-[100] h-16 flex items-center justify-center">
      <div className="w-[96%] max-w-[1440px] h-full flex items-center justify-between px-4 relative">
        
        {/* LOGO */}
        <Link 
          href="/" 
          className="flex items-center gap-4 shrink-0 z-20 bg-black pr-4 group transition-all"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-white font-black text-2xl tracking-tighter uppercase whitespace-nowrap">
            CRYPTO<span className="text-orange-600">FLOW</span>
          </h1>
        </Link>

        {/* ПРАВАЯ ЧАСТЬ - Стабильный контейнер */}
        <div className="flex items-center justify-end relative h-10 w-full max-w-[400px]">
          
          {/* ИКОНКА ТЕЛЕГРАМА */}
<div 
  className={`transition-all duration-300 ${isSearchOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
  style={{ 
    zIndex: 10,
    marginRight: '12px', // Увеличили отступ до 32px для теста (потом можно уменьшить)
    display: isSearchOpen ? 'none' : 'flex' // Полностью убираем из потока при поиске
  }}
> 
  <a 
    href="https://t.me/pulse_news_hub" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="flex items-center justify-center w-6 h-6 hover:scale-110 transition-transform cursor-pointer"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#24A1DE">
      <path d="M11.944 0C5.356 0 0 5.356 0 11.944c0 6.589 5.356 11.944 11.944 11.944 6.589 0 11.944-5.356 11.944-11.944C23.888 5.356 18.533 0 11.944 0zm5.54 8.243l-1.897 8.941c-.143.644-.523.804-1.063.501l-2.892-2.132-1.396 1.343c-.154.154-.284.284-.582.284l.207-2.943 5.357-4.841c.233-.207-.051-.322-.361-.116L8.214 12.247l-2.854-.892c-.62-.194-.632-.62.129-.917l11.161-4.301c.517-.188.969.123.834.106z"/>
    </svg>
  </a>
</div>

          {/* ПОЛЕ ПОИСКА (Вплотную к лупе) */}
<div 
  className={`absolute flex items-center transition-all duration-300 ease-in-out ${
    isSearchOpen ? 'w-[calc(100%-36px)] opacity-100' : 'w-0 opacity-0 pointer-events-none'
  }`}
  style={{ 
    zIndex: 50, 
    right: '32px', // Сдвинули еще на 6px вправо (было 32px)
    left: '0' 
  }}
>
  <input
    ref={inputRef}
    type="text"
    placeholder="What are you searching for?"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
    // h-8 (32px) для соответствия высоте лупы
    className="w-full bg-black border-b border-l border-t border-orange-600 border-r-0 text-sm text-white placeholder-zinc-700 px-3 outline-none h-[28px] rounded-l-lg"
  />
</div>

          {/* КНОПКА ЛУПА / КРЕСТИК (Якорь) - Вернул КРУГЛУЮ форму */}
         <button  
  onClick={() => isSearchOpen ? (searchQuery ? handleSearch() : setIsSearchOpen(false)) : setIsSearchOpen(true)}
  // Добавлен класс cursor-pointer для появления "руки" при наведении
  className="flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all z-[60] shrink-0 h-8 cursor-pointer"
  style={{ width: '32px', height: '32px' }}
>
  {isSearchOpen ? (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )}
</button>
        </div>
        
      </div>
    </header>
  );
}