'use client';
import { useRouter } from 'next/navigation';

export default function NewsContent({ article, id }: { article: any, id: string }) {
  const router = useRouter();

  if (!article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Новость # {id} не найдена</h1>
        <button onClick={() => router.push('/')} className="bg-orange-600 px-6 py-2 rounded-lg">
          ВЕРНУТЬСЯ НА ГЛАВНУЮ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-start p-4 pt-6 text-white">
      
      {/* РЕКЛАМНЫЙ БЛОК */}
      <div style={{ width: '100%', maxWidth: '600px', height: '90px', backgroundColor: '#111', border: '1px dashed #333', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>
        Место для баннера 728x90 / Ad space
      </div>

      <div className="max-w-xl w-full bg-[#0a0a0a] border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        <div style={{ padding: '20px' }}>
          <div style={{ width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
            <img 
              src={article.imageurl} 
              alt="" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </div>

        <div className="p-6 pt-0 text-center">
          <p style={{ color: '#ea580c', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
            {article.source_info?.name || 'CRYPTOFLOW AI'}
          </p>
          
          <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '900', lineHeight: '1.2', marginBottom: '20px' }}>
            {article.title}
          </h1>

          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'block', padding: '16px', backgroundColor: '#ea580c', color: '#fff', fontWeight: 'bold', borderRadius: '12px', textDecoration: 'none' }}
          >
            ЧИТАТЬ ОРИГИНАЛ
          </a>
          
          <button 
            onClick={() => router.push('/')}
            style={{ color: '#555', fontSize: '12px', marginTop: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Вернуться назад
          </button>
        </div>
      </div>
    </div>
  );
}