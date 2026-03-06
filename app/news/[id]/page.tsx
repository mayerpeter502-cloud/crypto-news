import NewsContent from './NewsContent';
import { Metadata } from 'next';

async function getArticle(id: string) {
  try {
    const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN`, {
      cache: 'no-store'
    });
    const data = await res.json();
    // Приводим к строке и удаляем лишние пробелы
    return data.Data.find((a: any) => String(a.id).trim() === String(id).trim());
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params; // Ждем получения ID
  const article = await getArticle(id);
  
  if (!article) return { title: 'CryptoFlow | News' };

  return {
    title: article.title,
    openGraph: {
      title: article.title,
      images: [article.imageurl],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Ждем получения ID
  const article = await getArticle(id);
  
  return <NewsContent article={article} id={id} />;
}