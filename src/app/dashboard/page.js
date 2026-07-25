"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getUser } from "@/lib/apiClient";
import FarmerPanel from "@/components/dashboard/FarmerPanel";
import AdminPanel from "@/components/dashboard/AdminPanel";
import BuyerPanel from "@/components/dashboard/BuyerPanel";
import DeliveryPanel from "@/components/dashboard/DeliveryPanel";
import ModeratorPanel from "@/components/dashboard/ModeratorPanel";

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin", ADMIN: "Admin", MODERATOR: "Moderator",
  FARMER: "Fermer", STORE: "Mağaza", AGRONOMIST: "Aqronom",
  BUYER: "Alıcı", DELIVERY_PARTNER: "Çatdırılma Partnyor",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = getUser();
    if (!localUser) { router.push("/login"); return; }
    apiFetch("/api/users/me")
      .then((data) => setUser(data.user))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-48" />
          <div className="h-4 bg-gray-100 rounded w-64" />
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role] || user.role;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-gray-900">
            Salam, {user.fullName?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user.email}
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
              {roleLabel}
            </span>
          </p>
        </div>
      </div>

      {(user.role === "FARMER" || user.role === "STORE") && <FarmerPanel user={user} />}
      {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && <AdminPanel />}
      {user.role === "MODERATOR" && <ModeratorPanel />}
      {user.role === "DELIVERY_PARTNER" && <DeliveryPanel user={user} />}
      {(user.role === "BUYER" || user.role === "AGRONOMIST") && <BuyerPanel user={user} />}
    </div>
  );
}
