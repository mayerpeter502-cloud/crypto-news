import NewsContent from './NewsContent';
import { Metadata } from 'next';

async function getArticle(id: string) {
  try {
    // Запрос от имени сервера обходит CORS
    const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN`, {
      cache: 'no-store' 
    });
    const data = await res.json();
    
    // ВАЖНО: Принудительно превращаем оба ID в строки для сравнения
    const article = data.Data.find((a: any) => String(a.id) === String(id));
    return article || null;
  } catch (e) {
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
      images: [article.imageurl], // Это даст картинку в Telegram
      type: 'article',
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  
  // Передаем готовую статью в клиентский компонент
  return <NewsContent article={article} id={params.id} />;
}