import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Функция для получения свежих новостей из Google News RSS
async function fetchLiveNews(query: string) {
  try {
    // Ищем новости за последние 24 часа на английском
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+when:24h&hl=en-US&gl=US&ceid=US:en`;
    const response = await fetch(rssUrl);
    const xml = await response.text();
    
    // Простой парсинг заголовков и ссылок (для экономии времени не используем тяжелые библиотеки)
    const items = xml.split('<item>').slice(1, 11); // Берем первые 10 новостей
    return items.map(item => {
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      return {
        title: title.replace(' - Google News', ''),
        link: link,
        body: `Latest market intelligence regarding ${query}. Live signal detected via global nodes.`,
        created_at: new Date(pubDate).toISOString(),
        image_url: null // RSS не всегда дает картинки, подставим заглушку на фронте
      };
    });
  } catch (e) {
    console.error("Live search failed:", e);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const isExtended = searchParams.get('extended') === 'true';
  const cleanQuery = query?.trim() || '';

  if (!cleanQuery) return NextResponse.json({ error: 'No query' }, { status: 400 });

  try {
    let finalArticles = [];

    // 1. Сначала пробуем найти СВЕЖИЕ новости в сети (Live Search)
    const liveArticles = await fetchLiveNews(cleanQuery);
    
    if (liveArticles.length > 0) {
      finalArticles = liveArticles;
    } else {
      // 2. Если в сети ничего свежего нет, идем в твою БД (Back-up)
      const { data: dbArticles, error: dbError } = await supabase
        .from('telegram_posts') 
        .select('*')
        .or(`title.ilike.%${cleanQuery}%,body.ilike.%${cleanQuery}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (dbError) throw dbError;
      finalArticles = dbArticles || [];
    }

    // 3. Генерация AI-вердикта на основе найденного
    let aiSummary = "";
    if (finalArticles.length > 0) {
      try {
        const context = finalArticles.slice(0, 3).map(a => a.title).join(" | ");
        const prompt = `Context: ${context}. User query: ${cleanQuery}. 
                        Action: Write ONE short, aggressive, expert crypto-analysis sentence in English. 
                        No Russian, no intro phrases, just the verdict based on the latest signals.`;

        const result = await aiModel.generateContent(prompt);
        aiSummary = result.response.text().trim();
      } catch (aiErr) {
        aiSummary = "Market intelligence feed active. Analyzing volatility vectors.";
      }
    } else {
      aiSummary = `No direct signals for "${cleanQuery}" detected in live or local nodes.`;
    }

    return NextResponse.json({ 
      articles: finalArticles, 
      summary: aiSummary,
      source: liveArticles.length > 0 ? 'live' : 'database' 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}