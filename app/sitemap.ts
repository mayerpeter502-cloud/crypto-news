import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// 1. Настройка подключения к Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Укажите ваш реальный домен
const BASE_URL = 'https://crypto-news-swart.vercel.app'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // 3. Получаем список news_id из таблицы telegram_posts
    // Мы берем последние 100 новостей, чтобы sitemap не был слишком тяжелым
    const { data: posts } = await supabase
      .from('telegram_posts')
      .select('news_id')
      .order('created_at', { ascending: false })
      .limit(100);

    // 4. Формируем ссылки для динамических страниц новостей
    const newsUrls = (posts || []).map((post) => ({
      url: `${BASE_URL}/news/${post.news_id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // 5. Добавляем статическую главную страницу
    const staticUrls = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 1.0,
      },
    ];

    return [...staticUrls, ...newsUrls];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // В случае ошибки возвращаем хотя бы главную страницу
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
      },
    ];
  }
}