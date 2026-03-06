'use client';
import { useRouter } from 'next/navigation';

export default function NewsContent({ article, id }: { article: any, id: string }) {
  const router = useRouter();

  if (!article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-xl font-bold mb-4">Новость #{id} не найдена</h1>
        <p className="text-zinc-500 mb-6">Попробуйте вернуться на главную и открыть новость заново.</p>
        <button onClick={() => router.push('/')} className="bg-orange-600 px-6 py-2 rounded-lg font-bold">
          НА ГЛАВНУЮ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-4 pt-6 text-white">
      
      {/* ВЕРХНИЙ РЕКЛАМНЫЙ БЛОК */}
      <div style={{ width: '100%', maxWidth: '600px', height: '90px', backgroundColor: '#111', border: '1px dashed #333', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>
        Место для баннера 728x90
      </div>

      <div className="max-w-xl w-full bg-[#0a0a0a] border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        <div style={{ padding: '20px' }}>
          <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
            <img src={article.imageurl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        <div className="p-6 pt-0 text-center">
          
          {/* ИСПРАВЛЕН ЦВЕТ ЗАГОЛОВКА: ТЕПЕРЬ БЕЛЫЙ */}
          <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '900', lineHeight: '1.2', marginBottom: '20px' }}>
            {article.title}
          </h1>

          {/* ДОБАВЛЕНО ОПИСАНИЕ С ВИДИМЫМ ЦВЕТОМ */}
          <p style={{ color: '#d4d4d8', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px', textAlign: 'left' }}>
            {article.body?.substring(0, 200)}...
          </p>

          <a href={article.url} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-orange-600 text-white font-bold rounded-xl no-underline uppercase">
            Читать оригинал
          </a>
          
          <button onClick={() => router.push('/')} className="mt-6 text-zinc-600 text-xs uppercase cursor-pointer bg-transparent border-none">
            ← Назад
          </button>
        </div>
      </div>

      {/* НИЖНИЙ РЕКЛАМНЫЙ БЛОК (ДОБАВЛЕН) */}
      <div style={{ 
        marginTop: '30px', 
        width: '100%', 
        maxWidth: '600px', 
        padding: '20px', 
        textAlign: 'center', 
        color: '#444', 
        fontSize: '11px', 
        borderTop: '1px solid #111' 
      }}>
        МЕСТО ДЛЯ ВАШЕЙ РЕКЛАМЫ / CONTACT @pulse_admin
      </div>
    </div>
  );
}