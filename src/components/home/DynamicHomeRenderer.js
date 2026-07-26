"use client";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Icon from "@/components/ui/Icon";

const CATEGORY_ICONS = {
  "bitki-muhafize": "bug",
  "gubreler": "sprout",
  "toxum-ting": "leaf",
  "aqrotexnika": "tractor",
};

export default function DynamicHomeRenderer({ initialBlocks, homeData, editMode }) {
  const [blocks, setBlocks] = useState(initialBlocks);

  useEffect(() => {
    if (!editMode) return;

    const handleMessage = (e) => {
      if (e.data?.type === "FMK_LIVE_UPDATE") {
        setBlocks(e.data.blocks);
      } else if (e.data?.type === "FMK_RELOAD_BLOCKS") {
        window.location.reload();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [editMode]);

  const onBlockClick = (index) => {
    if (editMode) {
      window.parent.postMessage({ type: "FMK_BLOCK_CLICK", index }, "*");
    }
  };

  if (!blocks || blocks.length === 0) {
    return null; // Fallback handled by parent
  }

  return (
    <div className={`space-y-10 pb-28 md:pb-12 ${editMode ? "p-4" : ""}`}>
      {blocks.map((block, index) => {
        const p = block.props || {};
        
        let content = null;

        if (block.type === "HERO_BANNER") {
          content = (
            <section className={`relative overflow-hidden bg-gradient-to-br ${p.bg || "from-brand-700 to-brand-500"} px-4 py-12 md:py-20 rounded-3xl text-center`}>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">{p.title}</h1>
              <p className="text-brand-100 text-sm md:text-base max-w-lg mx-auto">{p.subtitle}</p>
            </section>
          );
        } else if (block.type === "CATEGORIES") {
          content = (
            <section className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{p.title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {homeData?.categories?.slice(0, p.count || 10).map((c) => (
                  <Link key={c.id} href={`/products?category=${c.slug}`} className="p-4 bg-white border border-gray-100 rounded-2xl flex flex-col items-center gap-2 hover:shadow-md transition">
                    <span className="text-gray-700 bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center">
                      <Icon name={c.icon || CATEGORY_ICONS[c.slug] || "sprout"} size={28} strokeWidth={1.5} />
                    </span>
                    <span className="text-sm font-bold text-gray-800 text-center">{c.nameAz}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        } else if (block.type === "FEATURED_PRODUCTS") {
          content = (
            <section className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{p.title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {homeData?.latestProducts?.slice(0, p.count || 8).map((prod) => (
                   <ProductCard
                     key={prod.id}
                     product={{
                       id: prod.id,
                       slug: prod.slug,
                       title: prod.titleAz || prod.title || "Elan",
                       price: Number(prod.price || 0),
                       coverImage: Array.isArray(prod.images) ? prod.images[0]?.url : null,
                       region: prod.region,
                     }}
                   />
                ))}
              </div>
            </section>
          );
        } else {
          content = <div className="p-10 bg-gray-100 text-center rounded-2xl">Bilinməyən modul: {block.type}</div>;
        }

        return (
          <div 
            key={index} 
            onClick={() => onBlockClick(index)}
            className={`${editMode ? 'relative cursor-pointer ring-2 ring-transparent hover:ring-brand-500 rounded-3xl transition group' : ''}`}
          >
            {editMode && (
              <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/10 rounded-3xl z-10 flex items-center justify-center transition">
                <span className="opacity-0 group-hover:opacity-100 bg-brand-600 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-xl">
                  Redaktə et ({block.type})
                </span>
              </div>
            )}
            {content}
          </div>
        );
      })}
    </div>
  );
}
