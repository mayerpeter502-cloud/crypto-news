import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoNews } from '@/lib/getNews';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // --- 1. СИНХРОННОЕ УДАЛЕНИЕ (TG + БД) ---
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Находим посты, которые пора удалить
    const { data: expiredPosts } = await supabase
      .from('telegram_posts')
      .select('id, message_id')
      .lt('created_at', dayAgo)
      .not('message_id', 'is', null);

    if (expiredPosts && expiredPosts.length > 0 && botToken && chatId) {
      console.log(`Удаляем ${expiredPosts.length} старых постов из TG...`);
      for (const post of expiredPosts) {
        try {
          // Вызываем метод deleteMessage в Telegram
          await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage?chat_id=${chatId}&message_id=${post.message_id}`);
        } catch (err) {
          console.error("Ошибка при удалении в TG:", err);
        }
      }
    }

    // Теперь удаляем их из базы
    await supabase.from('telegram_posts').delete().lt('created_at', dayAgo);

    // --- 2. ОБНОВЛЕНИЕ БАЗЫ ---
    // Вызываем функцию, которая подгрузит новости и сделает upsert (без засоров)
    await getCryptoNews('EN', 0, 'ALL');

    // --- 3. ТАЙМЕР (1 ЧАС) ---
    const { data: settings } = await supabase
      .from('bot_settings')
      .select('last_tg_post_at')
      .eq('id', 1)
      .single();

    if (settings?.last_tg_post_at) {
      const diff = Date.now() - new Date(settings.last_tg_post_at).getTime();
      if (diff < 60 * 60 * 1000) {
        return NextResponse.json({ status: "Wait", message: "Cooldown active (1h)" });
      }
    }

    // --- 4. АВТОПОСТИНГ НОВОЙ НОВОСТИ ---
    const { data: post } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null) // Берем ту, что еще не отправлена
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (post && botToken && chatId) {
      const link = `https://crypto-news-swart.vercel.app/news/${post.news_id}`;
      const cleanTitle = post.title.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
      const msg = `*${cleanTitle}*\n\n[Открыть в терминале](${link})`;
      
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(msg)}&parse_mode=MarkdownV2`);
      const tgData = await tgRes.json();

      if (tgData.ok) {
        // Запоминаем время поста
        await supabase.from('bot_settings').update({ 
          last_tg_post_at: new Date().toISOString() 
        }).eq('id', 1);

        // ВАЖНО: Записываем ID сообщения из ТГ вместо NULL
        await supabase.from('telegram_posts').update({ 
          message_id: tgData.result.message_id.toString() 
        }).eq('id', post.id);
        
        console.log("Новость успешно отправлена и ID сохранен.");
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Ошибка роута:", e);
    return NextResponse.json({ error: "Internal Error" });
  }
}