import { getAuthUser } from "@/lib/auth";
import { geminiGenerate } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

// POST /api/ai/agronomist — text (+ optional photo) plant/animal health consultation.
// Body: { question: string, imageBase64?: string, imageMimeType?: string }
// Public-ish: works for logged-in users; falls back to a generic session for guests.
export async function POST(request) {
  const authUser = getAuthUser(request);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Yanlış JSON formatı" }, { status: 400 });
  }

  const { question, imageBase64, imageMimeType } = body;
  if (!question && !imageBase64) {
    return Response.json({ error: "Sual və ya şəkil tələb olunur" }, { status: 422 });
  }

  const prompt = `Sən təcrübəli Azərbaycan dilində danışan AI Aqronomsan. Fermerə bitki/heyvan sağlamlığı üzrə peşəkar məsləhət ver.
Sual/Şikayət: "${question || "(yalnız şəkil təqdim edilib, vizual analiz et)"}"

Cavabını YALNIZ bu JSON formatında qaytar (əlavə mətn yazma):
{
  "diagnosis": "ehtimal olunan problemin adı",
  "confidencePercent": 0-100 arası ədəd,
  "causes": ["səbəb 1", "səbəb 2"],
  "treatment": ["tövsiyə olunan addım 1", "addım 2"],
  "recommendedProducts": ["uyğun dərman/gübrə adı"],
  "needsExpertConsult": true/false,
  "summary": "1-2 cümləlik qısa xülasə fermerə birbaşa müraciətlə"
}`;

  try {
    const raw = await geminiGenerate({ prompt, imageBase64, imageMimeType });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: raw };

    if (authUser) {
      await prisma.auditLog.create({
        data: {
          userId: authUser.sub,
          action: "AI_AGRONOMIST_CONSULT",
          entity: "AIConsult",
          metadata: { question, diagnosis: parsed.diagnosis || null },
        },
      }).catch(() => {});
    }

    return Response.json({ result: parsed });
  } catch (err) {
    return Response.json({ error: err.message || "AI xətası" }, { status: 502 });
  }
}
