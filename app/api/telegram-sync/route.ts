import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const POST_INTERVAL_MS = 1 * 60 * 60 * 1000;  // Интервал 1 час
const DELETE_AFTER_MS = 24 * 60 * 60 * 1000; // Очистка 24 часа

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

    // 1. Очистка (ТГ + БД) через 24 часа
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

    // 2. Проверка интервала 1 час
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
        return NextResponse.json({ message: "Wait for 1h interval" });
      }
    }

    // 3. Выбор новости из очереди (с защитой от пустых полей)
    let { data: queuePost } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .not('title', 'is', null)
      .not('news_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    // 4. Догрузка 30 новостей для запаса
    if (!queuePost) {
      const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      const cryptoData = await res.json();
      
      if (cryptoData.Data && Array.isArray(cryptoData.Data)) {
        for (const n of cryptoData.Data.slice(0, 30)) { // Запас 30 штук
          await supabase.from('telegram_posts').upsert({
            news_id: n.id.toString(),
            title: n.title,
            link: n.url,
            image_url: n.imageurl,
            body: n.body,
            categories: n.categories
          }, { onConflict: 'news_id' });
        }
      }
      return NextResponse.json({ message: "Queue replenished with 30 news" });
    }

    // 5. Отправка в TG
    const internalLink = `https://crypto-news-swart.vercel.app/news/${queuePost.news_id}`;
    const msg = `*${escapeMarkdown(queuePost.title)}*\n\n[Читать на сайте](${internalLink})`;

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: 'MarkdownV2',
      }),
    });

    const tgResult = await tgRes.json();
    if (tgResult.ok) {
      await supabase.from('telegram_posts')
        .update({ message_id: tgResult.result.message_id.toString() })
        .eq('id', queuePost.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "TG Error", details: tgResult }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}