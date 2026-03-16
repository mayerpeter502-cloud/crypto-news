import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  try {
    // 1. Получаем ВООБЩЕ ВСЕ записи из очереди, у которых есть message_id
    const { data: allPosts } = await supabase
      .from('telegram_posts')
      .select('id, message_id');

    let deletedCount = 0;

    if (allPosts && allPosts.length > 0) {
      for (const item of allPosts) {
        if (item.message_id) {
          // Удаляем из Telegram
          await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, message_id: parseInt(item.message_id) }),
          });
          deletedCount++;
        }
      }
    }

    // 2. ПОЛНАЯ ОЧИСТКА ТАБЛИЦ (удаляем всё без условий по дате)
    await supabase.from('telegram_posts').delete().neq('id', 0); // Удалить все id не равные 0
    await supabase.from('news').delete().neq('id', 0); 

    return NextResponse.json({ 
      message: "БАЗА И ТЕЛЕГРАМ ПОЛНОСТЬЮ ОЧИЩЕНЫ", 
      tg_messages_deleted: deletedCount 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}