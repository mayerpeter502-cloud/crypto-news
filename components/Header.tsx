'use client';
import React from 'react';

export default function Header() {
  return (
    <header className="w-full bg-black border-b border-zinc-900 py-4 px-6 flex items-center justify-between sticky top-0 z-[100]">
      <div className="flex items-center gap-3">
        {/* Иконка в шапке */}
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.4)]">
          <span className="text-white font-black text-xl">C</span> 
          {/* Или замените на <img src="/favicon.ico" className="w-6 h-6" alt="" /> */}
        </div>
        
        <h1 className="text-white font-black text-2xl tracking-tighter">
          CRYPTO<span className="text-orange-600">FLOW</span>
        </h1>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.3em] animate-pulse">
          Live Market Intelligence
        </span>
      </div>
    </header>
  );
}