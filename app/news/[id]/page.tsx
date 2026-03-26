import NewsContent from './NewsContent';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getArticle(id: string) {
  try {
    // 1. Сначала ищем в нашей БД (гарантия доступности 24ч)
    const { data: dbArticle } = await supabase
      .from('telegram_posts')
      .select('*')
      .eq('news_id', id)
      .single();

    if (dbArticle) {
      return {
        ...dbArticle,
        imageurl: dbArticle.image_url, // маппинг для NewsContent
      };
    }

    // 2. Резервный поиск в API
    const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN`, { cache: 'no-store' });
    const data = await res.json();
    return data.Data.find((a: any) => String(a.id) === String(id));
  } catch (e) {
    return null;
  }
}

async function getRelatedNews(article: any) {
  if (!article) return [];

  // Определяем группу монеты для точного поиска
  const title = article.title.toLowerCase();
  const categories = (article.categories || "").toLowerCase();
  
  const coinGroups = ['btc', 'eth', 'xrp', 'sol', 'ada', 'dot', 'doge', 'link', 'trx', 'shib'];
  const targetGroup = coinGroups.find(coin => 
    title.includes(coin) || categories.includes(coin)
  ) || 'crypto';

  // Ищем 6 похожих новостей по ключевой группе
  const { data } = await supabase
    .from('telegram_posts')
    .select('news_id, title, image_url, created_at')
    .or(`title.ilike.%${targetGroup}%,categories.ilike.%${targetGroup}%`)
    .neq('news_id', article.news_id || article.id) 
    .order('created_at', { ascending: false })
    .limit(6);
    
  return data || [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  
  if (!article) return { title: 'Market Pulse | News' };

  const baseUrl = 'https://crypto-news-swart.vercel.app';
  const pageUrl = `${baseUrl}/news/${id}`;
  const imageUrl = article.imageurl || article.image_url;

  return { 
    title: article.title,
    description: article.body?.substring(0, 160), // Добавляем описание для поиска
    alternates: {
      canonical: pageUrl, // Указываем Google на основную версию страницы
    },
    openGraph: { 
      title: article.title, 
      description: article.body?.substring(0, 160),
      url: pageUrl,
      images: [{ url: imageUrl }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.body?.substring(0, 160),
      images: [imageUrl],
    }
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);
  
  // Собираем рекомендации на основе групп монет (BTC к BTC и т.д.)
  const related = await getRelatedNews(article);
  
  return <NewsContent article={article} id={id} related={related} />;
}