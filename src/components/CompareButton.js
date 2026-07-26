"use client";
import { useState, useEffect } from "react";

export default function CompareButton({ productId }) {
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fmk_compare");
      if (stored) {
        const ids = JSON.parse(stored);
        setInCompare(ids.includes(productId));
      }
    } catch {}
  }, [productId]);

  const toggleCompare = () => {
    try {
      const stored = localStorage.getItem("fmk_compare");
      let ids = stored ? JSON.parse(stored) : [];

      if (ids.includes(productId)) {
        ids = ids.filter((id) => id !== productId);
        setInCompare(false);
      } else {
        if (ids.length >= 5) {
          alert("Maksimum 5 məhsul müqayisə edilə bilər. Öncəkilərdən birini silin.");
          return;
        }
        ids.push(productId);
        setInCompare(true);
      }
      localStorage.setItem("fmk_compare", JSON.stringify(ids));
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleCompare}
        className={`font-semibold rounded-xl px-5 py-2.5 text-sm transition-all active:scale-95 flex items-center gap-1.5 ${
          inCompare
            ? "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200"
            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
        }`}
      >
        {inCompare ? "⚖️ Müqayisədən çıxar" : "⚖️ Müqayisə et"}
      </button>
      {inCompare && (
        <a href="/compare" className="text-sm font-bold text-brand-700 hover:underline">
          Bax →
        </a>
      )}
    </div>
  );
}
