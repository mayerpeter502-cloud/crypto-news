'use client';
import React from 'react';

export default function Header() {
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
              // Если файл еще не подгрузился или отсутствует, покажем букву C
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<span class="text-white font-black">C</span>';
              }
            }}
          />
        </div>
        
        <h1 className="text-white font-black text-2xl tracking-tighter uppercase">
          CRYPTO<span className="text-orange-600">FLOW</span>
        </h1>
      </div>

      {/* Правая часть шапки теперь пустая, так как переключатель языков удален */}
      <div className="flex items-center">
        {/* Здесь можно разместить другие элементы в будущем, например, иконку профиля или поиска */}
      </div>
    </header>
  );
}