"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, cartTotal, clearCart } from "@/lib/cartClient";
import { apiFetch, getUser } from "@/lib/apiClient";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ shippingAddress: "", shippingRegion: "", shippingCity: "", couponCode: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(getCart());
    if (!getUser()) {
      router.push("/login");
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const totalVal = cartTotal(items);
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        ...(form.couponCode ? { couponCode: form.couponCode } : {}),
        shippingAddress: form.shippingAddress,
        shippingRegion: form.shippingRegion,
        shippingCity: form.shippingCity,
      };
      const data = await apiFetch("/api/orders", { method: "POST", body: JSON.stringify(payload) });
      
      const earnedCoin = (totalVal * 0.02).toFixed(2);
      if (typeof window !== 'undefined') {
        const current = parseFloat(localStorage.getItem('fermerCoin') || '0');
        localStorage.setItem('fermerCoin', (current + parseFloat(earnedCoin)).toFixed(2));
      }
      
      clearCart();
      setSuccess({ ...data.order, earnedCoin });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-3">✅</p>
        <h1 className="text-2xl font-black">Sifariş qəbul edildi!</h1>
        <p className="text-gray-500 mt-2">Sifariş nömrəniz: {success.id?.slice(0, 8)}</p>
        <p className="text-brand-700 font-bold text-lg mt-1">{Number(success.total || 0).toFixed(2)} AZN</p>
        
        <div className="mt-6 bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 p-4 rounded-2xl">
          <p className="text-sm text-yellow-800 font-bold">🎉 Təbriklər!</p>
          <p className="text-xs text-yellow-700 mt-1">Bu alış-verişdən <strong className="text-lg">+{success.earnedCoin} 🪙</strong> FermerCoin qazandınız. Balansınızı Panelinizdən yoxlaya bilərsiniz.</p>
        </div>

        <a href="/dashboard" className="btn-primary inline-block mt-6 w-full text-center">Panelimə keç</a>
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-gray-400">Səbətiniz boşdur.</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Sifarişi tamamla</h1>
      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</p>}
        <div>
          <label className="text-sm font-medium">Ünvan</label>
          <input className="input-field mt-1" value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Region</label>
            <input className="input-field mt-1" value={form.shippingRegion} onChange={(e) => setForm({ ...form, shippingRegion: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Şəhər</label>
            <input className="input-field mt-1" value={form.shippingCity} onChange={(e) => setForm({ ...form, shippingCity: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Kupon kodu (istəyə bağlı)</label>
          <input className="input-field mt-1" placeholder="XOSGELDIN10" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} />
        </div>
        <div className="flex items-center justify-between font-bold text-lg pt-2 border-t">
          <span>Cəmi</span>
          <span className="text-brand-700">{cartTotal(items).toFixed(2)} AZN</span>
        </div>
        <button disabled={loading} className="btn-primary w-full">{loading ? "Göndərilir..." : "Sifarişi təsdiqlə"}</button>
        <p className="text-xs text-gray-400 text-center">
          Ödəniş: bank köçürməsi / nağd (kart ödənişi provayder qoşulduqda aktivləşəcək)
        </p>
      </form>
    </div>
  );
}
