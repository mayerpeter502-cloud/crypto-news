import NewsContent from './NewsContent';
import { Metadata } from 'next';

// Функция получения данных (вынесена, чтобы не дублировать код)
async function getArticle(id: string) {
  try {
    const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data.Data.find((a: any) => a.id === id);
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticle(params.id);
  if (!article) return { title: 'CryptoFlow News' };

  return {
    title: article.title,
    description: 'Читать подробнее на CryptoFlow',
    openGraph: {
      title: article.title,
      description: article.body.substring(0, 100) + '...',
      images: [{ url: article.imageurl }], // Картинка для ТГ
      type: 'article',
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id); // Получаем данные на сервере
  
  // Передаем готовую статью в клиентский компонент
  return <NewsContent article={article} id={params.id} />;
}