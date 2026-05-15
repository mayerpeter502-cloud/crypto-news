// lib/getNews.ts
import { createClient } from '@supabase/supabase-js';

export async function translateSingleText(text: string) {
  return text;
}

export async function getCryptoNews(lang: string = 'EN', lastTimestamp: number = 0, category: string = 'ALL') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const newsDataApiKey = process.env.NEWDATA_API_KEY;

  try {
    console.log(`🔄 Fetching news for: ${category}`);
    
    // Соответствие твоим кнопкам: All News, Bitcoin, Ethereum, Solana, Regulation
    const categoryMap: Record<string, string> = {
      'ALL': 'cryptocurrency',
      'BITCOIN': 'bitcoin',
      'ETHEREUM': 'ethereum',
      'SOLANA': 'solana',
      'REGULATION': 'crypto regulation'
    };

    const query = categoryMap[category] || 'cryptocurrency';
    
    // Добавляем параметр timeframe, если есть lastTimestamp (условно)
    let url = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&q=${encodeURIComponent(query)}&language=en`;
    
    // Ограничиваем тематику, чтобы не лезла политика
    url += `&category=technology,business`;

    const res = await fetch(url, { 
      cache: 'no-store',
      next: { revalidate: 300 }
    });

    if (!res.ok) throw new Error(`NewsData status: ${res.status}`);

    const result = await res.json();

    if (!result.results || result.results.length === 0) {
      return getFallbackNews();
    }

    // 2. Стабильное сохранение без дублей (по Title)
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const toSave = result.results.map((n: any) => ({
        // Создаем стабильный ID на основе заголовка, если article_id нет
        news_id: n.article_id || Buffer.from(n.title).toString('base64').slice(0, 25),
        title: n.title,
        link: n.link,
        image_url: n.image_url || '', 
        body: n.description || '',
        categories: category,
        published_at: n.pubDate
      }));

      await supabase
        .from('telegram_posts')
        .upsert(toSave, { 
          onConflict: 'title', // Это не даст сохранить одну и ту же новость дважды
          ignoreDuplicates: true 
        });
    }

    // 3. Возврат данных с проверкой даты
    return result.results.map((item: any, idx: number) => {
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      return {
        id: item.article_id || `id-${idx}`,
        title: item.title || 'No title',
        description: item.description || '',
        date: pubDate.toLocaleDateString('en-US'),
        published_on: Math.floor(pubDate.getTime() / 1000),
        image: item.image_url || `https://loremflickr.com/400/300/crypto?lock=${idx}`,
        url: item.link,
        source: item.source_id || 'News'
      };
    });

  } catch (err) {
    console.error("❌ NewsData failed:", err);
    return getFallbackNews();
  }
}

async function getFallbackNews() {
  // Логика RSS остается, но на сервере (Vercel) DOMParser не существует.
  // Если RSS не работает — возвращаем пустой массив или статичную новость.
  return []; 
}