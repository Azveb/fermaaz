import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  const authUser = getAuthUser(request);
  if (!authUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await request.json();
  // Support both {description} (modal) and {title, price, region} (inline assist)
  const description = body.description || body.title || '';
  const category = body.category || '';
  const price = body.price || '';
  const region = body.region || '';
  if (!description) return Response.json({ error: 'description required' }, { status: 422 });
  
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) return Response.json({ error: 'AI xidməti konfiqurasiya edilməyib' }, { status: 503 });
  
  const priceHint = price ? ` Cari qiymət: ${price} AZN.` : '';
  const regionHint = region ? ` Region: ${region}.` : '';
  const prompt = `Sen Azərbaycan kənd təsərrüfatı marketplace-in AI köməkçisisən. İstifadəçi bu məhsulu satmaq istəyir: "${description}" (Kateqoriya: ${category || 'ümumi'}).${priceHint}${regionHint} 
  
  Azerbaycan dilinde JSON formatında cavab ver:
  {
    "titleAz": "cəlbedici başlıq (maks 80 simvol)",
    "descriptionAz": "tam təsvir (200-400 simvol), məhsulun üstünlükləri, istifadəsi, keyfiyyəti",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "suggestedPrice": 0
  }
  
  Yalnız JSON qaytarı, başqa heç nə yazma.`;
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    
    if (!res.ok) {
      const err = await res.json();
      console.error('Gemini error:', err);
      return Response.json({ error: 'AI xidməti xəta verdi' }, { status: 503 });
    }
    
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    // Alias for backward-compat (handleAiAssist uses .description)
    if (parsed.descriptionAz && !parsed.description) parsed.description = parsed.descriptionAz;
    return Response.json(parsed);
  } catch (e) {
    console.error('AI suggest error:', e);
    return Response.json({ error: 'AI cavab emal edilə bilmədi' }, { status: 500 });
  }
}
