// components/NewsCard.tsx
'use client';
import { useState, useEffect } from 'react';
import { translateSingleText } from '@/lib/getNews';

export default function NewsCard(props: any) {
  const [displayTitle, setDisplayTitle] = useState(props.title);
  const [displayDesc, setDisplayDesc] = useState(props.description);
  const [displayImage, setDisplayImage] = useState(props.image);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') setIsAdmin(true);

    // Умный подбор картинки (заглушка, если оригинал недоступен)
    let finalImg = props.image;
    if (finalImg.includes('investing.com') || finalImg.includes('cryptocompare') || !finalImg) {
      const keywords = ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'trading', 'finance'];
      const foundKeyword = keywords.find(word => props.title.toLowerCase().includes(word)) || 'cryptocurrency';
      finalImg = `https://loremflickr.com/400/300/${foundKeyword}?lock=${props.id}`;
    }
    setDisplayImage(finalImg);

    // Перевод на русский язык
    if (props.currentLang === 'RU') {
      const performTranslation = async () => {
        const t = await translateSingleText(props.title);
        const d = await translateSingleText(props.description);
        setDisplayTitle(t || props.title);
        setDisplayDesc(d || props.description);
      };
      performTranslation();
    }
  }, [props.currentLang, props.title, props.description, props.image, props.id]);

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Просто перенаправляем в канал, так как бот теперь постит сам
    window.open('https://t.me/pulse_news_hub', '_blank');
  };

  return (

      <a 
        href={props.url} target="_blank" rel="noopener noreferrer"
        className="flex flex-row items-stretch w-full bg-[#0a0a0a] border border-zinc-900 hover:border-zinc-700 transition-all rounded-xl overflow-hidden shadow-lg"
        style={{ textDecoration: 'none', height: '160px' }}
      >
        <div className="w-32 md:w-56 h-full shrink-0 overflow-hidden border-r border-zinc-900 bg-[#111]">
          <img 
            src={displayImage} 
            alt="" 
            className="w-full h-full object-cover opacity-70 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105" 
            style={{ minHeight: '160px', maxHeight: '160px' }}
          />
        </div>

        <div className="p-4 md:p-6 flex flex-col justify-center flex-grow min-w-0 pr-24">
          <div className="text-[10px] md:text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
            {props.date}
          </div>
          <h3 className="font-bold text-sm md:text-xl leading-tight mb-1 line-clamp-2" style={{ color: '#ffffff', margin: 0 }}>
            {displayTitle}
          </h3>
          <p className="text-[11px] md:text-sm leading-relaxed line-clamp-2" style={{ color: '#a1a1aa', margin: 0 }}>
            {displayDesc}
          </p>
        </div>
      </a>
  );
}