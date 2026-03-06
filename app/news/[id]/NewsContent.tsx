'use client';
import { useRouter } from 'next/navigation';

export default function NewsContent({ article, id }: { article: any, id: string }) {
  const router = useRouter();

  if (!article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Новость # {id} не найдена</h1>
        <p className="text-zinc-500 mb-8">Возможно, она была удалена из первоисточника.</p>
        <button 
          onClick={() => router.push('/')} 
          className="bg-orange-600 px-6 py-3 rounded-xl font-bold"
        >
          ВЕРНУТЬСЯ НА ГЛАВНУЮ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-4 pt-6 text-white">
      {/* РЕКЛАМНЫЙ БЛОК */}
      <div style={{ width: '100%', maxWidth: '600px', height: '90px', backgroundColor: '#111', border: '1px dashed #333', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold' }}>
        Место для баннера 728x90 / Ad space
      </div>

      <div className="max-w-xl w-full bg-[#0a0a0a] border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        <div style={{ padding: '20px 20px 0 20px' }}>
          <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#111' }}>
            <img 
              src={article.imageurl} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.9' }} 
            />
          </div>
        </div>

        <div className="p-6 text-center">
          <p style={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Market Pulse News AI</p>
          <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '900', lineHeight: '1.3', marginBottom: '15px' }}>{article.title}</h1>
          
          <div style={{ backgroundColor: '#161616', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #222' }}>
            <p style={{ color: '#ea580c', fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>СПОНСОР: ВАША ССЫЛКА</p>
            <p style={{ color: '#71717a', fontSize: '12px' }}>Тут может быть ваша партнерская ссылка.</p>
          </div>

          <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', padding: '16px', backgroundColor: '#ea580c', color: '#ffffff', fontWeight: 'bold', borderRadius: '12px', textDecoration: 'none', textTransform: 'uppercase', fontSize: '14px' }}>
            ПЕРЕЙТИ К ИСТОЧНИКУ
          </a>
          
          <button onClick={() => router.push('/')} style={{ color: '#3f3f46', fontSize: '11px', marginTop: '20px', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
            ← На главную
          </button>
        </div>
      </div>
    </div>
  );
}