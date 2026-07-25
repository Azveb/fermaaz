"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/home/Footer";
import { apiFetch } from "@/lib/apiClient";
import Link from "next/link";

export default function CalculatorPage() {
  const [step, setStep] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [manualMode, setManualMode] = useState(false);
  const [manualUseNorm, setManualUseNorm] = useState("");
  const [manualWaterNorm, setManualWaterNorm] = useState("300");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("ha");
  const [applications, setApplications] = useState(1);

  // Result states
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const searchTimer = useRef(null);

  useEffect(() => {
    if (!searchVal || searchVal.length < 2) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`/api/products?search=${encodeURIComponent(searchVal)}&pageSize=5`);
        if (res.products) {
          setSearchResults(res.products);
        }
      } catch {}
    }, 300);
  }, [searchVal]);

  const selectProduct = (p) => {
    setSelectedProduct(p);
    setManualMode(false);
    setStep(2);
    setSearchVal("");
    setSearchResults([]);
  };

  const selectManual = () => {
    setSelectedProduct(null);
    setManualMode(true);
    setStep(2);
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!area || isNaN(area) || Number(area) <= 0) {
      setError("Düzgün sahə ölçüsü daxil edin");
      return;
    }
    setError("");
    setCalculating(true);

    const payload = {
      productId: selectedProduct?.id || null,
      manualUseNorm: manualMode ? Number(manualUseNorm) : null,
      manualWaterNorm: manualMode ? Number(manualWaterNorm) : null,
      area: Number(area),
      areaUnit,
      applications: Number(applications)
    };

    try {
      const data = await apiFetch("/api/calculator", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (data.result) {
        setResult(data.result);
        setStep(3);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError("Hesablama yerinə yetirilə bilmədi");
    } finally {
      setCalculating(false);
    }
  };

  const resetCalculator = () => {
    setStep(1);
    setSelectedProduct(null);
    setManualMode(false);
    setArea("");
    setApplications(1);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 flex items-center justify-center gap-2">
            🧮 Doza və Xərc Kalkulyatoru
          </h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Sahənizə görə lazımi gübrə/dərman miqdarını, qablaşdırma sayını və hektar xərcini anında hesablayın.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-between items-center max-w-md mx-auto mb-10 relative">
          <div className="absolute left-0 right-0 h-1 bg-gray-200 top-1/2 -translate-y-1/2 z-0"></div>
          <div className={`absolute left-0 h-1 bg-brand-600 top-1/2 -translate-y-1/2 z-0 transition-all duration-300`}
            style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

          {[1, 2, 3].map((s) => (
            <div key={s} className="z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                step >= s ? "bg-brand-600 text-white shadow-md shadow-brand-600/20" : "bg-white text-gray-400 border border-gray-200"
              }`}>
                {s}
              </div>
              <span className={`text-[10px] font-extrabold uppercase mt-1 tracking-wider ${step >= s ? "text-brand-700" : "text-gray-400"}`}>
                {s === 1 ? "Məhsul" : s === 2 ? "Göstəricilər" : "Nəticə"}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Select Product */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm max-w-xl mx-auto animate-in fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Addım 1: Məhsulu seçin</h2>
            <div className="relative mb-6">
              <input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Məhsulun adını yazın (məs: Azot)..."
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-brand-500 focus:bg-white text-gray-800 text-sm transition-all"
              />
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectProduct(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-50 text-left transition-colors border-b border-gray-50 last:border-0"
                    >
                      {p.coverImage ? (
                        <img src={p.coverImage} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg">🌿</div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{p.title}</p>
                        <p className="text-[10px] text-brand-600 font-bold mt-0.5">₼{Number(p.price).toLocaleString("az-AZ")}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400">VƏ YA</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <button
              onClick={selectManual}
              className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl text-sm transition-all"
            >
              Manual Giriş (Göstəriciləri əllə yazmaq)
            </button>
          </div>
        )}

        {/* Step 2: Form Input */}
        {step === 2 && (
          <form onSubmit={handleCalculate} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm max-w-xl mx-auto animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Addım 2: Sahə və normaları daxil edin</h2>
              <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-brand-600 hover:underline">
                Geri
              </button>
            </div>

            {selectedProduct && (
              <div className="mb-6 bg-brand-50/50 border border-brand-100 p-4 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Seçilmiş məhsul:</p>
                  <p className="text-sm font-bold text-brand-800">{selectedProduct.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Məhsul norması: {selectedProduct.useNorm || "Qeyd edilməyib"}</p>
                </div>
              </div>
            )}

            {manualMode && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">İstifadə Norması (L/ha və ya kq/ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={manualUseNorm}
                    onChange={(e) => setManualUseNorm(e.target.value)}
                    placeholder="Məs: 1.5"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white text-gray-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Su Norması (L/ha)</label>
                  <input
                    type="number"
                    required
                    value={manualWaterNorm}
                    onChange={(e) => setManualWaterNorm(e.target.value)}
                    placeholder="Məs: 300"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white text-gray-800 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sahə ölçüsü</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Məs: 5"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white text-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vahid</label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white text-gray-800 text-sm"
                >
                  <option value="ha">Hektar (ha)</option>
                  <option value="sot">Sot (100 m²)</option>
                </select>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tətbiq çiləmə sayı</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setApplications(num)}
                    className={`flex-1 py-3 font-bold text-xs rounded-xl border transition-all ${
                      applications === num ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {num} dəfə
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-semibold mb-4">⚠️ {error}</p>}

            <button
              type="submit"
              disabled={calculating}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 active:scale-95 text-white font-bold py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-600/10"
            >
              {calculating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Hesablanır...
                </>
              ) : (
                "Hesabla və Nəticəni Gör"
              )}
            </button>
          </form>
        )}

        {/* Step 3: Calculation Result */}
        {step === 3 && result && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto animate-in fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-900">Addım 3: Hesablama Nəticəsi</h2>
              <button onClick={resetCalculator} className="text-xs font-bold text-brand-600 hover:underline">
                Yenidən hesabla
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <span className="text-xs text-gray-400 font-semibold block uppercase">Ümumi Doza Miqdarı</span>
                <span className="text-2xl font-black text-brand-800 mt-1 block">
                  {result.totalAmount} {result.isLiquid ? "Litr" : "Kq"}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Norma: {result.useNorm} {result.isLiquid ? "L/ha" : "kq/ha"}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <span className="text-xs text-gray-400 font-semibold block uppercase">Su Həcmi</span>
                <span className="text-2xl font-black text-blue-700 mt-1 block">
                  {result.totalWater} Litr
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Su Norması: {result.waterNorm} L/ha</span>
              </div>
            </div>

            {selectedProduct && (
              <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                <span className="text-xs text-gray-400 font-semibold block uppercase mb-3">Tövsiyə edilən Qablaşdırma</span>
                {result.optimizedPackages && result.optimizedPackages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.optimizedPackages.map((pkg, idx) => (
                      <span key={idx} className="bg-white border border-gray-200 font-extrabold text-sm text-gray-800 px-4 py-2 rounded-xl">
                        {pkg.qty} ədəd × {pkg.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 font-medium">Paket məlumatı tapılmadı</span>
                )}
              </div>
            )}

            {selectedProduct && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-brand-50/30 border border-brand-100 p-4 rounded-2xl">
                  <span className="text-xs text-gray-400 font-semibold block uppercase">Hektar Xərci (Təxmini)</span>
                  <span className="text-xl font-extrabold text-brand-700 mt-1 block">
                    ₼{result.hectareCost} / ha
                  </span>
                </div>
                <div className="bg-brand-50/30 border border-brand-100 p-4 rounded-2xl">
                  <span className="text-xs text-gray-400 font-semibold block uppercase">Ümumi Məhsul Xərci</span>
                  <span className="text-xl font-extrabold text-brand-700 mt-1 block">
                    ₼{result.totalCost}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {selectedProduct ? (
                <>
                  <Link
                    href={`/products/${selectedProduct.slug}`}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-center font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md shadow-brand-600/10"
                  >
                    Məhsula bax / Satın al
                  </Link>
                  <button
                    onClick={resetCalculator}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl text-sm transition-all"
                  >
                    Yeni Hesablama
                  </button>
                </>
              ) : (
                <button
                  onClick={resetCalculator}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all"
                >
                  Yeni Hesablama et
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
