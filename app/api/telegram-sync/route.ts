import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function escapeMarkdown(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!supabaseUrl || !supabaseKey || !botToken || !chatId) {
      console.error('Missing environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Получаем один неопубликованный пост
    // Ищем пост, у которого еще нет message_id (значит, он не отправлен)
const { data: post, error: dbError } = await supabase
  .from('telegram_posts')
  .select('*')
  .is('message_id', null) 
  .limit(1)
  .single();

if (dbError || !post) {
  return NextResponse.json({ success: true, message: 'No new posts to send' });
}

// Отправляем news_id как текст (пока нет колонки с текстом новости)
const message = `Новость ID: ${escapeMarkdown(post.news_id)}`;

    // 2. Формируем текст (предположим, в таблице есть колонки title и link)
    const message = `*${escapeMarkdown(post.title)}*\n\n${escapeMarkdown(post.link || '')}`;

    // 3. Отправляем в Telegram
    const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'MarkdownV2',
      }),
    });

    const tgResult = await tgResponse.json();

    if (!tgResult.ok) {
      throw new Error(`Telegram API error: ${tgResult.description}`);
    }

    // 4. Помечаем пост как опубликованный в БД
    await supabase
      .from('telegram_posts')
      .update({ is_published: true })
      .eq('id', post.id);

    return NextResponse.json({ success: true, message: 'Post sent successfully' });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}