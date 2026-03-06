import { Metadata } from 'next';
import NewsContent from './NewsContent'; // Мы вынесем интерфейс в отдельный файл ниже

// 1. ФУНКЦИЯ ДЛЯ TELEGRAM (Метаданные)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`https://min-api.cryptocompare.com/data/v2/news/?lang=EN`);
    const data = await res.json();
    const article = data.Data.find((a: any) => a.id === params.id);

    if (!article) return { title: 'CryptoFlow | News' };

    return {
      title: article.title,
      description: 'Читать подробнее на CryptoFlow',
      openGraph: {
        title: article.title,
        description: article.body.substring(0, 100) + '...',
        images: [article.imageurl], // Картинка для превью в Telegram
        type: 'article',
      },
    };
  } catch (e) {
    return { title: 'CryptoFlow | News' };
  }
}

// 2. ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ
export default function Page({ params }: { params: { id: string } }) {
  return <NewsContent id={params.id} />;
}