export default function Header({ currentLang, onLangChange }: any) {
  return (
    <header className="flex justify-between items-center p-6 border-b border-zinc-800 bg-black">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold text-black text-sm">C</div>
        <span className="text-xl font-bold tracking-tighter uppercase">ryptoFlow</span>
      </div>

      <button 
        onClick={() => onLangChange(currentLang === 'EN' ? 'RU' : 'EN')}
        className="px-4 py-1.5 border border-zinc-700 rounded-full text-xs font-bold hover:bg-white hover:text-black transition-all"
      >
        {currentLang === 'EN' ? 'Switch to RU' : 'Перейти на EN'}
      </button>
    </header>
  );
}