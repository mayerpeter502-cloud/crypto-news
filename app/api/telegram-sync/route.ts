import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoNews } from '@/lib/getNews';

export const dynamic = 'force-dynamic';

// --- НОВАЯ ФУНКЦИЯ ОЦЕНКИ КОНТЕНТА ---
function analyzeSentiment(title: string): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
  const text = title.toLowerCase();
  
  // 1. ГЛОБАЛЬНЫЕ ТЕМЫ (Влияют на BTC без прямого упоминания)
  const globalCrisisWords = ['war', 'hack', 'exploit', 'fed', 'feds', 'sec', 'ban', 'inflation', 'cpi', 'conflict'];
  const isGlobalEvent = globalCrisisWords.some(word => text.includes(word));

  // 2. ПРОВЕРКА НА БИТКОИН
  const isBitcoinRelated = text.includes('btc') || text.includes('bitcoin');

  // Если это не глобальное ЧП и не новость про Биткоин — помечаем как нейтральную
  if (!isGlobalEvent && !isBitcoinRelated) return 'NEUTRAL';

  // 3. Ключевые слова для позитива
  const positiveWords = [
    'bullish', 'surge', 'pump', 'growth', 'gain', 'support', 'partnership', 
    'listing', 'buy', 'adoption', 'profit', 'up', 'breakout', 'ath', 'rally'
  ];
  
  // 4. Ключевые слова для негатива
  const negativeWords = [
    'bearish', 'drop', 'dump', 'crash', 'fell', 'scam', 'hack', 'lawsuit', 
    'ban', 'regulation', 'sell', 'liquidated', 'down', 'resistance', 'sec'
  ];

  // Сначала проверяем на негатив для безопасности
  if (negativeWords.some(word => text.includes(word))) return 'NEGATIVE';
  if (positiveWords.some(word => text.includes(word))) return 'POSITIVE';
  
  return 'NEUTRAL';
}

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
        } catch (err) { console.error("Ошибка удаления из ТГ:", err); }
      }
    }
    await supabase.from('telegram_posts').delete().lt('created_at', dayAgo);

    // --- 2. ОБНОВЛЕНИЕ ДАННЫХ ---
    if (mode === 'buffer') {
  const news = await getCryptoNews('EN', 1, 'ALL'); 
  if (news && news.length > 0) {
      const latest = news[0];

      // ПРОВЕРКА: Есть ли уже новость с таким заголовком в базе?
      const { data: existing } = await supabase
          .from('bot_news_buffer')
          .select('id')
          .eq('content', latest.title)
          .maybeSingle();

      // Вставляем только если новости еще нет в таблице
      if (!existing) {
          const sentiment = analyzeSentiment(latest.title);
          await supabase.from('bot_news_buffer').insert({
              content: latest.title,
              sentiment: sentiment 
          });
      }
  }
  return NextResponse.json({ success: true, target: "bot_buffer" });
}

    await getCryptoNews('EN', 0, 'ALL');

    // --- 3. ПОСТИНГ В TELEGRAM (РАЗ В ЧАС) ---
    const { data: settings } = await supabase.from('bot_settings').select('last_tg_post_at').eq('id', 1).single();
    if (settings?.last_tg_post_at) {
      const diff = Date.now() - new Date(settings.last_tg_post_at).getTime();
      if (diff < 60 * 60 * 1000) {
        return NextResponse.json({ status: "Wait", message: "Cooldown active" });
      }
    }

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