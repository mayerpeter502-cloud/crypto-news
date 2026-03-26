'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim().length > 1) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="w-full bg-black border-b border-zinc-900 sticky top-0 z-[100] h-16 flex items-center justify-center">
      <div className="w-[96%] max-w-[1440px] flex items-center justify-between px-4">
        
        {/* ЛЕВАЯ ЧАСТЬ: ЛОГО + ОТСТУП + УЗКИЙ ПОИСК */}
        <div className="flex items-center flex-1">
          {/* ЛОГОТИП */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
              <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-white font-black text-2xl tracking-tighter uppercase whitespace-nowrap">
              CRYPTO<span className="text-orange-600">FLOW</span>
            </h1>
          </div>

          {/* ЭТОТ БЛОК СОЗДАСТ ПУСТОТУ МЕЖДУ ЛОГО И ПОИСКОМ */}
          <div className="w-12 shrink-0"></div>

          {/* ПОИСК: Сделали его еще уже (max-w-[140px]), левый край ушел вправо */}
          <div className="relative w-full max-w-[140px] flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg py-1.5 pl-3 pr-8 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-orange-600/40 transition-all"
            />
            {/* Кнопка лупы (пока слева, как на вашем скрине) */}
            <button 
              onClick={handleSearch}
              className="absolute left-2 text-zinc-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* ТЕЛЕГРАМ (правый край на месте) */}
        <div className="flex items-center shrink-0">
          <a href="https://t.me/pulse_news_hub" target="_blank" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#24A1DE">
              <path d="M11.944 0C5.356 0 0 5.356 0 11.944c0 6.589 5.356 11.944 11.944 11.944 6.589 0 11.944-5.356 11.944-11.944C23.888 5.356 18.533 0 11.944 0zm5.54 8.243l-1.897 8.941c-.143.644-.523.804-1.063.501l-2.892-2.132-1.396 1.343c-.154.154-.284.284-.582.284l.207-2.943 5.357-4.841c.233-.207-.051-.322-.361-.116L8.214 12.247l-2.854-.892c-.62-.194-.632-.62.129-.917l11.161-4.301c.517-.188.969.123.834.106z"/>
            </svg>
          </a>
        </div>
        
      </div>
    </header>
  );
}