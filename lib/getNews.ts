// lib/getNews.ts
import { createClient } from '@supabase/supabase-js';

// --- ЭТА ФУНКЦИЯ КРИТИЧЕСКИ ВАЖНА ДЛЯ СБОРКИ ПРОЕКТА ---
// Она используется в NewsCard.tsx. Без её экспорта Vercel выдает ошибку.
export async function translateSingleText(text: string) {
  // Возвращаем текст без изменений (оригинал)
  return text;
}

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
      
      // 1. ПОДГОТОВКА ДАННЫХ ДЛЯ САЙТА (Frontend)
      // Сопоставляем поля API с полями, которые ожидают твои компоненты NewsCard
      const articles = data.Data.map((article: any) => ({
        id: article.id.toString(),
        title: article.title || '',
        description: article.body ? article.body.substring(0, 160) + "..." : "",
        date: new Date(article.published_on * 1000).toLocaleDateString('en-US'),
        published_on: article.published_on,
        image: article.imageurl || '',
        url: article.url || '#'
      }));

      // 2. СОХРАНЕНИЕ В SUPABASE (Для Telegram-бота)
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
            // ВАЖНО: Мы НЕ указываем message_id: null здесь.
            // Если новость новая — в БД она создастся с null по умолчанию.
            // Если новость старая — upsert её не тронет, и существующий message_id (цифры) сохранится.
          }));
          
          // Используем upsert по заголовку (title), чтобы избежать ошибки уникальности
          const { error } = await supabase
            .from('telegram_posts')
            .upsert(toSave, { 
              onConflict: 'title', 
              ignoreDuplicates: true 
            });
          
          if (!error) {
            console.log("--- DB: Новости синхронизированы успешно ---");
          } else {
            console.error("--- DB UPSERT ERROR: ---", error.message);
          }
        } catch (dbErr) {
          console.error("--- DB CRITICAL ERROR: ---", dbErr);
        }
      }

      // Возвращаем отформатированные статьи для отображения на странице
      return articles;
    }
    return [];
  } catch (error) {
    console.error("--- GET NEWS ERROR: ---", error);
    return [];
  }
}