import NewsContent from './NewsContent';
import { Metadata } from 'next';

async function getArticle(id: string) {
  try {
    // Добавляем кэширование на 1 минуту, чтобы данные обновлялись
    const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN`, { 
      next: { revalidate: 60 } 
    });
    const data = await res.json();
    
    // Сравниваем ID, приводя оба к строке — это решит проблему "Новость не найдена"
    return data.Data.find((a: any) => String(a.id) === String(id));
  } catch (e) {
    console.error("Fetch error:", e);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticle(params.id);
  
  if (!article) return { title: 'CryptoFlow | News' };

  return {
    title: article.title,
    description: 'Читать подробнее на CryptoFlow',
    openGraph: {
      title: article.title,
      description: article.body.substring(0, 100) + '...',
      images: [{ url: article.imageurl }], 
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      images: [article.imageurl],
    }
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  
  // Передаем статью в клиент. Если её нет, NewsContent покажет кнопку "На главную"
  return <NewsContent article={article} id={params.id} />;
}