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

    if (data.Response === "Error") return [];

    if (data && data.Data && Array.isArray(data.Data)) {
      if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const toSave = data.Data.slice(0, 50).map((n: any) => ({
            news_id: n.id.toString(),
            title: n.title,
            link: n.url,
            image_url: n.imageurl,
            body: n.body,
            categories: n.categories,
            // УБРАЛИ message_id: null, чтобы не затирать статус уже отправленных новостей
          }));
          
          // МЕНЯЕМ news_id на title, чтобы база не ругалась на дубликаты заголовков
          const { error } = await supabase
            .from('telegram_posts')
            .upsert(toSave, { 
              onConflict: 'title', 
              ignoreDuplicates: true 
            });
          
          if (!error) console.log("--- DB: База обновлена (дубликаты пропущены) ---");
        } catch (dbErr) {
          console.error("--- DB ERROR: ---", dbErr);
        }
      }
      return data.Data;
    }
    return [];
  } catch (error) {
    return [];
  }
}