import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
const INTERVAL_MS = 2.5 * 60 * 60 * 1000; // 2.5 часа
const DELETE_AFTER_MS = 48 * 60 * 60 * 1000; // 48 часов

function escapeMarkdown(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // --- БЛОК 1: УДАЛЕНИЕ СТАРЫХ ПОСТОВ ИЗ TG И DB ---
    const expirationDate = new Date(Date.now() - DELETE_AFTER_MS).toISOString();
    
    // Ищем записи старше 48 часов, которые были отправлены (есть message_id)
    const { data: expiredPosts } = await supabase
      .from('telegram_posts')
      .select('id, message_id')
      .not('message_id', 'is', null)
      .lt('created_at', expirationDate);

    if (expiredPosts && expiredPosts.length > 0) {
      for (const post of expiredPosts) {
        // Удаляем из Telegram
        await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, message_id: parseInt(post.message_id) }),
        }).catch(e => console.error("TG Delete Error:", e));

        // Удаляем из базы данных
        await supabase.from('telegram_posts').delete().eq('id', post.id);
      }
    }

    // --- БЛОК 2: ПРОВЕРКА ИНТЕРВАЛА ДЛЯ НОВОГО ПОСТА ---
    const { data: lastPost } = await supabase
      .from('telegram_posts')
      .select('created_at')
      .not('message_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastPost && (Date.now() - new Date(lastPost.created_at).getTime() < INTERVAL_MS)) {
      return NextResponse.json({ message: 'Too early for next post' });
    }

    // --- БЛОК 3: ОТПРАВКА НОВОЙ НОВОСТИ ---
    const { data: queuePost } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!queuePost) {
      // Подгружаем свежие новости в очередь, если она пуста
      const cryptoRes = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      const cryptoData = await cryptoRes.json();
      for (const news of cryptoData.Data.slice(0, 10)) {
        const { data: exists } = await supabase.from('telegram_posts').select('id').eq('news_id', news.id.toString()).maybeSingle();
        if (!exists) {
          await supabase.from('telegram_posts').insert({
            news_id: news.id.toString(),
            заголовок: news.title,
            "текст ссылки": news.url
          });
        }
      }
      return NextResponse.json({ message: 'Queue updated' });
    }

    const internalLink = `https://crypto-news-swart.vercel.app/news/${queuePost.news_id}`;
    const messageContent = `*${escapeMarkdown(queuePost.заголовок)}*\n\n[Читать на сайте](${escapeMarkdown(internalLink)})`;

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: messageContent, parse_mode: 'MarkdownV2' }),
    });

    const tgResult = await tgRes.json();
    if (tgResult.ok) {
      await supabase.from('telegram_posts').update({ message_id: tgResult.result.message_id.toString() }).eq('id', queuePost.id);
      return NextResponse.json({ success: true, message: 'Posted and Cleaned' });
    }

    return NextResponse.json({ error: 'Post failed' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}