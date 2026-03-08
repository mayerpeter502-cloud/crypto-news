import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 1. Убираем восклицательные знаки, чтобы билд не падал без ключей
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Проверка наличия переменных внутри функции
    if (!supabaseUrl || !BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json({ error: "Missing configuration" }, { status: 500 });
    }

    // --- ЧАСТЬ 1: УДАЛЕНИЕ СТАРЫХ ПОСТОВ ---
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: oldPosts } = await supabase
      .from('telegram_posts')
      .select('*')
      .lt('created_at', fortyEightHoursAgo);

    if (oldPosts && oldPosts.length > 0) {
      for (const post of oldPosts) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage?chat_id=${CHAT_ID}&message_id=${post.message_id}`);
        await supabase.from('telegram_posts').delete().eq('id', post.id);
      }
    }

    // --- ЧАСТЬ 2: ПОСТИНГ НОВОЙ НОВОСТИ ---
    const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
    const newsData = await res.json();
    
    if (!newsData.Data || newsData.Data.length === 0) {
      return NextResponse.json({ success: true, message: "No news" });
    }

    const latestNews = newsData.Data[0];

    // Проверяем дубликаты
    const { data: existing } = await supabase
      .from('telegram_posts')
      .select('news_id')
      .eq('news_id', latestNews.id)
      .maybeSingle();

    if (!existing) {
      const messageText = `*${latestNews.title.replace(/[*_`]/g, '')}*\n\n${latestNews.body.substring(0, 150).replace(/[*_`]/g, '')}...`;
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
  } catch (error: any) {
    // Здесь NextResponse допустим, так как это выход из функции
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}