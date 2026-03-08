import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

    // 1. Пытаемся взять новость из очереди (где message_id еще нет)
    let { data: post } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    // 2. Если очереди нет — загружаем новости
    if (!post) {
      const newsRes = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      const newsData = await newsRes.json();
      
      // ПРОВЕРКА: Если API вернул ошибку, а не массив Data
      if (!newsData.Data || !Array.isArray(newsData.Data)) {
        return NextResponse.json({ error: "API limit or error", details: newsData }, { status: 500 });
      }

      for (const n of newsData.Data.slice(0, 10)) {
        await supabase.from('telegram_posts').upsert({
          news_id: n.id.toString(),
          title: n.title,
          link: n.url
        }, { onConflict: 'news_id' });
      }
      return NextResponse.json({ message: "Queue replenished. Run again to post." });
    }

    // 3. Отправка в Telegram
    const internalLink = `https://crypto-news-swart.vercel.app/news/${post.news_id}`;
    const messageText = `*${escapeMarkdown(post.title || 'Crypto News')}*\n\n[Читать на сайте](${escapeMarkdown(internalLink)})`;

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'MarkdownV2',
      }),
    });

    const tgResult = await tgRes.json();

    if (tgResult.ok) {
      await supabase.from('telegram_posts')
        .update({ message_id: tgResult.result.message_id.toString() })
        .eq('id', post.id);
      return NextResponse.json({ success: true, posted: post.news_id });
    }

    return NextResponse.json({ error: "Telegram error", details: tgResult }, { status: 500 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}