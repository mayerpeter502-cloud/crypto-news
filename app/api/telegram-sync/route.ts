import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function GET() {
  try {
    // --- ЧАСТЬ 1: УДАЛЕНИЕ СТАРЫХ ПОСТОВ (48 ЧАСОВ) ---
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    const { data: oldPosts } = await supabase
      .from('telegram_posts')
      .select('*')
      .lt('created_at', fortyEightHoursAgo);

    if (oldPosts) {
      for (const post of oldPosts) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage?chat_id=${CHAT_ID}&message_id=${post.message_id}`);
        await supabase.from('telegram_posts').delete().eq('id', post.id);
      }
    }

    // --- ЧАСТЬ 2: ПОСТИНГ НОВОЙ НОВОСТИ ---
    const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
    const { Data: news } = await res.json();
    const latestNews = news[0]; // Берем самую последнюю

    // Проверяем, нет ли её уже в базе
    const { data: existing } = await supabase
      .from('telegram_posts')
      .select('news_id')
      .eq('news_id', latestNews.id)
      .single();

    if (!existing) {
      const messageText = `*${latestNews.title}*\n\n${latestNews.body.substring(0, 150)}...`;
      const url = `https://crypto-news-swart.vercel.app/news/${latestNews.id}`;

      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: messageText,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: "Читать на сайте", url: url }]]
          }
        })
      });

      const tgData = await tgRes.json();
      
      if (tgData.ok) {
        await supabase.from('telegram_posts').insert({
          news_id: latestNews.id,
          message_id: tgData.result.message_id
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err });
  }
}