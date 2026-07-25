import { prisma } from "@/lib/prisma";
import { geminiGenerate } from "@/lib/gemini";

// GET /api/ai/price-index?categoryId=&region= — public: average market price
// for a category (optionally scoped to a region), computed from active
// listings, plus a short AI narrative if GOOGLE_API_KEY is configured.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const region = searchParams.get("region");

  if (!categoryId) {
    return Response.json({ error: "categoryId tələb olunur" }, { status: 422 });
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return Response.json({ error: "Kateqoriya tapılmadı" }, { status: 404 });

  const products = await prisma.product.findMany({
    where: { categoryId, status: "ACTIVE", ...(region ? { region } : {}) },
    select: { price: true, region: true, titleAz: true },
  });

  if (!products.length) {
    return Response.json({
      category: category.name,
      region: region || null,
      sampleSize: 0,
      message: "Bu kateqoriyada hazırda kifayət qədər aktiv elan yoxdur",
    });
  }

  const prices = products.map((p) => Number(p.price)).sort((a, b) => a - b);
  const sum = prices.reduce((a, b) => a + b, 0);
  const avg = sum / prices.length;
  const min = prices[0];
  const max = prices[prices.length - 1];
  const median = prices[Math.floor(prices.length / 2)];

  const stats = {
    category: category.name,
    region: region || null,
    sampleSize: prices.length,
    avgPrice: Number(avg.toFixed(2)),
    minPrice: min,
    maxPrice: max,
    medianPrice: median,
  };

  if (!process.env.GOOGLE_API_KEY) {
    return Response.json(stats);
  }

  try {
    const narrative = await geminiGenerate({
      prompt: `Sən FermerMarket üçün bazar analitikasısan. Bu statistikaya əsasən Azərbaycan dilində 2-3 cümləlik qısa, faydalı bazar şərhi yaz (fermerə "bu qiymətə sat" tövsiyəsi kimi): kateqoriya="${stats.category}", bölgə="${stats.region || "bütün ölkə"}", nümunə sayı=${stats.sampleSize}, orta qiymət=${stats.avgPrice} AZN, minimum=${stats.minPrice} AZN, maksimum=${stats.maxPrice} AZN, median=${stats.medianPrice} AZN. Yalnız şərhi yaz, başlıq və ya əlavə mətn yazma.`,
      maxOutputTokens: 300,
    });
    return Response.json({ ...stats, aiInsight: narrative });
  } catch (err) {
    // AI narrative is a bonus — never fail the whole endpoint if it errors
    return Response.json({ ...stats, aiInsight: null });
  }
}
