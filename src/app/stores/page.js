import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Mağazalar | FermerMarket",
  description: "FermerMarket-dəki bütün fermer mağazaları",
};

export default async function StoresPage() {
  let stores = [];
  let salesMap = {};
  let ratingSum = {};
  let ratingCount = {};

  try {
    stores = await prisma.store.findMany({
      where: { isActive: true },
      orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
      take: 60,
      include: {
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
        owner: { select: { id: true } },
      },
    });

    const ownerIds = stores.map((s) => s.ownerId);
    const salesData = await prisma.orderItem.groupBy({
      by: ["sellerId"],
      where: { sellerId: { in: ownerIds }, order: { status: "DELIVERED" } },
      _sum: { quantity: true },
    });
    salesMap = Object.fromEntries(salesData.map((s) => [s.sellerId, s._sum.quantity || 0]));

    const ratingData = await prisma.review.groupBy({
      by: ["productId"],
      where: { product: { sellerId: { in: ownerIds } }, isApproved: true },
      _avg: { rating: true },
    });
    const products = await prisma.product.findMany({
      where: { sellerId: { in: ownerIds } },
      select: { id: true, sellerId: true },
    });
    const sellerOfProduct = Object.fromEntries(products.map((p) => [p.id, p.sellerId]));
    for (const r of ratingData) {
      const sid = sellerOfProduct[r.productId];
      if (!sid || r._avg.rating == null) continue;
      ratingSum[sid] = (ratingSum[sid] || 0) + r._avg.rating;
      ratingCount[sid] = (ratingCount[sid] || 0) + 1;
    }
  } catch (error) {
    console.warn("Stores page fallback active:", error.message);
    stores = [];
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">🏪 Fermer Mağazaları</h1>
          <p className="text-gray-500 text-sm mt-1">{stores.length} mağaza tapıldı</p>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏚️</p>
            <p className="text-gray-500">Hələ mağaza yoxdur</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stores.map((store) => {
              const avgRating = ratingCount[store.ownerId]
                ? (ratingSum[store.ownerId] / ratingCount[store.ownerId]).toFixed(1)
                : null;
              const sales = salesMap[store.ownerId] || 0;

              return (
                <Link
                  key={store.id}
                  href={`/stores/${store.slug}`}
                  className="card p-4 flex gap-4 hover:shadow-md transition-shadow group"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-brand-50 border border-brand-100">
                    {store.logoUrl ? (
                      <SafeImage
                        src={store.logoUrl}
                        alt={store.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-gray-900 truncate group-hover:text-brand-700 transition-colors">
                        {store.name}
                      </p>
                      {store.isVerified && <span className="text-xs text-brand-600">✅</span>}
                    </div>
                    {store.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{store.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-400">
                      {avgRating && <span className="text-yellow-600 font-semibold">⭐ {avgRating}</span>}
                      <span>📦 {store._count.products} elan</span>
                      {sales > 0 && <span>✅ {sales} satış</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
  );
}
