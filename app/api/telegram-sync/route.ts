import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Используем значения по умолчанию, чтобы сборщик не выдавал ошибку "required"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const dynamic = 'force-dynamic';

export async function GET() {
  // Проверка ключей уже внутри функции, а не на этапе сборки
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !BOT_TOKEN) {
    return NextResponse.json({ error: 'Config missing' }, { status: 500 });
  }
  // ... далее ваш основной код ...

    // --- ЧАСТЬ 1: УДАЛЕНИЕ СТАРЫХ ПОСТОВ (48 ЧАСОВ) ---
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    const { data: oldPosts } = await supabase
      .from('telegram_posts')
      .select('*')
      .lt('created_at', fortyEightHoursAgo);

    if (oldPosts && oldPosts.length > 0) {
      for (const post of oldPosts) {
        try {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage?chat_id=${CHAT_ID}&message_id=${post.message_id}`);
        } catch (e) {
          console.error('Failed to delete message:', post.message_id);
        }
        await supabase.from('telegram_posts').delete().eq('id', post.id);
      }
    }

    // --- ЧАСТЬ 2: ПОСТИНГ НОВОЙ НОВОСТИ ---
    const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
    const newsData = await res.json();
    
    if (!newsData.Data || newsData.Data.length === 0) {
      return NextResponse.json({ success: true, message: 'No news found' });
    }

    const latestNews = newsData.Data[0];

    const { data: existing } = await supabase
      .from('telegram_posts')
      .select('news_id')
      .eq('news_id', latestNews.id)
      .maybeSingle(); // Используем maybeSingle вместо single, чтобы не было ошибки если новости нет

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
  } catch (err: any) {
    console.error('Sync Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}