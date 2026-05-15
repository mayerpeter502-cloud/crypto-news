// lib/getNews.ts
import { createClient } from '@supabase/supabase-js';

export async function translateSingleText(text: string) {
  return text;
}

export async function getCryptoNews(lang: string = 'EN', lastTimestamp: number = 0, category: string = 'ALL') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  try {
    // Попытка 1: cryptocurrency.cv API
    console.log('🔄 Trying cryptocurrency.cv API...');
    let url = `https://cryptocurrency.cv/api/v1/news?limit=50`;
    if (category !== 'ALL') {
      url += `&filter=${category.toLowerCase()}`;
    }

    const res = await fetch(url, { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      throw new Error(`cryptocurrency.cv returned ${res.status}`);
    }

    const result = await res.json();
    console.log('✅ cryptocurrency.cv response:', result);

    // Проверяем структуру ответа
    const rawData = Array.isArray(result) 
      ? result 
      : Array.isArray(result.data) 
        ? result.data 
        : Array.isArray(result.news)
          ? result.news
          : [];

    if (rawData.length === 0) {
      console.warn('⚠️ cryptocurrency.cv returned empty array, trying fallback...');
      return await getFallbackNews();
    }

    // Сохраняем в Supabase если настроен
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const toSave = rawData.map((n: any) => ({
        news_id: n.id?.toString() || n._id?.toString() || Math.random().toString(36),
        title: n.title || n.headline || '',
        link: n.url || n.link || n.source_url || '',
        image_url: n.image_url || n.image || n.thumbnail || '', 
        body: n.description || n.body || n.content || n.text || '',
        categories: n.category || n.categories || category,
        published_at: n.published_at || n.publishedOn || n.date
      })).filter(item => item.title && item.link); // Убираем пустые

      if (toSave.length > 0) {
        await supabase
          .from('telegram_posts')
          .upsert(toSave, { onConflict: 'news_id', ignoreDuplicates: true });
      }
    }

    // Маппинг для NewsCard
    return rawData.map((n: any) => {
      const pubDate = n.published_at || n.publishedOn || n.date ? new Date(n.published_at || n.publishedOn || n.date) : new Date();
      return {
        id: n.id?.toString() || n._id?.toString() || Math.random().toString(36),
        title: n.title || n.headline || 'No title',
        description: n.description || n.body || n.content || n.text || '',
        date: pubDate.toLocaleDateString('en-US'),
        published_on: Math.floor(pubDate.getTime() / 1000),
        image: n.image_url || n.image || n.thumbnail || '',
        url: n.url || n.link || n.source_url || '',
        source: n.source_name || n.source || 'Crypto News'
      };
    }).filter(item => item.title !== 'No title');

  } catch (err) {
    console.error("❌ cryptocurrency.cv failed:", err);
    console.log('🔄 Switching to fallback RSS sources...');
    return await getFallbackNews();
  }
}

// Fallback: парсинг RSS лент
async function getFallbackNews() {
  try {
    // Используем RSS2JSON для конвертации RSS в JSON
    const rssFeeds = [
      'https://cointelegraph.com/rss',
      'https://decrypt.co/feed',
      'https://www.coindesk.com/arc/outboundfeeds/rss/'
    ];

    const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(randomFeed)}&count=20`;

    console.log('📡 Fetching RSS from:', randomFeed);
    
    const res = await fetch(apiUrl, { 
      next: { revalidate: 600 }
    });

    if (!res.ok) throw new Error('RSS fetch failed');

    const data = await res.json();
    
    if (data.status !== 'ok' || !data.items || data.items.length === 0) {
      throw new Error('RSS returned empty');
    }

    return data.items.map((item: any, idx: number) => ({
      id: `rss-${idx}-${Date.now()}`,
      title: item.title,
      description: item.description?.replace(/<[^>]*>/g, '').slice(0, 300) || '',
      date: new Date(item.pubDate).toLocaleDateString('en-US'),
      published_on: Math.floor(new Date(item.pubDate).getTime() / 1000),
      image: item.enclosure?.link || item.thumbnail || `https://loremflickr.com/400/300/crypto?lock=${idx}`,
      url: item.link,
      source: data.feed?.title || 'Crypto RSS'
    }));

  } catch (rssErr) {
    console.error("❌ RSS fallback also failed:", rssErr);
    // Возвращаем заглушку если всё упало
    return [
      {
        id: 'fallback-1',
        title: 'Bitcoin Reaches New Heights in 2026',
        description: 'Crypto market shows strong growth as institutional adoption continues...',
        date: new Date().toLocaleDateString('en-US'),
        published_on: Math.floor(Date.now() / 1000),
        image: 'https://loremflickr.com/400/300/bitcoin',
        url: 'https://cointelegraph.com',
        source: 'Fallback News'
      }
    ];
  }
}