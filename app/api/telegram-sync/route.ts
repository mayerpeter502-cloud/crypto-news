import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function escapeMarkdown(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

// Задержка между сообщениями, чтобы ТГ не забанил (2 секунды)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Получаем 10-15 последних новостей из CryptoCompare
    const cryptoRes = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
    const cryptoData = await cryptoRes.json();
    const newsArray = cryptoData.Data.slice(0, 15); // Берем последние 15

    let postedCount = 0;

    for (const news of newsArray) {
      // 2. Проверяем, есть ли новость в базе
      const { data: existing } = await supabase
        .from('telegram_posts')
        .select('news_id')
        .eq('news_id', news.id.toString())
        .maybeSingle();

      if (!existing) {
        // 3. Формируем сообщение
        const messageContent = `*${escapeMarkdown(news.title)}*\n\n${escapeMarkdown(news.url)}`;

        // 4. Отправляем в Telegram
        const tgRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: messageContent,
            parse_mode: 'MarkdownV2',
          }),
        });

        const tgResult = await tgRes.json();

        if (tgResult.ok) {
          // 5. Записываем в базу, чтобы не дублировать
          await supabase.from('telegram_posts').insert({
            news_id: news.id.toString(),
            заголовок: news.title,
            "текст ссылки": news.url,
            message_id: tgResult.result.message_id.toString()
          });
          postedCount++;
          // Пауза 2 сек между постами для безопасности
          await delay(2000);
        }
      }
    }

    return NextResponse.json({ success: true, posted: postedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}