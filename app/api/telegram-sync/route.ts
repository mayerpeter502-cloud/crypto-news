import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
const INTERVAL_MS = 2.5 * 60 * 60 * 1000; 
const DELETE_AFTER_MS = 48 * 60 * 60 * 1000; 

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

    // 1. УДАЛЕНИЕ: Чистим старые посты в ТГ и БД
    const expirationDate = new Date(Date.now() - DELETE_AFTER_MS).toISOString();
    const { data: expired } = await supabase
      .from('telegram_posts')
      .select('id, message_id')
      .not('message_id', 'is', null)
      .lt('created_at', expirationDate);

    if (expired && expired.length > 0) {
      for (const post of expired) {
        await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, message_id: post.message_id }),
        }).catch(() => {});
        await supabase.from('telegram_posts').delete().eq('id', post.id);
      }
    }

    // 2. ИНТЕРВАЛ: Проверяем время последнего успешного поста
    const { data: lastPost } = await supabase
      .from('telegram_posts')
      .select('created_at')
      .not('message_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastPost && (Date.now() - new Date(lastPost.created_at).getTime() < INTERVAL_MS)) {
      return NextResponse.json({ message: 'Wait for 2.5h interval' });
    }

    // 3. ОЧЕРЕДЬ: Берем новость, которая еще не была отправлена
    let { data: queuePost } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!queuePost) {
      // Если очередь пуста, подгружаем свежее
      const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      const cryptoData = await res.json();
      for (const n of cryptoData.Data.slice(0, 10)) {
        const { data: ex } = await supabase.from('telegram_posts').select('id').eq('news_id', n.id.toString()).maybeSingle();
        if (!ex) {
          await supabase.from('telegram_posts').insert({
            news_id: n.id.toString(),
            title: n.title,
            link: n.url
          });
        }
      }
      return NextResponse.json({ message: 'Queue updated from API' });
    }

    // 4. ОТПРАВКА: Ссылка ведет на ваш домен /news/[id]
    const internalLink = `https://crypto-news-swart.vercel.app/news/${queuePost.news_id}`;
    const msg = `*${escapeMarkdown(queuePost.title || 'Crypto News')}*\n\n[Читать на сайте](${escapeMarkdown(internalLink)})`;

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'MarkdownV2' }),
    });

    const tgResult = await tgRes.json();
    if (tgResult.ok) {
      await supabase.from('telegram_posts')
        .update({ message_id: tgResult.result.message_id.toString() })
        .eq('id', queuePost.id);
      return NextResponse.json({ success: true, message: 'Posted' });
    }

    return NextResponse.json({ error: 'Telegram API error' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}