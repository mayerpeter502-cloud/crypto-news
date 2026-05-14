// lib/getNews.ts
import { createClient } from '@supabase/supabase-js';

// --- ЭТА ФУНКЦИЯ КРИТИЧЕСКИ ВАЖНА ДЛЯ СБОРКИ ПРОЕКТА ---
// Она используется в NewsCard.tsx. Без её экспорта Vercel выдает ошибку.
export async function translateSingleText(text: string) {
  // Возвращаем текст без изменений (оригинал)
  return text;
}

export async function getCryptoNews(lang: string = 'EN', lastTimestamp: number = 0, category: string = 'ALL') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  try {
    // API без лимитов и ключей
    let url = `https://cryptocurrency.cv/api/v1/news?limit=50`;
    if (category !== 'ALL') {
      url += `&filter=${category.toLowerCase()}`;
    }

    const res = await fetch(url, { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    
    const result = await res.json();
    const rawData = Array.isArray(result) ? result : result.data;

    if (rawData && Array.isArray(rawData)) {
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const toSave = rawData.map((n: any) => ({
          news_id: n.id?.toString() || Math.random().toString(36),
          title: n.title,
          link: n.url,
          image_url: n.image_url || n.image || '', 
          body: n.description || n.body || '',
          categories: n.category || category,
        }));

        await supabase
          .from('telegram_posts')
          .upsert(toSave, { onConflict: 'title', ignoreDuplicates: true });
      }

      // Возвращаем данные для NewsCard
      return rawData.map((n: any) => ({
        id: n.id?.toString(),
        title: n.title,
        description: n.description || n.body || '',
        date: n.published_at ? new Date(n.published_at).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
        published_on: n.published_at ? Math.floor(new Date(n.published_at).getTime() / 1000) : Math.floor(Date.now() / 1000),
        image: n.image_url || n.image || '',
        url: n.url,
        source: n.source_name || 'Crypto News'
      }));
    }
    return [];
  } catch (err) {
    console.error("--- API Error: ---", err);
    return [];
  }
}