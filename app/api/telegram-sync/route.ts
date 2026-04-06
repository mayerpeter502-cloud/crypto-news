import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoNews } from '@/lib/getNews';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 1. Всегда скачиваем свежак для бота (база сама отсечет дубликаты благодаря CONSTRAINT)
    await getCryptoNews('EN', 0, 'ALL').catch(() => {});

    // 2. Проверяем, когда был последний пост в ТГ
    const { data: lastPost } = await supabase
      .from('telegram_posts')
      .select('created_at')
      .not('message_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle();

    if (lastPost) {
      const diff = Date.now() - new Date(lastPost.created_at).getTime();
      if (diff < 60 * 60 * 1000) { // Если не прошел час - выходим
        return NextResponse.json({ message: "Sync OK. TG chill." });
      }
    }

    // 3. Берем ОДНУ новость, которую еще не постили
    const { data: post } = await supabase
      .from('telegram_posts')
      .select('*')
      .is('message_id', null)
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle();

    if (post && botToken && chatId) {
      const link = `https://crypto-news-swart.vercel.app/news/${post.news_id}`;
      const msg = encodeURIComponent(`*${post.title}*\n\n[Открыть в терминале](${link})`);
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${msg}&parse_mode=Markdown`);
      const tgData = await tgRes.json();

      if (tgData.ok) {
        await supabase.from('telegram_posts').update({ message_id: tgData.result.message_id.toString() }).eq('id', post.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: "error" }); }
}