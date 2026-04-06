import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoNews } from '@/lib/getNews';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 1. Пытаемся забрать новые новости (уникальность заголовка спасет от дублей в БД)
    await getCryptoNews('EN', 0, 'ALL').catch(() => {});

    // 2. ЖЕСТКАЯ ПРОВЕРКА: когда был последний пост в ТГ (вообще любой)
    const { data: lastGlobalPost } = await supabase
      .from('telegram_posts')
      .select('created_at')
      .not('message_id', 'is', null) 
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle();

    if (lastGlobalPost) {
      const lastTime = new Date(lastGlobalPost.created_at).getTime();
      const diff = Date.now() - lastTime;
      const hour = 60 * 60 * 1000;

      if (diff < hour) {
        return NextResponse.json({ status: "Waiting", next_post_in: ((hour - diff)/60000).toFixed(0) + " min" });
      }
    }

    // 3. Берем одну новость для отправки
    const { data: post } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle();

    if (post && botToken && chatId) {
      const link = `https://crypto-news-swart.vercel.app/news/${post.news_id}`;
      // Экранируем символы для Markdown
      const cleanTitle = post.title.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
      const msg = `*${cleanTitle}*\n\n[Открыть в терминале](${link})`;
      
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(msg)}&parse_mode=MarkdownV2`);
      const tgData = await tgRes.json();

      if (tgData.ok) {
        // Записываем ID сообщения, чтобы больше не трогать эту новость
        const { error: upError } = await supabase
          .from('telegram_posts')
          .update({ message_id: tgData.result.message_id.toString() })
          .eq('id', post.id);
          
        if (upError) console.error("Update error:", upError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: "error" }); }
}