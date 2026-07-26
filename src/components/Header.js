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

  useEffect(() => {
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
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center gap-4 min-h-[64px]">
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

        {/* Mobile right icons — NO "Elan ver" button here */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          {user && (
            <Link href="/messages" className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-lg">
              <Icon name="message" size={19} />
              {unreadMsg > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadMsg > 9 ? "9+" : unreadMsg}
                </span>
              )}
            </Link>
          )}
          <Link href="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-lg">
            <Icon name="cart" size={19} />
            {count > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm relative"
            >
              {user.fullName?.[0] || "U"}
            </button>
          ) : (
            <Link href="/login" className="btn-primary text-xs py-1.5 px-3">Giriş</Link>
          )}
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden w-full border-t border-gray-100 px-3 py-2">
          <form action="/products" className="flex h-9">
            <div className="flex w-full rounded-xl border border-gray-200 overflow-hidden focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
              <input
                name="search"
                placeholder="Məhsul axtar..."
                className="flex-1 min-w-0 h-full px-3 text-sm bg-gray-50 focus:outline-none focus:bg-white"
              />
              <button type="submit" className="shrink-0 w-10 h-full flex items-center justify-center bg-brand-600 text-white">
                <Icon name="search" size={16} strokeWidth={2.2} />
              </button>
            </div>
          </form>
        </div>
{/* Mobile Footer Menu */}
{menuOpen && user && (
  <>
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 md:hidden"
      onClick={() => setMenuOpen(false)}
    />

    {/* Menu */}
    <div
      className="
        md:hidden
        fixed
        left-3
        right-3
        bottom-20
        z-50
        bg-white
        rounded-3xl
        shadow-2xl
        border border-gray-100
        overflow-hidden
        animate-in
        slide-in-from-bottom-5
        duration-200
        max-h-[70vh]
        overflow-y-auto
      "
    >
      {/* User */}
      <div className="px-5 py-4 border-b">
        <p className="font-semibold text-gray-900 truncate">
          {user.fullName}
        </p>

        <p className="text-sm text-gray-500">
          {ROLE_LABELS[user.role]}
        </p>
      </div>

      <div className="p-2">

        <Link
          href="/dashboard"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 transition"
        >
          <Icon name="dashboard" size={20} />
          <span className="font-medium">
            Şəxsi Kabinet
          </span>
        </Link>

        <Link
          href="/messages"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 transition"
        >
          <Icon name="message" size={20} />

          <span className="font-medium">
            Mesajlar
          </span>

          {unreadMsg > 0 && (
            <span className="ml-auto bg-brand-600 text-white text-xs rounded-full min-w-[22px] h-[22px] flex items-center justify-center font-semibold">
              {unreadMsg}
            </span>
          )}
        </Link>

        <Link
          href="/elan-yerlesdir"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 transition"
        >
          <Icon name="plus" size={20} />

          <span className="font-medium">
            Yeni Elan
          </span>
        </Link>

        <button
          onClick={logout}
          className="
            w-full
            flex
            items-center
            gap-4
            px-4
            py-3
            rounded-2xl
            text-red-600
            hover:bg-red-50
            transition
            mt-1
          "
        >
          <span className="text-xl">🚪</span>

          <span className="font-semibold">
            Çıxış
          </span>
        </button>

      </div>
    </div>
  </>
)}
      </div>
    </header>

    {/* Mobile Bottom Navigation (App-like UX) */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        
        <Link href="/" className="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-brand-600">
          <Icon name="dashboard" size={22} className="mb-1" />
          <span className="text-[10px] font-medium">Əsas</span>
        </Link>
        
        <Link href="/products" className="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-brand-600">
          <Icon name="search" size={22} className="mb-1" />
          <span className="text-[10px] font-medium">Axtarış</span>
        </Link>

        {/* Center Floating FAB */}
        <div className="relative -top-5 flex justify-center w-16">
          <Link href="/elan-yerlesdir" className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-500/40 active:scale-95 transition-transform border-4 border-white">
            <Icon name="plus" size={24} strokeWidth={2.5} />
          </Link>
        </div>

        <Link href="/messages" className="relative flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-brand-600">
          <Icon name="message" size={22} className="mb-1" />
          <span className="text-[10px] font-medium">Mesaj</span>
          {unreadMsg > 0 && (
            <span className="absolute top-1.5 right-3 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
              {unreadMsg > 9 ? "9+" : unreadMsg}
            </span>
          )}
        </Link>

        {user ? (
          <Link href="/dashboard" className="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-brand-600">
            <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold mb-1 border border-brand-200">
              {user.fullName?.[0] || "U"}
            </div>
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        ) : (
          <Link href="/login" className="flex flex-col items-center justify-center w-16 h-full text-gray-500 hover:text-brand-600">
             <Icon name="logout" size={22} className="mb-1" />
             <span className="text-[10px] font-medium">Giriş</span>
          </Link>
        )}
      </div>
    </nav>
    </>
  );
}