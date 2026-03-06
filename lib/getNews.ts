// lib/getNews.ts
const SITE_URL = 'https://crypto-news-swart.vercel.app/'; 
const TELEGRAM_TOKEN = '8613979794:AAEg7YrdqPBw1m76-YPWRAQ4QAenVKXtFvw';
const TELEGRAM_CHAT_ID = '@pulse_news_hub';

export async function sendToTelegram(title: string, id: string) {
  try {
    const mySiteUrl = `${SITE_URL}/news/${id}`; 
    const text = encodeURIComponent(`🔥 *${title}*\n\n🔗 [Читать полностью на Pulse News](${mySiteUrl})`);
    const tgUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${text}&parse_mode=Markdown`;
    await fetch(tgUrl);
  } catch (e) {
    console.error("Ошибка отправки в ТГ:", e);
  }
}

export async function getCryptoNews(lang: string = 'EN', lastTimestamp: number = 0, category: string = 'ALL') {
  try {
    let url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN`;
    
    // Сопоставление категорий для API
    if (category !== 'ALL') {
      const apiCategory = category === 'REGULATION' ? 'Regulation' : category;
      url += `&categories=${apiCategory}`;
    }
    
    if (lastTimestamp) url += `&lts=${lastTimestamp}`;

    const res = await fetch(url, { next: { revalidate: 30 } }); // Ускорим обновление новостей
    const data = await res.json();

    if (!data || !data.Data || !Array.isArray(data.Data)) return [];

    return data.Data.map((article: any) => ({
      id: article.id,
      title: article.title || '',
      description: article.body ? article.body.substring(0, 160) + "..." : (article.title || ""),
      date: new Date(article.published_on * 1000).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US'),
      published_on: article.published_on,
      image: article.imageurl || '',
      url: article.url || '#'
    }));
  } catch (error) {
    return [];
  }
}

// Функцию перевода оставляем как была
export async function translateSingleText(text: string) {
    if (!text || text.length < 3) return text;
    const cacheKey = `trans_${text.substring(0, 30)}`;
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached && !cached.includes("MYMEMORY WARNING")) return cached;
    }
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const result = data[0][0][0];
        if (typeof window !== 'undefined') localStorage.setItem(cacheKey, result);
        return result;
      }
      return text;
    } catch { return text; }
}