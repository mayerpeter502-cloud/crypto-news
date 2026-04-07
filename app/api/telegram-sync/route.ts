// route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoNews } from '@/lib/getNews';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 1. ОЧИСТКА (Храним новости ровно 24 часа для ТГ-ссылок)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('telegram_posts').delete().lt('created_at', dayAgo);

    // 2. ОБНОВЛЕНИЕ БАЗЫ (Теперь не тормозит на дубликатах)
    await getCryptoNews('EN', 0, 'ALL');

    // 3. ТАЙМЕР (Замок 1 час для Telegram)
    const { data: settings } = await supabase.from('bot_settings').select('last_tg_post_at').eq('id', 1).single();

    if (settings?.last_tg_post_at) {
      const diff = Date.now() - new Date(settings.last_tg_post_at).getTime();
      if (diff < 60 * 60 * 1000) {
        return NextResponse.json({ status: "Wait", message: "DB updated, but TG cooldown active" });
      }
    }

    // 4. ОТПРАВКА В ТГ
    const { data: post } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle();

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

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Error" });
  }
}