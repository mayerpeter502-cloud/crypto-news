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

    // Замените блок формирования сообщения в вашем route.ts на этот:
const { data: post, error: dbError } = await supabase
  .from('telegram_posts')
  .select('*')
  .is('message_id', null) 
  .limit(1)
  .maybeSingle();

if (dbError || !post) {
  return NextResponse.json({ success: true, message: 'No new posts to send' });
}

// Используем новые русскоязычные названия колонок из вашего SQL
const title = post.заголовок || `Новость ${post.news_id}`;
const link = post["текст ссылки"] || '';
const messageContent = `*${escapeMarkdown(title)}*\n\n${escapeMarkdown(link)}`;

    // 3. Отправляем в Telegram
    const tgResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageContent,
        parse_mode: 'MarkdownV2',
      }),
    });

    const tgResult = await tgResponse.json();

    if (!tgResult.ok) {
      throw new Error(`Telegram API error: ${tgResult.description}`);
    }

    // 4. Сохраняем полученный message_id в таблицу Supabase
    const { error: updateError } = await supabase
      .from('telegram_posts')
      .update({ message_id: tgResult.result.message_id.toString() })
      .eq('id', post.id);

    if (updateError) {
      console.error('Failed to update post status:', updateError);
    }

    return NextResponse.json({ success: true, message: 'Post sent successfully' });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}