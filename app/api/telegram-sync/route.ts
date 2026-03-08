import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const POST_INTERVAL_MS = 1.5 * 60 * 60 * 1000; 

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Проверяем время последнего успешного поста
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
        return NextResponse.json({ message: "Too early for next post" });
      }
    }

    // 2. Берем СЛЕДУЮЩУЮ валидную новость из очереди
    const { data: nextNews } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .not('title', 'is', null)
      .not('news_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!nextNews) return NextResponse.json({ message: "Queue is empty" });

    // 3. Отправка (используем news_id для ссылки)
    const internalLink = `https://crypto-news-swart.vercel.app/news/${nextNews.news_id}`;
    const text = `*${nextNews.title.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')}*\n\n[Читать на сайте](${internalLink})`;

    const tgRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'MarkdownV2',
      }),
    });

    const result = await tgRes.json();
    if (result.ok) {
      await supabase.from('telegram_posts')
        .update({ message_id: result.result.message_id.toString() })
        .eq('id', nextNews.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: result.description }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}