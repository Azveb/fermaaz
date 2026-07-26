import { Fragment } from "react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";
import { getAdSlotContent } from "@/lib/adSlots";
import { resolveCategorySlugs } from "@/lib/categoryFilter";
import CategorySelector from "@/components/ui/CategorySelector";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const search = sp?.search;
  return {
    title: search ? `"${search}" üzrə axtarış nəticələri` : "Bütün Elanlar",
    description: search
      ? `${search} üzrə FermerMarket elanları — mal-qara, gübrə, texnika və digər kənd təsərrüfatı məhsulları.`
      : "FermerMarket-də bütün aktiv elanlar: mal-qara, gübrə, toxum, texnika, bal və daha çoxu.",
  };
}

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const { category, search, minPrice, maxPrice, region, page, sort } = sp || {};
  const pageNum = Math.max(1, parseInt(page || "1", 10));
  const pageSize = 20;

  const categorySlugs = await resolveCategorySlugs(category);

  const where = {
    status: "ACTIVE",
    ...(region ? { region } : {}),
    ...(categorySlugs ? { category: { slug: { in: categorySlugs } } } : {}),
    ...(minPrice || maxPrice
      ? { price: { ...(minPrice ? { gte: Number(minPrice) } : {}), ...(maxPrice ? { lte: Number(maxPrice) } : {}) } }
      : {}),
    ...(search
      ? { OR: [{ titleAz: { contains: search, mode: "insensitive" } }, { descriptionAz: { contains: search, mode: "insensitive" } }] }
      : {}),
  };

  let total = 0, products = [], categories = [], topAd = null, infeedAd = null;
  let isFallback = false;
  let fallbackParentId = null;

  try {
    [total, products, categories, topAd, infeedAd] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: (() => {
          if (sort === "price_asc") return { price: "asc" };
          if (sort === "price_desc") return { price: "desc" };
          if (sort === "oldest") return { createdAt: "asc" };
          return { createdAt: "desc" };
        })(),
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { images: { take: 1 }, category: true },
      }),
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
        include: { children: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
      }),
      getAdSlotContent("PRODUCT_LIST_TOP", { region }),
      getAdSlotContent("PRODUCT_LIST_INFEED", { region }),
    ]);

    // Fallback logic
    if (products.length === 0 && category) {
      const mainCategory = await prisma.category.findUnique({ where: { slug: category }, select: { id: true } });
      if (mainCategory) {
        const categoryId = mainCategory.id;
        const cat = await prisma.category.findUnique({ where: { id: categoryId }, select: { parentId: true } });
        if (cat?.parentId) {
          const siblings = await prisma.category.findMany({ where: { parentId: cat.parentId }, select: { id: true } });
          const siblingIds = siblings.map(s => s.id);
          products = await prisma.product.findMany({
            where: { status: 'ACTIVE', categoryId: { in: siblingIds } },
            orderBy: { createdAt: 'desc' },
            take: 12,
            include: { images: { take: 1 }, category: true }
          });
          isFallback = true;
          fallbackParentId = cat.parentId;
          total = products.length;
        }
      }
    }
  } catch (err) {
    console.error("ProductsPage DB error:", err.message);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // If there's an API fallback: true or page fallback banner requested
  // "Oxşar kateqoriya fallback banner: /api/products GET-dən fallback: true gələndə məhsullar siyahısı page-ində sarı banner göstər"
  // Let's also support isFallback as data.fallback
  const showFallbackBanner = isFallback;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 items-start">
      {/* Sidebar Filter Panel */}
      <aside className="w-full md:w-72 flex-shrink-0 md:sticky md:top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ətraflı Axtarış</h2>
        
        <form action="/products" className="flex flex-col gap-5">
          {/* Axtaris */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Axtarış sözü</label>
            <input name="search" defaultValue={search || ""} placeholder="Nə axtarırsınız?" className="input-field w-full text-sm" />
          </div>

          {/* Kateqoriya */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Kateqoriya</label>
            <CategorySelector categories={categories} defaultValue={category || ""} />
          </div>

          {/* Qiymet */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Qiymət (AZN)</label>
            <div className="flex items-center gap-2">
              <input name="minPrice" defaultValue={minPrice || ""} placeholder="Min" type="number" className="input-field text-sm w-1/2" />
              <span className="text-gray-400 font-medium">-</span>
              <input name="maxPrice" defaultValue={maxPrice || ""} placeholder="Max" type="number" className="input-field text-sm w-1/2" />
            </div>
          </div>

          {/* Region */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Şəhər / Region</label>
            <select name="region" defaultValue={region || ""} className="input-field w-full text-sm">
              <option value="">Bütün Azərbaycan</option>
              <option value="Bakı">Bakı</option>
              <option value="Sumqayıt">Sumqayıt</option>
              <option value="Gəncə">Gəncə</option>
              <option value="Bərdə">Bərdə</option>
              <option value="Sabirabad">Sabirabad</option>
            </select>
          </div>

          {/* Siralama */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Sıralama</label>
            <select name="sort" defaultValue={sort || ""} className="input-field w-full text-sm">
              <option value="">🕐 Ən yeni</option>
              <option value="price_asc">💰 Ucuzdan baha</option>
              <option value="price_desc">💎 Bahadan ucuz</option>
              <option value="oldest">📅 Ən köhnə</option>
            </select>
          </div>

          <button className="btn-primary w-full shadow-md mt-2">Axtarışa ver</button>
        </form>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <AdBanner content={topAd} className="mb-6" />

        {showFallbackBanner && (
          <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 mb-6">
            ⚠️ Bu kateqoriyada elan tapılmadı. Oxşar kateqoriyaların elanları göstərilir.
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            {search ? `"${search}" üzrə nəticələr` : "Bütün Elanlar"}
          </h1>
          <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{total} elan</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-700 font-semibold text-lg mb-2">Elan tapılmadı</p>
            <p className="text-gray-400 text-sm mb-6">Axtarış şərtlərini dəyişərək yenidən yoxlayın</p>
            <a href="/products" className="btn-primary inline-block">Bütün elanlar</a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <Fragment key={p.id}>
                <ProductCard product={{ id: p.id, slug: p.slug, title: p.titleAz, price: Number(p.price), coverImage: p.images[0]?.url, region: p.region }} />
                {infeedAd && i === 7 && (
                  <div key="infeed-ad" className="col-span-2 md:col-span-3 lg:col-span-4">
                    <AdBanner content={infeedAd} label="Sponsorlu" imgClassName="w-full h-40 md:h-48 object-cover rounded-2xl" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}

        {!isFallback && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={{ pathname: "/products", query: { ...sp, page: n } }}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                  n === pageNum 
                    ? "bg-brand-600 text-white shadow-md shadow-brand-200" 
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {n}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
