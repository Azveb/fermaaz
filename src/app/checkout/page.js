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
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        ...(form.couponCode ? { couponCode: form.couponCode } : {}),
        shippingAddress: form.shippingAddress,
        shippingRegion: form.shippingRegion,
        shippingCity: form.shippingCity,
      };
      const data = await apiFetch("/api/orders", { method: "POST", body: JSON.stringify(payload) });
      clearCart();
      setSuccess(data.order);
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
        <h1 className="text-xl font-bold">Sifariş qəbul edildi!</h1>
        <p className="text-gray-500 mt-2">Sifariş nömrəniz: {success.id.slice(0, 8)}</p>
        <p className="text-brand-700 font-bold text-lg mt-1">{Number(success.total).toFixed(2)} AZN</p>
        <a href="/dashboard" className="btn-primary inline-block mt-5">Panelimə keç</a>
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
