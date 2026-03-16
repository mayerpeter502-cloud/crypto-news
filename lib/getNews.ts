// lib/getNews.ts
import { createClient } from '@supabase/supabase-js';

export async function getCryptoNews(lang: string = 'EN', lastTimestamp: number = 0, category: string = 'ALL') {
  const apiKey = process.env.NEXT_PUBLIC_CRYPTO_KEY || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  try {
    let url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=${apiKey}`;
    if (category !== 'ALL') url += `&categories=${category}`;
    if (lastTimestamp) url += `&lts=${lastTimestamp}`;

    const res = await fetch(url, { cache: 'no-store' }); 
    const data = await res.json();

    if (data.Response === "Error") {
      console.error("--- API ERROR: ---", data.Message);
      return [];
    }

    if (data && data.Data && Array.isArray(data.Data)) {
      const articles = data.Data.map((article: any) => ({
        id: article.id.toString(),
        title: article.title || '',
        description: article.body ? article.body.substring(0, 160) + "..." : "",
        date: new Date(article.published_on * 1000).toLocaleDateString('en-US'),
        published_on: article.published_on,
        image: article.imageurl || '',
        url: article.url || '#'
      }));

      // Сохранение в Supabase
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const toSave = data.Data.slice(0, 100).map((n: any) => ({
            news_id: n.id.toString(),
            title: n.title,
            link: n.url,
            image_url: n.imageurl,
            body: n.body,
            categories: n.categories,
            // Сбрасываем message_id, чтобы новые новости попали в очередь на публикацию
            message_id: null 
          }));
          
          // ВАЖНО: Используем await, чтобы Cron-скрипт дождался завершения записи
          const { error } = await supabase.from('telegram_posts').upsert(toSave, { onConflict: 'news_id' });
          
          if (!error) console.log("--- DB: База успешно обновлена новыми новостями ---");
          else console.error("--- DB ERROR: ---", error.message);
          
        } catch (dbErr) {
          console.error("--- DB CRITICAL ERROR: ---", dbErr);
        }
      }

      return articles;
    }

    return [];
  } catch (error) {
    console.error("--- CRITICAL FETCH ERROR: ---", error);
    return [];
  }
}

export async function translateSingleText(text: string) { return text; }