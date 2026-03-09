import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const POST_INTERVAL_MS = 1.5 * 60 * 60 * 1000; 
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

    // 1. Очистка (48 часов)
    const expirationDate = new Date(Date.now() - DELETE_AFTER_MS).toISOString();
    await supabase.from('telegram_posts').delete().lt('created_at', expirationDate);

    // 2. Проверка интервала 1.5 часа
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
        return NextResponse.json({ message: "Interval not met" });
      }
    }

    // 3. Проверяем наличие новостей в очереди
    let { data: queuePost } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .not('title', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    // 4. Если в очереди мало новостей (меньше 5) или она пуста — догружаем 20 новых
    if (!queuePost) {
      const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
      const cryptoData = await res.json();
      
      if (cryptoData.Data && Array.isArray(cryptoData.Data)) {
        // Берем 20 новостей для запаса на сутки+
        for (const n of cryptoData.Data.slice(0, 20)) {
          await supabase.from('telegram_posts').upsert({
            news_id: n.id.toString(),
            title: n.title,
            link: n.url
          }, { onConflict: 'news_id' });
        }
      }
      return NextResponse.json({ message: "Queue replenished with 20 news" });
    }

    // 5. Отправка в TG
    const internalLink = `https://crypto-news-swart.vercel.app/news/${queuePost.news_id}`;
    const msg = `*${escapeMarkdown(queuePost.title)}*\n\n[Читать на сайте](${internalLink})`;

    const tgRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
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

    return NextResponse.json({ error: "TG Error" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}