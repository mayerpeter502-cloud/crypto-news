import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoNews } from '@/lib/getNews';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const mode = searchParams.get('mode');

    if (key !== '9)hSyy5K') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // --- 1. АВТО-ОЧИСТКА СТАРЫХ ПОСТОВ (24 ЧАСА) ---
    // Это гарантирует, что база не будет переполняться
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Сначала ищем посты в ТГ, которые пора удалить из канала
    const { data: expiredPosts } = await supabase
      .from('telegram_posts')
      .select('id, message_id')
      .lt('created_at', dayAgo)
      .not('message_id', 'is', null);

    if (expiredPosts && expiredPosts.length > 0 && botToken && chatId) {
      for (const post of expiredPosts) {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage?chat_id=${chatId}&message_id=${post.message_id}`);
        } catch (err) { console.error("Ошибка удаления из ТГ:", err); }
      }
    }

    // Удаляем всё старое из базы (и опубликованное, и нет)
    await supabase.from('telegram_posts').delete().lt('created_at', dayAgo);


    // --- 2. ОБНОВЛЕНИЕ ДАННЫХ ---
    if (mode === 'buffer') {
      // Для торгового бота (каждые 5 мин)
      const news = await getCryptoNews('EN', 1, 'ALL'); 
      if (news && news.length > 0) {
          const latest = news[0];
          await supabase.from('bot_news_buffer').insert({
              content: latest.title,
              sentiment: latest.sentiment || 'NEUTRAL'
          });
      }
      return NextResponse.json({ success: true, target: "bot_buffer" });
    }

    // Основное обновление для ТГ и сайта
    await getCryptoNews('EN', 0, 'ALL');


    // --- 3. ПОСТИНГ В TELEGRAM (РАЗ В ЧАС) ---
    const { data: settings } = await supabase.from('bot_settings').select('last_tg_post_at').eq('id', 1).single();
    if (settings?.last_tg_post_at) {
      const diff = Date.now() - new Date(settings.last_tg_post_at).getTime();
      if (diff < 60 * 60 * 1000) {
        return NextResponse.json({ status: "Wait", message: "Cooldown active" });
      }
    }

    // Берем самую свежую новость, которая еще не постилась
    const { data: post } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (post && botToken && chatId) {
      const link = `https://crypto-news-swart.vercel.app/news/${post.news_id}`;
      const cleanTitle = post.title.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
      const msg = `*${cleanTitle}*\\n\\n[Открыть в терминале](${link})`;
      
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(msg)}&parse_mode=MarkdownV2`);
      const tgData = await tgRes.json();

      if (tgData.ok) {
        // Обновляем время последнего поста
        await supabase.from('bot_settings').update({ last_tg_post_at: new Date().toISOString() }).eq('id', 1);
        // Записываем ID сообщения, чтобы через 24 часа скрипт его удалил
        await supabase.from('telegram_posts').update({ message_id: tgData.result.message_id.toString() }).eq('id', post.id);
      }
    }

    return NextResponse.json({ success: true, target: "telegram" });

  } catch (e) {
    console.error("Ошибка роута:", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}