'use client';
import { useRouter } from 'next/navigation';

export default function NewsContent({ article, id }: { article: any, id: string }) {
  const router = useRouter();

  // Обработка случая, если новость не найдена
  if (!article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-xl font-bold mb-4">Новость #{id} не найдена</h1>
        <button onClick={() => router.push('/')} className="bg-orange-600 px-4 py-2 rounded-lg font-bold">
          НА ГЛАВНУЮ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-4 pt-6 text-white">
      
      {/* 1. ВЕРХНИЙ РЕКЛАМНЫЙ БЛОК */}
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        height: '90px', 
        backgroundColor: '#111', 
        border: '1px dashed #333', 
        borderRadius: '12px', 
        marginBottom: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: '#888', // Светло-серый, чтобы было видно
        fontSize: '11px', 
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
        Место для баннера 728x90 / Ad space
      </div>

      <div className="max-w-xl w-full bg-[#0a0a0a] border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* КАРТИНКА: Сохранен компактный размер */}
        <div style={{ padding: '20px' }}>
          <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#111' }}>
            <img 
              src={article.imageurl} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.9' }} 
            />
          </div>
        </div>

        <div className="p-6 pt-0 text-center">
          <p style={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
            Market Pulse News AI
          </p>
          
          {/* 2. ЗАГОЛОВОК: Принудительно белый */}
          <h1 style={{ 
            color: '#ffffff', // БЕЛЫЙ ЦВЕТ
            fontSize: '24px', 
            fontWeight: '900', 
            lineHeight: '1.2', 
            marginBottom: '15px' 
          }}>
            {article.title}
          </h1>

          {/* 3. ОПИСАНИЕ: Принудительно светло-серый */}
          <p style={{ 
            color: '#a1a1aa', // СВЕТЛО-СЕРЫЙ ЦВЕТ
            fontSize: '14px', 
            lineHeight: '1.6', 
            marginBottom: '25px',
            textAlign: 'left' // Выравнивание по левому краю для чтения
          }}>
            {article.body?.substring(0, 200)}...
          </p>

          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '16px', 
              backgroundColor: '#ea580c', 
              color: '#ffffff', 
              fontWeight: 'bold', 
              borderRadius: '12px', 
              textDecoration: 'none',
              textTransform: 'uppercase',
              fontSize: '14px'
            }}
          >
            ЧИТАТЬ ОРИГИНАЛ
          </a>
          
          <button 
            onClick={() => router.push('/')}
            style={{ color: '#52525b', fontSize: '11px', marginTop: '20px', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            ← На главную
          </button>
        </div>
      </div>

      {/* 4. НИЖНИЙ РЕКЛАМНЫЙ БЛОК (ВЕРНУЛИ) */}
      <div style={{ 
        marginTop: '30px', 
        width: '100%', 
        maxWidth: '600px', 
        padding: '20px', 
        textAlign: 'center', 
        color: '#444', // Темно-серый, ненавязчивый
        fontSize: '11px',
        borderTop: '1px solid #111'
      }}>
        РЕКЛАМА / ADVERTISING CONTACT @pulse_admin
      </div>
    </div>
  );
}