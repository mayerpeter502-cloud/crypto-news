import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const aiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const cleanQuery = query?.trim() || '';

  if (!cleanQuery) return NextResponse.json({ error: 'No query' }, { status: 400 });

  try {
    const { data: articles, error: dbError } = await supabase
      .from('telegram_posts') 
      .select('*')
      .or(`title.ilike.%${cleanQuery}%,body.ilike.%${cleanQuery}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (dbError) throw dbError;

    let aiSummary = "";
    
    if (articles && articles.length > 0) {
      try {
        const context = articles.slice(0, 3).map(a => a.title).join(" | ");
        const prompt = `Context: ${context}. User query: ${cleanQuery}. 
                        Action: Write ONE short, aggressive, expert crypto-analysis sentence in English. 
                        No Russian, no intro phrases, just the verdict.`;

        const result = await aiModel.generateContent(prompt);
        aiSummary = result.response.text().trim();
      } catch (aiErr) {
        aiSummary = "Market volatility is high. Live intelligence feed active below.";
      }
    } else {
      aiSummary = `No direct signals for "${cleanQuery}" yet. Monitoring order books.`;
    }

    return NextResponse.json({ articles: articles || [], summary: aiSummary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}