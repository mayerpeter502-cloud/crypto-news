// app/api/telegram-sync/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoNews } from '@/lib/getNews';

export const dynamic = 'force-dynamic';

const POST_INTERVAL_MS = 1 * 60 * 60 * 1000;  // 1 час
const DELETE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 часа

function escapeMarkdown(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 1. УМНОЕ УДАЛЕНИЕ СТАРЫХ ЗАПИСЕЙ ИЗ ТГ И БД
    const expirationDate = new Date(Date.now() - DELETE_AFTER_MS).toISOString();
    
    // Сначала получаем список сообщений, которые пора удалить
    const { data: toDelete } = await supabase
      .from('telegram_posts')
      .select('id, message_id')
      .lt('created_at', expirationDate);

    if (toDelete && toDelete.length > 0) {
      for (const item of toDelete) {
        if (item.message_id) {
          // Удаляем сообщение из Telegram канала
          await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: parseInt(item.message_id)
            }),
          });
        }
      }
      // После удаления из ТГ, удаляем записи из очереди и новостей
      const idsToDelete = toDelete.map(d => d.id);
      await supabase.from('telegram_posts').delete().in('id', idsToDelete);
      
      // Дополнительно: очищаем старые новости в основной таблице, 
      // чтобы не забивать бесплатный лимит Supabase
      await supabase.from('news').delete().lt('created_at', expirationDate);
    }

    // 2. ПРОВЕРКА ОЧЕРЕДИ
    let { data: queuePost } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .not('title', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    // Если очередь пуста, запрашиваем новые 30 новостей
    if (!queuePost) {
      await getCryptoNews('EN', 0, 'ALL'); 
      const { data: updatedPost } = await supabase
        .from('telegram_posts')
        .select('*')
        .is('message_id', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      queuePost = updatedPost;
    }

    if (!queuePost) {
      return NextResponse.json({ message: "No new news available even after sync." });
    }

    // 3. ПРОВЕРКА ИНТЕРВАЛА
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
        return NextResponse.json({ message: "Interval active. Post skipped." });
      }
    }

    // 4. ОТПРАВКА В TELEGRAM
    const internalLink = `https://crypto-news-swart.vercel.app/news/${queuePost.news_id}`;
    const msg = `*${escapeMarkdown(queuePost.title)}*\n\n[Read on Terminal](${internalLink})`;

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
      // Сохраняем ID сообщения, чтобы потом его можно было удалить
      await supabase.from('telegram_posts')
        .update({ message_id: tgResult.result.message_id.toString() })
        .eq('id', queuePost.id);
      
      return NextResponse.json({ success: true, posted: queuePost.title });
    }

    return NextResponse.json({ error: "TG Error", detail: tgResult }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}