import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bloq — FermerMarket",
  description: "Kənd təsərrüfatı haqqında faydalı məqalələr, aqronomun məsləhətləri, bazar xəbərləri",
};

const CATEGORY_LABELS = {
  tips: "Tövsiyyələr 💡",
  news: "Xəbərlər 📰",
  market: "Bazar 📈",
  agronomy: "Aqronomiya 🌿",
};

export default async function BlogPage() {
  let posts = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { author: { select: { fullName: true } } },
    });
  } catch (e) {
    console.error("Blog fetch error:", e.message);
  }
  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-6 pb-28 md:pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold">Bloq & Xəbərlər 📰</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kənd təsərrüfatı, aqronomiya və bazar xəbərləri
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-4xl mb-3">📰</p>
            <p className="text-gray-500">Hələ bloq yazısı yoxdur</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="card p-5 block hover:shadow-md transition-shadow">
                {post.category && (
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                    {CATEGORY_LABELS[post.category] || post.category}
                  </span>
                )}
                <h2 className="font-bold text-lg mt-2 mb-1 leading-snug">{post.titleAz}</h2>
                {post.contentAz && (
                  <p className="text-gray-600 text-sm line-clamp-2">{post.contentAz.slice(0, 120)}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span>✍️ {post.author?.fullName || "FermerMarket"}</span>
                  <span>·</span>
                  <span>{new Date(post.createdAt).toLocaleDateString("az-AZ")}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
