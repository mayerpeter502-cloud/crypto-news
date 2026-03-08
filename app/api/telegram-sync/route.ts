import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const INTERVAL_MS = 2.5 * 60 * 60 * 1000; // 2.5 часа в миллисекундах

function escapeMarkdown(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Проверяем, когда был последний пост (ищем максимальный id или дату)
    const { data: lastPost } = await supabase
      .from('telegram_posts')
      .select('created_at')
      .not('message_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastPost) {
      const lastPostTime = new Date(lastPost.created_at).getTime();
      const now = Date.now();

      // Если с последнего поста прошло меньше 2.5 часов — выходим
      if (now - lastPostTime < INTERVAL_MS) {
        return NextResponse.json({ message: 'Too early for next post' });
      }
    }

    // 2. Если время пришло — берем ОДНУ самую старую новость из очереди
    const { data: queuePost } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    // 3. Если в очереди пусто — идем в API CryptoCompare за свежаком
    if (!queuePost) {
      const cryptoRes = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      const cryptoData = await cryptoRes.json();
      const newsArray = cryptoData.Data.slice(0, 10);

      // Просто сохраняем новые в базу как "очередь" (без отправки)
      for (const news of newsArray) {
        const { data: exists } = await supabase.from('telegram_posts').select('id').eq('news_id', news.id.toString()).maybeSingle();
        if (!exists) {
          await supabase.from('telegram_posts').insert({
            news_id: news.id.toString(),
            заголовок: news.title,
            "текст ссылки": news.url
          });
        }
      }
      return NextResponse.json({ message: 'Queue updated with fresh news' });
    }

    // 4. Отправляем найденную новость из очереди в Telegram
// Формируем ссылку на ВАШ сайт, используя news_id из CryptoCompare
const internalLink = `https://crypto-news-swart.vercel.app/news/${queuePost.news_id}`;

const messageContent = `*${escapeMarkdown(queuePost.заголовок)}*\n\n[Читать на сайте](${escapeMarkdown(internalLink)})`;

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
      // Помечаем как отправленную
      await supabase
        .from('telegram_posts')
        .update({ message_id: tgResult.result.message_id.toString() })
        .eq('id', queuePost.id);

      return NextResponse.json({ success: true, message: 'Interval post sent' });
    }

    return NextResponse.json({ error: 'TG failed' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}