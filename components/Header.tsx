'use client';
import React from 'react';

// Добавляем описание типов, чтобы убрать ошибку в layout/page
interface HeaderProps {
  currentLang?: string;
  onLangChange?: (lang: string) => void;
}

export default function Header({ currentLang, onLangChange }: HeaderProps) {
  return (
    <header className="w-full bg-black border-b border-zinc-900 py-4 px-6 flex items-center justify-between sticky top-0 z-[100]">
      <div className="flex items-center gap-3">
        {/* ИКОНКА / ФАВИКОН В ШАПКЕ */}
        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
          <img 
            src="/favicon.ico" 
            alt="Logo" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Если файл еще не подгрузился, покажем букву C
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-black">C</span>';
            }}
          />
        </div>
        
        <h1 className="text-white font-black text-2xl tracking-tighter">
          CRYPTO<span className="text-orange-600">FLOW</span>
        </h1>
      </div>

      {/* Кнопка переключения языка (если она была в планах) */}
      {onLangChange && (
        <button 
          onClick={() => onLangChange(currentLang === 'EN' ? 'RU' : 'EN')}
          className="text-[10px] font-bold bg-zinc-900 text-zinc-400 px-3 py-1 rounded border border-zinc-800 hover:text-white transition-colors"
        >
          {currentLang === 'EN' ? 'SWITCH TO RU' : 'НА АНГЛИЙСКИЙ'}
        </button>
      )}
    </header>
  );
}