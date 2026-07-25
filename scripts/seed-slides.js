const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_SLIDES = [
  { tag: "🔥 Kampaniya", title: "Yaz Mövsümü Endirimləri", subtitle: "Toxum, gübrə və aqrar avadanlıqlarda 30%-ə qədər endirim", cta: "İndi Bax", href: "/products", bg: "from-brand-700 to-brand-500", emoji: "🌱", sortOrder: 0, isActive: true },
  { tag: "⭐ Keyfiyyət", title: "Seçilmiş Satıcılar", subtitle: "Doğrulayılmış fermerlərin premium məhsulları", cta: "Kəşf Et", href: "/stores", bg: "from-amber-600 to-amber-400", emoji: "🏆", sortOrder: 1, isActive: true },
  { tag: "🤖 Yeni", title: "AI Aqronom", subtitle: "Bitkinizdəki xəstəlikləri analiz etdirin, tövsiyyə alın", cta: "Sınayın", href: "/agronom", bg: "from-sky-700 to-sky-500", emoji: "🔬", sortOrder: 2, isActive: true },
  { tag: "🚜 Texnika", title: "Aqrar Texnika", subtitle: "Traktor, kombayn, suvarma sistemləri — hər növ texnika", cta: "Bax", href: "/products", bg: "from-orange-600 to-orange-400", emoji: "🚜", sortOrder: 3, isActive: true },
];

async function main() {
  const existing = await prisma.homepageSlide.count();
  if (existing > 0) { console.log('Already have ' + existing + ' slides, skipping.'); return; }
  for (const slide of DEFAULT_SLIDES) {
    await prisma.homepageSlide.create({ data: slide });
  }
  console.log('Created ' + DEFAULT_SLIDES.length + ' default slides');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
