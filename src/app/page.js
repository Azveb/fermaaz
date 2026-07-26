import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import AdBanner from "@/components/AdBanner";
import { getAdSlotContent } from "@/lib/adSlots";
import BundleCard from "@/components/BundleCard";
import PromoSlider from "@/components/home/PromoSlider";
import StatsSection from "@/components/home/StatsSection";
import BlogSection from "@/components/home/BlogSection";
import Footer from "@/components/home/Footer";
import { getHomeFallbackData } from "@/lib/mockHomeData";
import DynamicHomeRenderer from "@/components/home/DynamicHomeRenderer";
import Icon from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const now = new Date();
  try {
    const [categories, premiumListings, homepageAd, latestProducts, bundles, blogPosts] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
        take: 10,
      }),
      prisma.listing.findMany({
        where: { tier: { not: "STANDARD" }, OR: [{ endDate: null }, { endDate: { gt: now } }] },
        orderBy: [{ tier: "desc" }, { createdAt: "desc" }],
        take: 8,
        include: { product: { include: { images: { take: 1 }, category: true } } },
      }),
      getAdSlotContent("HOMEPAGE_TOP"),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { images: { take: 1 }, category: true, seller: { select: { fullName: true } } },
      }),
      prisma.bundle.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          items: { include: { product: { include: { images: { take: 1 } } } } },
          seller: { select: { fullName: true } },
        },
      }).then((raw) =>
        raw
          .map((b) => {
            const subtotal = b.items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
            const discount = b.discountType === "PERCENTAGE" ? (subtotal * Number(b.discountValue)) / 100 : Number(b.discountValue);
            return { ...b, subtotal, finalPrice: Math.max(subtotal - discount, 0) };
          })
          .filter((b) => b.items.length >= 2)
      ),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { author: { select: { fullName: true } } },
      }),
    ]);
    return { categories, premiumListings, homepageAd, latestProducts, bundles, blogPosts };
  } catch (error) {
    console.warn("Falling back to mock home data:", error.message);
    return getHomeFallbackData();
  }
}

const CATEGORY_ICONS = {
  "bitki-muhafize": "bug",
  "gubreler": "sprout",
  "toxum-ting": "leaf",
  "aqrotexnika": "tractor",
};

const CATEGORY_THEMES = {
  heyvandarliq: { bg: "from-amber-50 to-orange-50/30 hover:from-amber-100/70 hover:to-orange-100/30", border: "border-amber-100 hover:border-amber-200", iconBg: "bg-amber-100 text-amber-700", text: "text-amber-900" },
  qusculuq: { bg: "from-orange-50 to-red-50/30 hover:from-orange-100/70 hover:to-red-100/30", border: "border-orange-100 hover:border-orange-200", iconBg: "bg-orange-100 text-orange-700", text: "text-orange-900" },
  texnika: { bg: "from-blue-50 to-indigo-50/30 hover:from-blue-100/70 hover:to-indigo-100/30", border: "border-blue-100 hover:border-blue-200", iconBg: "bg-blue-100 text-blue-700", text: "text-blue-900" },
  taxil: { bg: "from-yellow-50 to-amber-50/30 hover:from-yellow-100/70 hover:to-amber-100/30", border: "border-yellow-100 hover:border-yellow-200", iconBg: "bg-yellow-100 text-yellow-700", text: "text-yellow-900" },
  gubre: { bg: "from-emerald-50 to-teal-50/30 hover:from-emerald-100/70 hover:to-teal-100/30", border: "border-emerald-100 hover:border-emerald-200", iconBg: "bg-emerald-100 text-emerald-700", text: "text-emerald-900" },
  toxum: { bg: "from-green-50 to-emerald-50/30 hover:from-green-100/70 hover:to-emerald-100/30", border: "border-green-100 hover:border-green-200", iconBg: "bg-green-100 text-green-700", text: "text-green-900" },
  ariculiq: { bg: "from-yellow-50 to-orange-50/30 hover:from-yellow-100/70 hover:to-orange-100/30", border: "border-yellow-100 hover:border-yellow-200", iconBg: "bg-yellow-100 text-yellow-800", text: "text-yellow-900" },
  sudculuk: { bg: "from-sky-50 to-blue-50/30 hover:from-sky-100/70 hover:to-blue-100/30", border: "border-sky-100 hover:border-sky-200", iconBg: "bg-sky-100 text-sky-700", text: "text-sky-900" },
  meyvə: { bg: "from-rose-50 to-red-50/30 hover:from-rose-100/70 hover:to-red-100/30", border: "border-rose-100 hover:border-rose-200", iconBg: "bg-rose-100 text-rose-700", text: "text-rose-900" },
  tərəvəz: { bg: "from-green-50 to-lime-50/30 hover:from-green-100/70 hover:to-lime-100/30", border: "border-green-100 hover:border-green-200", iconBg: "bg-green-100 text-green-700", text: "text-green-900" },
};

const DEFAULT_THEME = { bg: "from-gray-50 to-slate-50/30 hover:from-gray-100/70 hover:to-slate-100/30", border: "border-gray-100 hover:border-gray-200", iconBg: "bg-gray-100 text-gray-700", text: "text-gray-900" };

export default async function HomePage({ searchParams }) {
  const editMode = searchParams?.editMode === "true";
  
  let homeData = { categories:[], premiumListings:[], homepageAd:null, latestProducts:[], bundles:[], blogPosts:[] };
  let blocks = [];
  
  try { 
    homeData = await getHomeData(); 
    blocks = await prisma.dynamicBlock.findMany({
      where: { page: "home", isActive: true },
      orderBy: { sortOrder: "asc" }
    });
  } catch(e) { 
    console.error("Fetch failed:", e.message); 
  }
  
  const { categories, premiumListings, homepageAd, latestProducts, bundles, blogPosts } = homeData;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FermerMarket",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://fermermarket.az",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://fermermarket.az"}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const useDynamicLayout = blocks.length > 0 || editMode;

  return (
    <div className="bg-[#F8FAFC] pb-24 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {useDynamicLayout ? (
         <DynamicHomeRenderer initialBlocks={blocks} homeData={homeData} editMode={editMode} />
      ) : (
        <>
          {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-4 pt-6 pb-12 md:pt-14 md:pb-20">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-green-300/10 blur-2xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
            Azərbaycanın №1 Kənd Təsərrüfatı Bazarı
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-3">
            Kənd Təsərrüfatının<br />
            <span className="text-green-200 drop-shadow-md">Rəqəmsal Bazarı</span>
          </h1>
          <p className="text-brand-100 text-sm md:text-base max-w-lg mx-auto mb-6">
            Fermerlər, mağazalar, aqronomlar və alıcılar üçün AI dəstəkli vahid platforma
          </p>

          {/* CTA buttons */}
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-brand-700 text-sm font-bold px-6 py-3 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-lg"
            >
              <span>🛒</span>
              Elanları Gör
            </Link>
            <Link
              href="/agronom"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-sm text-white text-sm font-semibold px-6 py-3 rounded-2xl border border-white/20 transition-all duration-200"
            >
              <span>🌱</span>
              AI Aqronoma Soruş
            </Link>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-8 md:h-12">
            <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40 Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-4 -mt-8 md:-mt-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Premium təcrübə",
              text: "Sürətli axtarış, premium elanlar və mobil optimizasiya ilə satışınızı bir tıkda artırın.",
              icon: "✨",
              accent: "from-emerald-50 to-teal-50",
            },
            {
              title: "AI dəstəyi",
              text: "Aqronom asistanı ilə məhsul, xəstəlik və çeşidləmə ilə bağlı cavablar alın.",
              icon: "🤖",
              accent: "from-sky-50 to-blue-50",
            },
            {
              title: "24/7 bağlılıq",
              text: "Mesajlar, elanlar, sifarişlər və satış takibi üçün vahid idarəetmə paneli.",
              icon: "⚡",
              accent: "from-amber-50 to-orange-50",
            },
          ].map((item) => (
            <div key={item.title} className={`rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-[0_20px_55px_-24px_rgba(15,23,42,0.35)] backdrop-blur ${item.accent}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-xl shadow-sm">{item.icon}</span>
                <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-sm leading-6 text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-10 py-8 pb-28 md:pb-12">

        {/* ─── PROMO SLIDER ─── */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <PromoSlider />
        </section>

        {/* ─── QUICK CATEGORIES ─── */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Kateqoriyalar</h2>
              <p className="section-subtitle">Məhsul növünü seçin</p>
            </div>
            <Link href="/products" className="text-sm text-brand-600 font-semibold hover:text-brand-700">
              Hamısı →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((c, i) => {
              const theme = CATEGORY_THEMES[c.slug] || DEFAULT_THEME;
              return (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  className={`group flex items-center gap-3.5 p-4 rounded-2xl border bg-gradient-to-br ${theme.bg} ${theme.border} hover:shadow-md hover:-translate-y-1 active:scale-[0.98] transition-all duration-300`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center shadow-sm ${theme.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon name={c.icon || CATEGORY_ICONS[c.slug] || "sprout"} size={26} strokeWidth={1.5} />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-bold truncate leading-tight ${theme.text}`}>
                      {c.nameAz}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 group-hover:text-brand-600 transition-colors font-medium">
                      Məhsulları gör →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>



        {/* ─── HOMEPAGE AD BANNER ─── */}
        {homepageAd && (
          <section>
            <AdBanner content={homepageAd} />
          </section>
        )}

        {/* ─── PREMIUM ADS ─── */}
        {premiumListings.length > 0 && (
          <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <span className="text-amber-500">⭐</span>
                  Premium Elanlar
                </h2>
                <p className="section-subtitle">Seçilmiş satıcıların önə çıxan elanları</p>
              </div>
              <Link href="/products?tier=premium" className="text-sm text-brand-600 font-semibold hover:text-brand-700">
                Hamısı →
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 scroll-snap-x">
              {premiumListings.map((l) => (
                <div key={l.id} className="scroll-snap-item shrink-0 w-44 sm:w-52">
                  <ProductCard
                    tier={l.tier}
                    product={{
                      id: l.product?.id || l.id,
                      slug: l.product?.slug,
                      title: l.product?.titleAz || l.product?.title || "Elan",
                      price: Number(l.product?.price || 0),
                      coverImage: Array.isArray(l.product?.images) ? l.product.images[0]?.url : null,
                      region: l.product?.region,
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── LATEST ADS ─── */}
        <section className="animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">🆕 Yeni Elanlar</h2>
              <p className="section-subtitle">Ən son əlavə edilmiş məhsullar</p>
            </div>
            <Link href="/products" className="text-sm text-brand-600 font-semibold hover:text-brand-700">
              Hamısı →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {latestProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  slug: p.slug,
                  title: p.titleAz || p.title || "Elan",
                  price: Number(p.price || 0),
                  coverImage: Array.isArray(p.images) ? p.images[0]?.url : null,
                  region: p.region,
                  city: p.city,
                }}
              />
            ))}
          </div>
        </section>

        {/* ─── BUNDLES ─── */}
        {bundles.length > 0 && (
          <section className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">🎁 Bağlamalar</h2>
                <p className="section-subtitle">Birlikdə al, qənaət et</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {bundles.map((b) => (
                <BundleCard key={b.id} bundle={b} />
              ))}
            </div>
          </section>
        )}

        {/* ─── STATISTICS ─── */}
        <StatsSection />

        {/* ─── AI AGRONOM CARD ─── */}
        <AgronomCard />

        {/* ─── BLOG SECTION ─── */}
        {blogPosts.length > 0 && <BlogSection posts={blogPosts} />}



      </div>

      {/* ─── FOOTER ─── */}
      <Footer />
        </>
      )}
    </div>
  );
}
