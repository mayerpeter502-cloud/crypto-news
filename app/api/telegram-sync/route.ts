import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoNews } from '@/lib/getNews';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const mode = searchParams.get('mode'); // Получаем режим (buffer или пусто)

    // 0. Проверка безопасности
    if (key !== '9)hSyy5K') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // --- ВЕТКА 1: БЫСТРОЕ ОБНОВЛЕНИЕ ДЛЯ ТОРГОВОГО БОТА (каждые 5 мин) ---
    if (mode === 'buffer') {
      // Получаем новости (функция getCryptoNews должна уметь возвращать данные или делать вставку)
      // Для экономии ресурсов запрашиваем минимум данных
      const news = await getCryptoNews('EN', 1, 'ALL'); 
      
      // Предположим, news - это массив последних новостей из твоей функции
      // Мы просто дублируем самую свежую в bot_news_buffer
      // ВАЖНО: Убедись, что getCryptoNews возвращает массив или объект новости
      if (news && news.length > 0) {
          const latest = news[0];
          await supabase.from('bot_news_buffer').insert({
              content: latest.title,
              sentiment: latest.sentiment || 'NEUTRAL' // Если у тебя уже есть оценка ИИ
          });
      }

      return NextResponse.json({ success: true, target: "bot_buffer" });
    }

    // --- ВЕТКА 2: ПОЛНАЯ ЛОГИКА ДЛЯ TELEGRAM (раз в час) ---
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 1. Очистка старого (только раз в час, чтобы не грузить базу)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: expiredPosts } = await supabase
      .from('telegram_posts')
      .select('id, message_id')
      .lt('created_at', dayAgo)
      .not('message_id', 'is', null);

    if (expiredPosts && expiredPosts.length > 0 && botToken && chatId) {
      for (const post of expiredPosts) {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage?chat_id=${chatId}&message_id=${post.message_id}`);
        } catch (err) { console.error("TG Delete Err:", err); }
      }
    }
    await supabase.from('telegram_posts').delete().lt('created_at', dayAgo);

    // 2. Основное обновление новостей для сайта и ТГ
    await getCryptoNews('EN', 0, 'ALL');

    // 3. Проверка кулдауна ТГ (1 час)
    const { data: settings } = await supabase.from('bot_settings').select('last_tg_post_at').eq('id', 1).single();
    if (settings?.last_tg_post_at) {
      const diff = Date.now() - new Date(settings.last_tg_post_at).getTime();
      if (diff < 60 * 60 * 1000) {
        return NextResponse.json({ status: "Wait", message: "Cooldown active" });
      }
    }

    // 4. Постинг в Telegram
    const { data: post } = await supabase.from('telegram_posts').select('*').is('message_id', null).order('created_at', { ascending: false }).limit(1).maybeSingle();

    if (post && botToken && chatId) {
      const link = `https://crypto-news-swart.vercel.app/news/${post.news_id}`;
      const cleanTitle = post.title.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
      const msg = `*${cleanTitle}*\n\n[Открыть в терминале](${link})`;
      
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(msg)}&parse_mode=MarkdownV2`);
      const tgData = await tgRes.json();

      if (tgData.ok) {
        await supabase.from('bot_settings').update({ last_tg_post_at: new Date().toISOString() }).eq('id', 1);
        await supabase.from('telegram_posts').update({ message_id: tgData.result.message_id.toString() }).eq('id', post.id);
      }
    }

    return NextResponse.json({ success: true, target: "telegram" });

  } catch (e) {
    console.error("Ошибка роута:", e);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}