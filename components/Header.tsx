'use client';
import React, { useState } from 'react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="w-full bg-black border-b border-zinc-900 sticky top-0 z-[100] h-16 flex items-center justify-center">
      <div className="w-[96%] max-w-[1440px] flex items-center justify-between px-4 gap-4">
        
        {/* ЛЕВАЯ ЧАСТЬ: ЛОГОТИП */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
            <img 
              src="/favicon.ico" 
              alt="Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.innerHTML = '<span class="text-white font-black">C</span>';
                }
              }}
            />
          </div>
          
          <h1 className="hidden md:block text-white font-black text-2xl tracking-tighter uppercase whitespace-nowrap">
            CRYPTO<span className="text-orange-600">FLOW</span>
          </h1>
        </div>

        {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: УМНЫЙ ПОИСК */}
        <div className="flex-1 max-w-xl relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Поиск (BTC, Эфир, Solana...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-600/50 focus:ring-1 focus:ring-orange-600/20 transition-all"
          />
          
          {/* ВЫПАДАЮЩИЙ СПИСОК (появится при вводе) */}
          {searchQuery.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[110]">
              <div className="p-2 text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-900">Подходящие монеты</div>
              {/* Сюда позже добавим логику фильтрации */}
              <div className="p-3 hover:bg-zinc-900 cursor-pointer flex justify-between items-center transition-colors">
                <span className="text-white font-medium">Bitcoin</span>
                <span className="text-orange-500 text-xs font-bold font-mono">BTC</span>
              </div>
            </div>
          )}
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ТЕЛЕГРАМ */}
        <div className="flex items-center shrink-0 ml-2">
          <a 
            href="https://t.me/pulse_news_hub" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#24A1DE" className="group-hover:scale-110 transition-transform">
              <path d="M11.944 0C5.356 0 0 5.356 0 11.944c0 6.589 5.356 11.944 11.944 11.944 6.589 0 11.944-5.356 11.944-11.944C23.888 5.356 18.533 0 11.944 0zm5.54 8.243l-1.897 8.941c-.143.644-.523.804-1.063.501l-2.892-2.132-1.396 1.343c-.154.154-.284.284-.582.284l.207-2.943 5.357-4.841c.233-.207-.051-.322-.361-.116L8.214 12.247l-2.854-.892c-.62-.194-.632-.62.129-.917l11.161-4.301c.517-.188.969.123.834.106z"/>
            </svg>
          </a>
        </div>
        
      </div>
    </header>
  );
}