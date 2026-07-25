"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/home/Footer";
import SafeImage from "@/components/SafeImage";
import { apiFetch } from "@/lib/apiClient";
import AddToCartButton from "@/components/AddToCartButton";

export default function ComparePage() {
  const [productIds, setProductIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fmk_compare");
      if (stored) {
        setProductIds(JSON.parse(stored));
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    apiFetch(`/api/products/compare?ids=${productIds.join(",")}`)
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Məhsulları yükləmək mümkün olmadı");
        setLoading(false);
      });
  }, [productIds]);

  const removeFromCompare = (id) => {
    const nextIds = productIds.filter((item) => item !== id);
    setProductIds(nextIds);
    localStorage.setItem("fmk_compare", JSON.stringify(nextIds));
  };

  const clearCompare = () => {
    setProductIds([]);
    localStorage.removeItem("fmk_compare");
  };

  // Find flags for items
  const bestHectareCost = products.length > 1 
    ? [...products].filter(p => p.costPerHectare).sort((a, b) => a.costPerHectare - b.costPerHectare)[0]
    : null;

  const cheapestProduct = products.length > 1
    ? [...products].sort((a, b) => a.price - b.price)[0]
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
              ⚖️ Məhsul Müqayisəsi
            </h1>
            <p className="text-gray-500 mt-1">
              Fərqli markalı məhsulların tərkibi, normaları və hektara düşən xərclərini müqayisə edin.
            </p>
          </div>
          {products.length > 0 && (
            <button
              onClick={clearCompare}
              className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-colors"
            >
              🗑️ Siyahını təmizlə
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-10 w-10 text-brand-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p className="text-gray-500 font-medium">Müqayisə məlumatları yüklənir...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-100 max-w-lg mx-auto text-center">
            <p className="font-bold mb-2">⚠️ Xəta baş verdi</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto flex flex-col items-center justify-center mt-10">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Müqayisə siyahısı boşdur</h3>
            <p className="text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
              Müqayisə etmək üçün məhsul detalları səhifəsindən "Müqayisəyə əlavə et" düyməsinə klikləyin. Max 5 məhsul əlavə edilə bilər.
            </p>
            <Link
              href="/products"
              className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-md"
            >
              Məhsulları kəşf et
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100">
                    <th className="p-5 font-bold text-gray-900 w-60 border-r border-gray-100">Göstəricilər</th>
                    {products.map((p) => {
                      const isBestCost = bestHectareCost && bestHectareCost.id === p.id;
                      const isCheapest = cheapestProduct && cheapestProduct.id === p.id;

                      return (
                        <th key={p.id} className="p-5 min-w-[240px] border-r border-gray-100 last:border-r-0 relative">
                          <button
                            onClick={() => removeFromCompare(p.id)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg transition-colors p-1"
                            title="Müqayisədən çıxar"
                          >
                            ✕
                          </button>
                          <div className="flex flex-col gap-3">
                            <div className="relative w-full aspect-video rounded-xl bg-gray-50 overflow-hidden">
                              {p.coverImage ? (
                                <SafeImage src={p.coverImage} alt={p.title} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">🌾</div>
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-extrabold tracking-wide text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                                {p.store ? p.store.name : "Klassik Elan"}
                              </span>
                              <h4 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2 min-h-[40px]">
                                {p.title}
                              </h4>
                            </div>

                            {/* Award badges */}
                            <div className="flex flex-wrap gap-1 min-h-[24px]">
                              {isBestCost && (
                                <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                  🏆 Ən Sərfəli (Hektar Xərci)
                                </span>
                              )}
                              {isCheapest && !isBestCost && (
                                <span className="text-[9px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                  💰 Ən Ucuz Qiymət
                                </span>
                              )}
                              {p.isOrganic && (
                                <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                  🍃 Orqanik
                                </span>
                              )}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">Qiymət</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 font-black text-brand-700 text-lg border-r border-gray-100 last:border-r-0">
                        {p.price.toLocaleString("az-AZ")} <span className="text-xs font-semibold">{p.currency || "AZN"}</span>
                        {p.packaging && <span className="text-gray-400 font-normal text-xs block">Qablaşdırma: {p.packaging}</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">Hektara Düşən Xərc</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 border-r border-gray-100 last:border-r-0">
                        {p.costPerHectare ? (
                          <div className="flex flex-col">
                            <span className="font-extrabold text-emerald-600 text-base">
                              ₼{p.costPerHectare.toFixed(2)} / ha
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Norma: {p.useNorm}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Məlum deyil / Tətbiq edilmir</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">Aktiv Maddə və Tərkib</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 border-r border-gray-100 last:border-r-0">
                        {p.activeIngredients && p.activeIngredients.length > 0 ? (
                          <div className="flex flex-col gap-1.5">
                            {p.activeIngredients.map((ai, index) => (
                              <span key={index} className="inline-block text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                                {ai.name} {ai.concentration ? `(${ai.concentration})` : ""}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Yoxdur / Qeyd edilməyib</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">Preparativ Forma</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 text-sm text-gray-700 border-r border-gray-100 last:border-r-0">
                        {p.preparativeForm ? (
                          <span className="font-semibold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg text-xs">
                            {p.preparativeForm}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">İstifadə Norması</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 text-sm font-semibold text-gray-700 border-r border-gray-100 last:border-r-0">
                        {p.useNorm || "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">Gözləmə Müddəti</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 text-sm font-semibold text-gray-700 border-r border-gray-100 last:border-r-0">
                        {p.waitingPeriod !== null && p.waitingPeriod !== undefined ? `${p.waitingPeriod} gün` : "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">Maksimum Çiləmə Sayı</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 text-sm font-semibold text-gray-700 border-r border-gray-100 last:border-r-0">
                        {p.maxApplications ? `${p.maxApplications} dəfə` : "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">Topdan Satış Qiyməti</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 text-sm border-r border-gray-100 last:border-r-0">
                        {p.wholesalePrice ? (
                          <div className="flex flex-col">
                            <span className="font-extrabold text-purple-700">
                              ₼{p.wholesalePrice.toLocaleString("az-AZ")}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Min. Sifariş: {p.wholesaleMinQty} ədəd</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Topdan satılmır</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">İstehsalçı</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 text-sm font-semibold text-gray-700 border-r border-gray-100 last:border-r-0">
                        {p.manufacturer || "-"} {p.countryOfOrigin ? `(${p.countryOfOrigin})` : ""}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">Stok Vəziyyəti</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 text-sm border-r border-gray-100 last:border-r-0">
                        {p.stock > 0 ? (
                          <span className="text-emerald-600 font-bold">Stokda var ({p.stock} ədəd)</span>
                        ) : (
                          <span className="text-red-500 font-bold">Tükənib</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 font-bold text-gray-800 border-r border-gray-100">Əməliyyat</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-5 border-r border-gray-100 last:border-r-0">
                        {p.store ? (
                          <AddToCartButton product={p} />
                        ) : (
                          <Link
                            href={`/products/${p.slug}`}
                            className="inline-block text-center w-full bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm"
                          >
                            Əlaqə saxla
                          </Link>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
