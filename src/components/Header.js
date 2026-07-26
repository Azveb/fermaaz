"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/apiClient";
import { getCart, cartCount } from "@/lib/cartClient";
import NotificationBell from "@/components/NotificationBell";
import { useLocale } from "@/lib/localeContext";
import { LOCALE_LABELS } from "@/lib/i18n";
import Icon from "@/components/ui/Icon";

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  FARMER: "Fermer",
  STORE: "Mağaza",
  AGRONOMIST: "Aqronom",
  BUYER: "Alıcı",
  DELIVERY_PARTNER: "Çatdırılma",
};

const NAV_LINKS = [
  { href: "/products", label: "Elanlar" },
  { href: "/categories", label: "Kateqoriyalar" },
  { href: "/campaigns", label: "Kampaniyalar" },
  { href: "/stores", label: "Mağazalar" },
  { href: "/blog", label: "Bloq" },
  { href: "/agronom", label: "AI Aqronom" },
];

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [count, setCount] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, setLocale } = useLocale();
  const [showLang, setShowLang] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => {
      const u = getUser();
      setUser(u);
      if (u) fetchUnreadCount();
    };
    const syncCart = () => setCount(cartCount(getCart()));
    sync(); syncCart();
    window.addEventListener("fmk-auth-changed", sync);
    window.addEventListener("fmk-cart-changed", syncCart);
    window.addEventListener("storage", sync);

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });

    const onClickOut = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOut);

    return () => {
      window.removeEventListener("fmk-auth-changed", sync);
      window.removeEventListener("fmk-cart-changed", syncCart);
      window.removeEventListener("storage", sync);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClickOut);
    };
  }, []);

  async function fetchUnreadCount() {
    try {
      const { apiFetch } = await import("@/lib/apiClient");
      const data = await apiFetch("/api/conversations/unread");
      setUnreadMsg(data.count || 0);
    } catch {}
  }

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new Event('fmk-auth-changed'));
    router.push('/');
  };

  return (
    <>
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center gap-4 min-h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Icon name="sprout" size={20} strokeWidth={2.1} />
          </span>
          <span className="font-extrabold text-lg text-brand-700 hidden sm:inline tracking-tight">
            Fermer<span className="text-gray-900">Market</span>
          </span>
        </Link>

        {/* Desktop search */}
        <form action="/products" className="hidden md:flex flex-1 max-w-lg h-10 mx-2">
          <div className="flex w-full rounded-2xl border border-gray-200 overflow-hidden focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
            <input
              name="search"
              placeholder="Məhsul, kateqoriya axtar..."
              className="flex-1 min-w-0 h-full px-4 text-sm bg-gray-50 focus:outline-none focus:bg-white transition-colors"
            />
            <button
              type="submit"
              className="shrink-0 w-11 h-full flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white transition-colors"
            >
              <Icon name="search" size={17} strokeWidth={2.2} />
            </button>
          </div>
        </form>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="btn-ghost text-sm font-medium">{l.label}</Link>
          ))}
          {/* Desktop "Elan ver" CTA — primary action */}
          <Link
            href="/elan-yerlesdir"
            className="hidden md:flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-sm ml-1"
          >
            <Icon name="plus" size={16} strokeWidth={2.3} />
            Yeni Elan
          </Link>
              {user && <NotificationBell />}
          {user && (
            <Link href="/messages" className="btn-ghost relative text-sm font-medium">
              <Icon name="message" size={18} />
              {unreadMsg > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadMsg > 9 ? "9+" : unreadMsg}
                </span>
              )}
            </Link>
          )}
          <Link href="/cart" className="btn-ghost relative text-sm font-medium">
            <Icon name="cart" size={18} />
            {count > 0 && (
              <span className="absolute top-1 right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 h-9 px-3 rounded-2xl border border-gray-200 hover:border-brand-300 bg-white text-sm font-medium transition-all"
              >
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  {user.fullName?.[0] || "U"}
                </span>
                <span className="max-w-[80px] truncate">{user.fullName?.split(" ")[0]}</span>
                <Icon name="chevronDown" size={13} className={`text-gray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 card shadow-lg p-1.5 text-sm z-50">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-400">{ROLE_LABELS[user.role]}</p>
                  </div>
                  <Link href="/messages" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 font-medium" onClick={() => setMenuOpen(false)}>
                    <Icon name="message" size={16} />
                    <span>Mesajlar</span>
                    {unreadMsg > 0 && (
                      <span className="ml-auto bg-brand-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {unreadMsg}
                      </span>
                    )}
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 font-medium" onClick={() => setMenuOpen(false)}>
                    <Icon name="dashboard" size={16} /> Panelim
                  </Link>
                  <Link href="/elan-yerlesdir" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 font-medium" onClick={() => setMenuOpen(false)}>
                    <Icon name="plus" size={16} /> Elan ver
                  </Link>
                  <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-medium mt-1 border-t border-gray-100">
                    <Icon name="logout" size={16} /> Çıxış
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="ml-1 btn-primary text-sm py-2">Giriş</Link>
          )}
        </nav>

        {/* Mobile right icons */}
        <div className="md:hidden flex items-center gap-1.5 ml-auto">
          {user && <NotificationBell />}
          <Link href="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-lg transition-colors">
            <Icon name="cart" size={20} />
            {count > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile search bar - Premium SaaS Style */}
        <div className="md:hidden w-full pb-3 px-1 mt-1">
          <form action="/products" className="flex h-11 shadow-sm rounded-full overflow-hidden border border-gray-200 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-50 transition-all bg-gray-50">
            <div className="flex items-center justify-center w-11 text-gray-400">
              <Icon name="search" size={18} strokeWidth={2.2} />
            </div>
            <input
              name="search"
              placeholder="Məhsul, kateqoriya axtar..."
              className="flex-1 min-w-0 h-full text-sm bg-transparent focus:outline-none text-gray-800 pr-4"
            />
          </form>
        </div>
      </div>
    </header>
    </>
  );
}