'use client';
import React from 'react';

export default function Header() {
  return (
    <header className="w-full bg-black border-b border-zinc-900 sticky top-0 z-[100] h-16 flex items-center justify-center">
      {/* 1. justify-center на родителе центрирует этот блок.
        2. max-w-[95%] не дает блоку касаться краев экрана физически.
        3. px-4 создает дополнительный внутренний зазор.
      */}
      <div className="w-[96%] max-w-[1440px] flex items-center justify-between px-4">
        
        <div className="flex items-center gap-4">
          {/* ЛОГОТИП */}
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.3)] shrink-0">
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
          
          <h1 className="text-white font-black text-2xl tracking-tighter uppercase whitespace-nowrap">
            CRYPTO<span className="text-orange-600">FLOW</span>
          </h1>
        </div>

        {/* ТЕЛЕГРАМ */}
        <div className="flex items-center shrink-0">
          <a 
            href="https://t.me/pulse_news_hub" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 group"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="#24A1DE" 
              className="group-hover:scale-110 transition-transform"
            >
              <path d="M11.944 0C5.356 0 0 5.356 0 11.944c0 6.589 5.356 11.944 11.944 11.944 6.589 0 11.944-5.356 11.944-11.944C23.888 5.356 18.533 0 11.944 0zm5.54 8.243l-1.897 8.941c-.143.644-.523.804-1.063.501l-2.892-2.132-1.396 1.343c-.154.154-.284.284-.582.284l.207-2.943 5.357-4.841c.233-.207-.051-.322-.361-.116L8.214 12.247l-2.854-.892c-.62-.194-.632-.62.129-.917l11.161-4.301c.517-.188.969.123.834.106z"/>
            </svg>
          </a>
        </div>
        
      </div>
    </header>
  );
}