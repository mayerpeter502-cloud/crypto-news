import NewsContent from './NewsContent';
import { Metadata } from 'next';

// Выносим получение данных в надежную функцию на сервере
async function getArticle(id: string) {
  try {
    // Делаем запрос от имени сервера (CORS здесь не страшен)
    const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN`, {
      cache: 'no-store' // Всегда свежие данные
    });
    const data = await res.json();
    
    // Сравниваем ID как строки, чтобы избежать ошибок типизации
    return data.Data.find((a: any) => String(a.id) === String(id));
  } catch (e) {
    console.error("Server Fetch Error:", e);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticle(params.id);
  
  if (!article) return { title: 'CryptoFlow | News' };

  return {
    title: article.title,
    openGraph: {
      title: article.title,
      description: 'Читать подробнее на CryptoFlow',
      images: [article.imageurl], // Картинка для Telegram
      type: 'article',
      url: `https://crypto-news-swart.vercel.app/news/${params.id}`
    },
    twitter: {
      card: 'summary_large_image',
      images: [article.imageurl],
    }
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  
  // Передаем статью в клиентский компонент. Дизайн берем из NewsContent
  return <NewsContent article={article} id={params.id} />;
}