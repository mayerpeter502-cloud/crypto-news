import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ТЗ: Добавляем force-dynamic, чтобы Vercel не пытался собрать это как статику
export const dynamic = 'force-dynamic';

// Функция для очистки спецсимволов (MarkdownV2 требует экранирования)
function escapeMarkdown(text: string) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // ТЗ: Проверка переменных в рантайме без "!" (non-null assertion)
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Пример логики (замените на вашу выборку из CryptoCompare/DB)
    // const { data, error } = await supabase.from('telegram_posts').select('*')...

    // Пример отправки в Telegram
    // const message = escapeMarkdown("Ваш текст новости");
    // await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage...`);

    return NextResponse.json({ success: true, message: 'Sync completed' });
  } catch (error: any) {
    console.error('Sync error:', error);
    // ТЗ: Всегда возвращаем NextResponse в блоке catch
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}