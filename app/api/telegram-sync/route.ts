import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const POST_INTERVAL_MS = 1.5 * 60 * 60 * 1000; // 1.5 часа
const DELETE_AFTER_MS = 48 * 60 * 60 * 1000;  // 48 часов

function escapeMarkdown(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 1. Очистка старых данных (48 часов)
    const expirationDate = new Date(Date.now() - DELETE_AFTER_MS).toISOString();
    const { data: expired } = await supabase
      .from('telegram_posts')
      .select('id, message_id')
      .lt('created_at', expirationDate);

    if (expired && expired.length > 0) {
      for (const post of expired) {
        if (post.message_id) {
          await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: post.message_id }),
          }).catch(() => {});
        }
        await supabase.from('telegram_posts').delete().eq('id', post.id);
      }
    }

    // 2. Проверка интервала (не постим чаще чем раз в 1.5 часа)
    const { data: lastPost } = await supabase
      .from('telegram_posts')
      .select('created_at')
      .not('message_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastPost) {
      const diff = Date.now() - new Date(lastPost.created_at).getTime();
      if (diff < POST_INTERVAL_MS) {
        return NextResponse.json({ message: "Interval active", nextIn: Math.ceil((POST_INTERVAL_MS - diff) / 60000) });
      }
    }

    // 3. Выбор валидной новости (пропускаем пустые title/link)
    const { data: nextNews } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .not('title', 'is', null) // Игнорируем пустые заголовки
      .not('link', 'is', null)  // Игнорируем пустые ссылки
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!nextNews) {
      return NextResponse.json({ message: "No valid news in queue" });
    }

    // 4. Отправка в Telegram
    const internalLink = `https://crypto-news-swart.vercel.app/news/${nextNews.news_id}`;
    const msgText = `*${escapeMarkdown(nextNews.title)}*\n\n[Читать на сайте](${escapeMarkdown(internalLink)})`;

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: msgText,
        parse_mode: 'MarkdownV2',
      }),
    });

    const tgResult = await tgRes.json();
    if (tgResult.ok) {
      await supabase.from('telegram_posts')
        .update({ message_id: tgResult.result.message_id.toString() })
        .eq('id', nextNews.id);
      return NextResponse.json({ success: true, posted: nextNews.news_id });
    }

    return NextResponse.json({ error: tgResult.description }, { status: 500 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}