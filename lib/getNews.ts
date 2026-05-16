'use server';

import { createClient } from '@supabase/supabase-js';

export async function translateSingleText(text: string) {
  return text;
}

const extractTag = (str: string, tag: string): string => {
  const match = str.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`));
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
};

const extractImg = (str: string): string => {
  const match = str.match(/<(media:content|enclosure)[^>]+url=["']([^"']+)["']/);
  if (match) return match[2];
  const imgMatch = str.match(/<img[^>]+src=["']([^"']+)["']/);
  return imgMatch ? imgMatch[1] : '';
};

const detectCategory = (title: string, body: string): string => {
  const text = `${title} ${body}`.toLowerCase();
  
  if (text.includes('bitcoin') || /\bbtc\b/i.test(text) || text.includes('satoshi')) return 'BTC';
  if (text.includes('ethereum') || /\beth\b/i.test(text) || text.includes('vitalik') || text.includes('layer 2')) return 'ETH';
  if (text.includes('solana') || /\bsol\b/i.test(text) || text.includes('phantom wallet')) return 'SOL';
  if (text.includes('regulation') || /\bsec\b/i.test(text) || /\bfed\b/i.test(text) || text.includes('law') || text.includes('court') || /\betf\b/i.test(text) || text.includes('gensler') || text.includes('bill ')) return 'REGULATION';
  
  return 'General';
};

export async function getCryptoNews(lang: string = 'EN', lastTimestamp: number = 0, category: string = 'ALL') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const catLower = category.toLowerCase();

  let feeds = [
    'https://cointelegraph.com/rss',
    'https://www.coindesk.com/arc/outboundfeeds/rss/',
    'https://cryptoslate.com/feed/'
  ];

  if (catLower === 'btc' || catLower === 'bitcoin') {
    feeds = [
      'https://cointelegraph.com/rss/tag/bitcoin',
      'https://cryptoslate.com/feed/?post_type=news&tag=bitcoin',
      'https://www.coindesk.com/arc/outboundfeeds/rss/'
    ];
  } else if (catLower === 'eth' || catLower === 'ethereum') {
    feeds = [
      'https://cointelegraph.com/rss/tag/ethereum',
      'https://cryptoslate.com/feed/?post_type=news&tag=ethereum',
      'https://www.coindesk.com/arc/outboundfeeds/rss/'
    ];
  } else if (catLower === 'sol' || catLower === 'solana') {
    feeds = [
      'https://cointelegraph.com/rss/tag/solana',
      'https://cointelegraph.com/rss/tag/altcoin',
      'https://cryptoslate.com/feed/'
    ];
  } else if (catLower === 'regulation') {
    feeds = [
      'https://cointelegraph.com/rss/tag/regulation',
      'https://www.coindesk.com/arc/outboundfeeds/rss/policy/',
      'https://cryptoslate.com/feed/'
    ];
  }

  let liveArticles: any[] = [];

  try {
    for (const feedUrl of feeds) {
      try {
        const res = await fetch(feedUrl, { 
          cache: 'no-store',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const xml = await res.text();
        const items = xml.split('<item>');
        items.shift();

        for (const itemXml of items) {
          const title = extractTag(itemXml, 'title');
          const url = extractTag(itemXml, 'link') || extractTag(itemXml, 'guid');
          const rawBody = extractTag(itemXml, 'description').replace(/<[^>]*>/g, '').trim();
          const pubDate = extractTag(itemXml, 'pubDate');
          const published_on = Math.floor(new Date(pubDate).getTime() / 1000) || Math.floor(Date.now() / 1000);
          const image = extractImg(itemXml);
          
          if (!title || !url) continue;

          const id = Buffer.from(url).toString('base64').substring(0, 16);
          const detectedCat = detectCategory(title, rawBody);

          liveArticles.push({
            id,
            title,
            body: rawBody,
            published_on,
            image,
            url,
            categories: detectedCat
          });
        }
      } catch (e) {
        console.error(`RSS Error (${feedUrl}):`, e);
      }
    }
  } catch (err) {
    console.error("Live RSS fetch failed:", err);
  }

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      if (liveArticles.length > 0) {
        const toSave = liveArticles.map(item => ({
          news_id: item.id,
          title: item.title,
          link: item.url,
          image_url: item.image,
          body: item.body,
          categories: item.categories
        }));

        await supabase.from('telegram_posts').upsert(toSave, { 
          onConflict: 'news_id', 
          ignoreDuplicates: true 
        });
      }

      let dbCategory = category.toUpperCase();
      if (dbCategory === 'BITCOIN') dbCategory = 'BTC';
      if (dbCategory === 'ETHEREUM') dbCategory = 'ETH';
      if (dbCategory === 'SOLANA') dbCategory = 'SOL';

      let query = supabase
        .from('telegram_posts')
        .select('*')
        .order('id', { ascending: false });

      if (dbCategory !== 'ALL') {
        if (dbCategory === 'BTC') {
          query = query.or(`categories.eq.BTC,title.ilike.%bitcoin%,title.ilike.%btc%`);
        } else if (dbCategory === 'ETH') {
          query = query.or(`categories.eq.ETH,title.ilike.%ethereum%,title.ilike.%eth %`);
        } else if (dbCategory === 'SOL') {
          query = query.or(`categories.eq.SOL,title.ilike.%solana%,title.ilike.%sol %`);
        } else if (dbCategory === 'REGULATION') {
          query = query.or(`categories.eq.REGULATION,title.ilike.%sec %,title.ilike.%regulation%,title.ilike.%etf%`);
        } else {
          query = query.eq('categories', dbCategory);
        }
      }

      if (lastTimestamp) {
        query = query.lt('id', lastTimestamp); 
      }

      let { data: dbData, error: dbRowsError } = await query.limit(20);

      if (!dbRowsError && dbCategory !== 'ALL' && (!dbData || dbData.length < 10) && lastTimestamp) {
        let fallbackQuery = supabase
          .from('telegram_posts')
          .select('*')
          .order('id', { ascending: false });
          
        if (dbCategory === 'BTC') fallbackQuery = fallbackQuery.or(`categories.eq.BTC,title.ilike.%bitcoin%,title.ilike.%btc%`);
        else if (dbCategory === 'ETH') fallbackQuery = fallbackQuery.or(`categories.eq.ETH,title.ilike.%ethereum%,title.ilike.%eth %`);
        else if (dbCategory === 'SOL') fallbackQuery = fallbackQuery.or(`categories.eq.SOL,title.ilike.%solana%,title.ilike.%sol %`);
        else fallbackQuery = fallbackQuery.eq('categories', dbCategory);

        const { data: oldData } = await fallbackQuery.limit(25);
        if (oldData && oldData.length > 0) {
          dbData = oldData;
        }
      }

      if (!dbRowsError && dbData && dbData.length > 0) {
        return dbData.map(row => ({
          id: row.news_id,
          title: row.title,
          description: row.body ? row.body.substring(0, 160) + "..." : "",
          published_on: row.id, 
          date: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
          image: row.image_url,
          url: row.link
        }));
      }
    } catch (dbErr) {
      console.error("Supabase error:", dbErr);
    }
  }

  // Фолбек фильтрация в RAM (если база недоступна)
  let filtered = [...liveArticles].sort((a, b) => b.published_on - a.published_on);
  if (category !== 'ALL') {
    const target = category.toLowerCase();
    filtered = filtered.filter(item => {
      const t = item.title.toLowerCase();
      if (target === 'btc' || target === 'bitcoin') return item.categories === 'BTC' || t.includes('bitcoin') || t.includes('btc');
      if (target === 'eth' || target === 'ethereum') return item.categories === 'ETH' || t.includes('ethereum') || t.includes('eth');
      if (target === 'sol' || target === 'solana') return item.categories === 'SOL' || t.includes('solana') || t.includes('sol');
      if (target === 'regulation') return item.categories === 'REGULATION' || t.includes('sec') || t.includes('regulation') || t.includes('etf');
      return item.categories.toLowerCase() === target;
    });
  }

  if (lastTimestamp) {
    filtered = filtered.filter(item => item.published_on < lastTimestamp);
  }

  return filtered.slice(0, 20).map(item => ({
    id: item.id,
    title: item.title,
    description: item.body ? item.body.substring(0, 160) + "..." : "",
    date: new Date(item.published_on * 1000).toLocaleDateString('en-US'),
    published_on: item.published_on,
    image: item.image,
    url: item.url
  }));
}