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
    // NewsData.io API
    console.log('🔄 Trying NewsData.io API...');
    
    // Маппинг категорий
    const categoryMap: Record<string, string> = {
      'ALL': '',
      'BITCOIN': 'bitcoin',
      'ETHEREUM': 'ethereum',
      'CRYPTO': 'cryptocurrency'
    };

    const cryptoCategory = categoryMap[category] || 'cryptocurrency';
    const query = cryptoCategory ? `${cryptoCategory} crypto` : 'cryptocurrency';
    
    const url = `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&q=${encodeURIComponent(query)}&language=en&category=business,technology`;

    const res = await fetch(url, { 
      cache: 'no-store',
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      throw new Error(`NewsData.io returned ${res.status}`);
    }

    const result = await res.json();
    console.log('✅ NewsData.io success:', result.results?.length);

    if (!result.results || result.results.length === 0) {
      console.warn('⚠️ NewsData.io returned empty results');
      return getFallbackNews();
    }

    // Сохраняем в Supabase
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const toSave = result.results.slice(0, 20).map((n: any) => ({
        news_id: n.article_id || Math.random().toString(36),
        title: n.title,
        link: n.link,
        image_url: n.image_url || '', 
        body: n.description || '',
        categories: category,
        published_at: n.pubDate
      }));

      await supabase
        .from('telegram_posts')
        .upsert(toSave, { onConflict: 'news_id', ignoreDuplicates: true });
    }

    // Возвращаем данные для NewsCard
    return result.results.slice(0, 20).map((item: any, idx: number) => {
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      return {
        id: item.article_id || `nd-${idx}`,
        title: item.title || 'No title',
        description: item.description || '',
        date: pubDate.toLocaleDateString('en-US'),
        published_on: Math.floor(pubDate.getTime() / 1000),
        image: item.image_url || `https://loremflickr.com/400/300/crypto?lock=${idx}`,
        url: item.link,
        source: item.source_id || item.creator || 'NewsData'
      };
    });

  } catch (err) {
    console.error("❌ NewsData.io failed:", err);
    return getFallbackNews();
  }
}

// Fallback на RSS
async function getFallbackNews() {
  console.log('🔄 Switching to RSS fallback...');
  
  try {
    const rssFeeds = [
      'https://cointelegraph.com/rss',
      'https://decrypt.co/feed'
    ];

    for (const feedUrl of rssFeeds) {
      try {
        const res = await fetch(feedUrl, { next: { revalidate: 600 } });
        if (!res.ok) continue;

        const text = await res.text();
        const items = parseRSS(text);
        
        if (items.length > 0) {
          console.log(`✅ RSS success:`, items.length);
          return items.slice(0, 20);
        }
      } catch (err) {
        continue;
      }
    }
  } catch (err) {
    console.error("❌ RSS fallback failed:", err);
  }

  // Заглушка
  return [
    {
      id: 'fallback-1',
      title: 'Crypto Market Update 2026',
      description: 'Latest cryptocurrency news and market analysis.',
      date: new Date().toLocaleDateString('en-US'),
      published_on: Math.floor(Date.now() / 1000),
      image: 'https://loremflickr.com/400/300/crypto',
      url: 'https://cointelegraph.com',
      source: 'Fallback'
    }
  ];
}

function parseRSS(xml: string) {
  const items: any[] = [];
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');
  const entries = xmlDoc.querySelectorAll('item, entry');
  
  entries.forEach((item, idx) => {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || item.querySelector('link')?.getAttribute('href') || '';
    const description = item.querySelector('description')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const image = item.querySelector('enclosure')?.getAttribute('url') || `https://loremflickr.com/400/300/crypto?lock=${idx}`;

    if (title && link) {
      items.push({
        id: `rss-${idx}-${Date.now()}`,
        title,
        description: description.replace(/<[^>]*>/g, '').slice(0, 300),
        date: pubDate ? new Date(pubDate).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
        published_on: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
        image,
        url: link,
        source: 'RSS Feed'
      });
    }
  });

  return items;
}