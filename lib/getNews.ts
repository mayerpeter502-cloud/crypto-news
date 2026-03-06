// lib/getNews.ts

// Пока у нас нет домена, используем заглушку. 
// Когда купите домен, замените 'pulse-news.vercel.app' на ваш адрес.
const SITE_URL = 'https://crypto-news-swart.vercel.app/'; 
const TELEGRAM_TOKEN = '8613979794:AAEg7YrdqPBw1m76-YPWRAQ4QAenVKXtFvw';
const TELEGRAM_CHAT_ID = '@pulse_news_hub';

export async function sendToTelegram(title: string, id: string) {
  try {
    const mySiteUrl = `${SITE_URL}/news/${id}`; 
    
    // 1. Используем специальный невидимый код для ссылки.
    // 2. Включаем заголовок внутрь тега <a>, но делаем его невидимым пробелом,
    // чтобы Telegram гарантированно создал превью, но не выводил текст.
    const text = encodeURIComponent(`<a href="${mySiteUrl}">&#8203;</a>`);

    const tgUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?` +
      `chat_id=${TELEGRAM_CHAT_ID}&` +
      `text=${text}&` +
      `parse_mode=HTML`;
    
    const response = await fetch(tgUrl);
    
    // Если сообщение не дошло, в консоли Vercel или терминале появится ошибка
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API Error:", errorData);
    }
  } catch (e) {
    console.error("Ошибка отправки в ТГ:", e);
  }
}

export async function getCryptoNews(lang: string = 'EN', lastTimestamp: number = 0, category: string = 'ALL') {
  try {
    let url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN`;
    if (category !== 'ALL') url += `&categories=${category}`;
    if (lastTimestamp) url += `&lts=${lastTimestamp}`;

    const res = await fetch(url, { next: { revalidate: 60 } });
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

// Функцию перевода Google оставляем без изменений как в прошлом шаге...
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