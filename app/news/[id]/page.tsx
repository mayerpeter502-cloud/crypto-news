import NewsContent from './NewsContent';
import { Metadata } from 'next';

// Эта функция дает Telegram картинку и заголовок
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN`);
  const data = await res.json();
  const article = data.Data.find((a: any) => a.id === params.id);

  return {
    title: article?.title || 'CryptoFlow News',
    openGraph: {
      title: article?.title,
      images: [article?.imageurl || ''],
    },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <NewsContent id={params.id} />;
}