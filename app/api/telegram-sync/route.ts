import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoNews } from '@/lib/getNews';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // --- 1. ОЧИСТКА МУСОРА (Удаляем новости старше 24 часов) ---
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('telegram_posts')
      .delete()
      .lt('created_at', dayAgo);

    // --- 2. ОБНОВЛЕНИЕ БАЗЫ (Загружаем свежие новости) ---
// Оборачиваем в try-catch, чтобы ошибка дубликатов не ломала весь роут
try {
  await getCryptoNews('EN', 0, 'ALL');
} catch (error) {
  console.log("Дубликаты новостей пропущены");
}

    // --- 3. ПРОВЕРКА ТАЙМЕРА (Замок на 1 час для постов в ТГ) ---
    const { data: settings } = await supabase
      .from('bot_settings')
      .select('last_tg_post_at')
      .eq('id', 1)
      .single();

    if (settings?.last_tg_post_at) {
      const lastPostTime = new Date(settings.last_tg_post_at).getTime();
      const diff = Date.now() - lastPostTime;
      const hour = 60 * 60 * 1000;

      if (diff < hour) {
        // Если час еще не прошел — просто выходим, база уже обновлена и очищена
        return NextResponse.json({ 
          status: "Wait", 
          next_post_in_min: ((hour - diff) / 60000).toFixed(0) 
        });
      }
    }

    // --- 4. ВЫБОР И ОТПРАВКА НОВОСТИ (Раз в час) ---
    const { data: post } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle();

    if (post && botToken && chatId) {
      const link = `https://crypto-news-swart.vercel.app/news/${post.news_id}`;
      // Экранируем спецсимволы для корректного отображения в Telegram MarkdownV2
      const cleanTitle = post.title.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
      const msg = `*${cleanTitle}*\n\n[Открыть в терминале](${link})`;
      
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(msg)}&parse_mode=MarkdownV2`);
      const tgData = await tgRes.json();

      if (tgData.ok) {
        // ОБНОВЛЯЕМ ТАЙМЕР (Записываем текущее время как время последнего поста)
        await supabase.from('bot_settings')
          .update({ last_tg_post_at: new Date().toISOString() })
          .eq('id', 1);
          
        // Помечаем новость в базе, чтобы не отправить повторно
        await supabase.from('telegram_posts')
          .update({ message_id: tgData.result.message_id.toString() })
          .eq('id', post.id);
      }
    }

    return NextResponse.json({ success: true, message: "Cleaned, Synced and Processed" });
  } catch (e) { 
    console.error("Critical error in route:", e);
    return NextResponse.json({ error: "Internal Server Error" }); 
  }
}