import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoNews } from '@/lib/getNews';

export const dynamic = 'force-dynamic';

// НАСТРОЙКИ ИНТЕРВАЛОВ
const POST_INTERVAL_MS = 60 * 60 * 1000;      // Пост в ТГ раз в 1 час
const DELETE_AFTER_MS = 24 * 60 * 60 * 1000;   // Удаление старых через 24 часа

function escapeMarkdown(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    // Проверка секретного ключа из Cron-job.org
    if (key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 1. ОЧИСТКА СТАРЫХ ДАННЫХ (24 часа)
    const expirationDate = new Date(Date.now() - DELETE_AFTER_MS).toISOString();
    
    // Ищем старые посты, которые были отправлены в ТГ
    const { data: oldPosts } = await supabase
      .from('telegram_posts')
      .select('id, message_id')
      .lt('created_at', expirationDate);

    if (oldPosts && oldPosts.length > 0) {
      for (const item of oldPosts) {
        // Удаляем сообщение из Telegram канала
        if (item.message_id) {
          await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: parseInt(item.message_id) }),
          }).catch(() => {}); // Игнорируем ошибки, если пост уже удален вручную
        }
      }
      // Удаляем записи из таблицы
      const idsToDelete = oldPosts.map(d => d.id);
      await supabase.from('telegram_posts').delete().in('id', idsToDelete);
    }

    // 2. ОБНОВЛЕНИЕ БАЗЫ (Выполняется при каждом вызове Cron - каждые 5 мин)
    // Это критически важно для работы торгового бота index.js
    await getCryptoNews('EN', 0, 'ALL'); 

    // 3. КОНТРОЛЬ ИНТЕРВАЛА ТЕЛЕГРАМ
    const { data: lastTgPost } = await supabase
      .from('telegram_posts')
      .select('created_at')
      .not('message_id', 'is', null) // Проверяем только те, что реально ушли в ТГ
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastTgPost) {
      const timeSinceLastPost = Date.now() - new Date(lastTgPost.created_at).getTime();
      if (timeSinceLastPost < POST_INTERVAL_MS) {
        // База обновлена, но в ТГ постить рано
        return NextResponse.json({ 
          status: "success", 
          message: "DB synced for Bot. TG post skipped by timer." 
        });
      }
    }

    // 4. ПОИСК И ОТПРАВКА НОВОЙ СТАТЬИ В ТЕЛЕГРАМ
    const { data: freshNews } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null) // Только те, что еще не постили
      .not('title', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!freshNews) {
      return NextResponse.json({ message: "No new articles to post yet." });
    }

    // Формируем сообщение
    const internalLink = `https://crypto-news-swart.vercel.app/news/${freshNews.news_id}`;
    const msg = `*${escapeMarkdown(freshNews.title)}*\n\n[Читать в терминале](${internalLink})`;

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
      // Записываем ID сообщения, чтобы потом его можно было удалить
      await supabase.from('telegram_posts')
        .update({ message_id: tgResult.result.message_id.toString() })
        .eq('id', freshNews.id);
      
      return NextResponse.json({ success: true, posted: freshNews.title });
    }

    return NextResponse.json({ error: "TG API Error", detail: tgResult }, { status: 500 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}