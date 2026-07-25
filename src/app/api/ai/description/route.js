import { getAuthUser, requireRole } from "@/lib/auth";
import { geminiGenerate } from "@/lib/gemini";

// POST /api/ai/description — AI generates a product title/description/SEO text/hashtags
// Used by Farmer/Store dashboards when creating a listing.
export async function POST(request) {
  const authUser = getAuthUser(request);
  const denied = requireRole(authUser, ["FARMER", "STORE", "ADMIN", "SUPER_ADMIN"]);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Yanlış JSON formatı" }, { status: 400 });
  }

  const { productName, category, price, keywords } = body;
  if (!productName) {
    return Response.json({ error: "productName tələb olunur" }, { status: 422 });
  }

  const prompt = `Sən Azərbaycan dilində kənd təsərrüfatı marketplace-i üçün elan mətni yazan AI köməkçisisən.
Məhsul: "${productName}"
Kateqoriya: ${category || "qeyd olunmayıb"}
Qiymət: ${price ? price + " AZN" : "qeyd olunmayıb"}
Açar sözlər: ${keywords || "yoxdur"}

Aşağıdakı formatda YALNIZ JSON qaytar (əlavə mətn yazma):
{
  "title": "cəlbedici, qısa elan başlığı (max 60 simvol)",
  "description": "2-3 cümlədən ibarət satış mətni, Azərbaycan dilində, təbii səslənən",
  "seoText": "axtarış motorları üçün açar sözlərlə zənginləşdirilmiş 1 cümlə",
  "hashtags": ["#kəndtəsərrüfatı", "#nümunə"],
  "socialPost": "Instagram/Facebook üçün paylaşıma hazır qısa post mətni, emoji ilə"
}`;

  try {
    const raw = await geminiGenerate({ prompt });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { description: raw };
    return Response.json({ result: parsed });
  } catch (err) {
    return Response.json({ error: err.message || "AI xətası" }, { status: 502 });
  }
}
