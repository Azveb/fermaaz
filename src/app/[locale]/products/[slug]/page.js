import SafeImage from "@/components/SafeImage";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactSellerButton from "@/components/ContactSellerButton";
import AdBanner from "@/components/AdBanner";
import ProductCard from "@/components/ProductCard";
import { Link } from "@/i18n/routing";
import { getAdSlotContent } from "@/lib/adSlots";
import ProductReviews from "@/components/ProductReviews";
import ShareButtons from "@/components/ShareButtons";
import CompareButton from "@/components/CompareButton";
import ReportModal from "@/components/ReportModal";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getProduct(slug) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      seller: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          role: true,
          avgRating: true,
          reviewCount: true
        }
      },
      store: true,
    },
  });
}

// Bottom-of-page discovery section:
// 1) other ACTIVE listings from the same category (if any exist)
// 2) otherwise fall back to VIP/premium listings, topped up with the latest listings
async function getRelatedProducts(product) {
  const sameCategory = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId: product.categoryId, id: { not: product.id } },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { images: { take: 1 }, category: true },
  });

  if (sameCategory.length > 0) {
    return { heading: "Bu kateqoriyada digər elanlar", items: sameCategory, tierById: {} };
  }

  const now = new Date();
  const [vipListings, latest] = await Promise.all([
    prisma.listing.findMany({
      where: { tier: { not: "STANDARD" }, OR: [{ endDate: null }, { endDate: { gt: now } }] },
      orderBy: [{ tier: "desc" }, { createdAt: "desc" }],
      take: 8,
      include: { product: { include: { images: { take: 1 }, category: true } } },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", id: { not: product.id } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: { take: 1 }, category: true },
    }),
  ]);

  const tierById = {};
  const vipProducts = vipListings
    .filter((l) => l.product.id !== product.id)
    .map((l) => {
      tierById[l.product.id] = l.tier;
      return l.product;
    });

  const seen = new Set(vipProducts.map((p) => p.id));
  const combined = [...vipProducts];
  for (const p of latest) {
    if (!seen.has(p.id) && combined.length < 8) {
      seen.add(p.id);
      combined.push(p);
    }
  }

  return {
    heading: vipProducts.length > 0 ? "VIP elanlar və son əlavələr" : "Son əlavə olunan elanlar",
    items: combined,
    tierById,
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.status !== "ACTIVE") return { title: "Elan tapılmadı" };
  return {
    title: `${product.titleAz} — ${product.price} ${product.currency}`,
    description: product.descriptionAz?.slice(0, 155) || `${product.titleAz} FermerMarket-də satılır.`,
    openGraph: {
      title: product.titleAz,
      description: product.descriptionAz || "",
      images: product.images[0] ? [product.images[0].url] : [],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  let product = null;
  try { product = await getProduct(slug); } catch(e) { console.error("getProduct error:", e.message); }
  if (!product || product.status !== "ACTIVE") notFound();

  // Fetch active ingredients of this product and alternatives
  let alternatives = [];
  try {
    const productActiveIngredients = await prisma.productActiveIngredient.findMany({
      where: { productId: product.id },
      select: { activeIngredientId: true }
    });
    const ingredientIds = productActiveIngredients.map(ai => ai.activeIngredientId);

    if (ingredientIds.length > 0) {
      alternatives = await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          id: { not: product.id },
          activeIngredients: {
            some: { activeIngredientId: { in: ingredientIds } }
          }
        },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          store: { select: { name: true, slug: true } }
        },
        orderBy: { price: "asc" },
        take: 4
      });
    }
  } catch (e) {
    console.error("alternatives fetch error:", e.message);
  }

  let sidebarAd = null, related = { heading: "", items: [], tierById: {} };
  let otherListings = [];

  try {
    const promises = [
      getAdSlotContent("PRODUCT_DETAIL_SIDEBAR", { region: product.region }),
      getRelatedProducts(product),
    ];
    if (product.sellerId) {
      promises.push(
        prisma.product.findMany({
          where: {
            sellerId: product.sellerId,
            status: "ACTIVE",
            id: { not: product.id }
          },
          take: 5,
          include: { images: { take: 1 } }
        })
      );
    }
    const resolved = await Promise.all(promises);
    sidebarAd = resolved[0];
    related = resolved[1];
    if (product.sellerId) {
      otherListings = resolved[2] || [];
    }
  } catch(e) {
    console.error("product page sidebar/related/seller error:", e.message);
  }

  const isGuestListing = !product.sellerId;
  const contactPhone = isGuestListing ? product.guestPhone : product.seller?.phone;
  const whatsappNumber = product.store?.whatsapp || contactPhone || "994501234567";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.titleAz,
    description: product.descriptionAz,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Səhifə", item: "/" },
      { "@type": "ListItem", position: 2, name: product.category.nameAz, item: `/products?category=${product.category.slug}` },
      { "@type": "ListItem", position: 3, name: product.titleAz },
    ],
  };

  const seller = product.seller ? {
    ...product.seller,
    otherListings
  } : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="grid md:grid-cols-2 gap-8">
        <ProductGallery images={product.images} title={product.titleAz} />

        <div>
          <p className="text-sm text-brand-700 font-semibold">{product.category.nameAz}</p>
          <h1 className="text-2xl font-extrabold mt-1">{product.titleAz}</h1>
          <p className="text-3xl font-extrabold text-brand-700 mt-3">
            {Number(product.price).toLocaleString("az-AZ")} {product.currency}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            📍 {product.city || product.region || "Qeyd olunmayıb"} · Stok: {product.stock}
          </p>
          {product.store && (
            <p className="text-sm text-gray-600 mt-2">🏪 Satıcı:{" "}
              {product.store.slug ? (
                <a href={`/stores/${product.store.slug}`} className="font-bold text-brand-700 hover:underline">{product.store.name}</a>
              ) : (
                <strong>{product.store.name}</strong>
              )}
            </p>
          )}
          {product.isCorporate && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                🏢 Korporativ / Toplu satış
              </span>
              {product.minOrderQty && (
                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium px-3 py-1 rounded-full">
                  📦 Minimum sifariş: <strong className="ml-1">{product.minOrderQty} ədəd</strong>
                </span>
              )}
            </div>
          )}
          {isGuestListing && (
            <p className="text-sm text-gray-600 mt-2">
              👤 Elan sahibi: <strong>{product.guestName}</strong>
              <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Fərdi elan</span>
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            {isGuestListing ? (
              contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm"
                >
                  📞 Zəng et: {contactPhone}
                </a>
              )
            ) : (
              <AddToCartButton product={{ id: product.id, title: product.titleAz, price: Number(product.price), coverImage: product.images[0]?.url, isCorporate: product.isCorporate, minOrderQty: product.minOrderQty }} />
            )}
            <WhatsAppButton phone={whatsappNumber} message={`Salam, "${product.titleAz}" elanı haqqında məlumat almaq istəyirəm.`} />
            <CompareButton productId={product.id} />
            {!isGuestListing && product.sellerId && (
              <ContactSellerButton sellerId={product.sellerId} productId={product.id} productTitle={product.titleAz} />
            )}
          </div>

          {product.descriptionAz && (
            <div className="mt-6">
              <h2 className="font-bold mb-1">Təsvir</h2>
              <p className="text-gray-700 text-sm whitespace-pre-line">{product.descriptionAz}</p>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((tag, i) => (
                <a
                  key={i}
                  href={`/products?search=${encodeURIComponent(tag)}`}
                  className="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-full font-medium transition-colors"
                >
                  #{tag}
                </a>
              ))}
            </div>
          )}

          {/* Alternatives Widget */}
          {alternatives.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="font-bold text-sm text-gray-800 mb-3">🧪 Oxşar Tərkibli Alternativlər (Daha Sərfəli)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alternatives.map((alt) => (
                  <Link
                    key={alt.id}
                    href={`/products/${alt.slug}`}
                    className="p-3 bg-gray-50 hover:bg-brand-50/50 rounded-xl flex gap-3 text-left transition-all border border-gray-100/50"
                  >
                    <div className="w-12 h-12 relative rounded-lg bg-white overflow-hidden flex-shrink-0">
                      {alt.images?.[0]?.url ? (
                        <SafeImage src={alt.images[0].url} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{alt.titleAz}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{alt.store?.name || "Klassik Elan"}</p>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <span className="text-xs font-black text-brand-700">₼{Number(alt.price).toLocaleString("az-AZ")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <ShareButtons product={product} />

          {/* Seller details card */}
          {seller && (
            <div className="card p-5 mt-6 border border-gray-100 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                 <h3 className="font-bold text-sm">Satıcı haqqında</h3>
                 <a href={`/seller/${seller.id}`} className="text-[11px] text-brand-600 font-bold hover:underline bg-brand-50 px-2 py-1 rounded-md">Profilə bax →</a>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold">
                  {seller.fullName?.[0]}
                </div>
                <div>
                  <p className="font-bold">{seller.fullName}</p>
                  <p className="text-xs text-gray-500">{seller.role === 'STORE' ? '🏪 Mağaza' : '🌾 Fermer'}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {'★'.repeat(Math.round(seller.avgRating||0))}{'☆'.repeat(5-Math.round(seller.avgRating||0))}
                    <span className="text-xs text-gray-400">({seller.reviewCount||0} rəy)</span>
                  </div>
                </div>
              </div>
              {/* Other listings */}
              {seller.otherListings?.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-semibold text-gray-500 mb-2">Bu satıcının digər elanları:</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {seller.otherListings.slice(0,5).map(l => (
                      <a key={l.id} href={`/products/${l.slug}`} className="shrink-0 w-20">
                        <div className="aspect-square rounded-lg bg-gray-100 overflow-hidden mb-1">
                          {l.images?.[0] ? <img src={l.images[0].url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xl">🌾</div>}
                        </div>
                        <p className="text-[10px] font-medium line-clamp-2 leading-tight">{l.titleAz}</p>
                        <p className="text-[10px] font-bold text-brand-700 mt-0.5">₼{Number(l.price).toLocaleString()}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                <ReportModal productId={product.id} productTitle={product.titleAz} />
              </div>
            </div>
          )}

          <AdBanner content={sidebarAd} className="mt-6" label="Sponsorlu" imgClassName="w-full h-32 object-cover rounded-2xl" />
        </div>
      </div>

      {related.items.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold mb-4">{related.heading}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.items.map((p) => (
              <ProductCard
                key={p.id}
                tier={related.tierById[p.id]}
                product={{
                  slug: p.slug,
                  title: p.titleAz,
                  price: Number(p.price),
                  currency: p.currency,
                  coverImage: p.images[0]?.url,
                  region: p.region,
                }}
              />
            ))}
          </div>
        </section>
      )}

      <ProductReviews productId={product.id} />

      <div className="mt-6 text-center">
        <Link href="/products" className="text-brand-700 font-semibold text-sm hover:underline">
          ← Bütün elanlara bax
        </Link>
      </div>
    </div>
  );
}
