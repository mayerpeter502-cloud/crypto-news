'use client';
import { useRouter } from 'next/navigation';

export default function NewsContent({ article, id }: { article: any, id: string }) {
  const router = useRouter();

  // Если статья не пришла с сервера
  if (!article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 text-center">
        <h1 className="text-xl font-bold mb-4">Новость #{id} не найдена</h1>
        <p className="text-zinc-500 mb-6">Сервер не смог получить данные. Попробуйте обновить страницу.</p>
        <button onClick={() => router.push('/')} className="text-orange-600 font-bold border border-orange-600 px-4 py-2 rounded-lg">
          ВЕРНУТЬСЯ НА ГЛАВНУЮ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-4 pt-6 text-white">
      
      {/* РЕКЛАМНЫЙ БЛОК */}
      <div style={{ width: '100%', maxWidth: '600px', height: '90px', backgroundColor: '#111', border: '1px dashed #333', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>
        Место для баннера 728x90 / Ad space
      </div>

      <div className="max-w-xl w-full bg-[#0a0a0a] border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
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
          
          <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '900', lineHeight: '1.3', marginBottom: '20px' }}>
            {article.title}
          </h1>

          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'block', width: '100%', padding: '16px', backgroundColor: '#ea580c', color: '#ffffff', fontWeight: 'bold', borderRadius: '12px', textDecoration: 'none', textTransform: 'uppercase' }}
          >
            ЧИТАТЬ ОРИГИНАЛ
          </a>
          
          <button 
            onClick={() => router.push('/')}
            style={{ color: '#3f3f46', fontSize: '11px', marginTop: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← На главную
          </button>
        </div>
      </div>
    </div>
  );
}