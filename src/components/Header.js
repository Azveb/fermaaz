"use client";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { useEffect, useState, useRef } from "react";
import { getUser } from "@/lib/apiClient";
import { getCart, cartCount } from "@/lib/cartClient";
import NotificationBell from "@/components/NotificationBell";
import { useLocale, useTranslations } from "next-intl";
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

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();

  const [user, setUser] = useState(null);
  const [count, setCount] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const NAV_LINKS = [
    { href: "/products", label: t("products") },
    { href: "/categories", label: t("categories") },
    { href: "/campaigns", label: t("campaigns") },
    { href: "/stores", label: t("stores") },
    { href: "/blog", label: t("blog") },
    { href: "/agronom", label: t("agronom") },
  ];

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

  const changeLanguage = (newLocale) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/(az|en|ru)/, `/${newLocale}`);
    window.location.href = newPath + window.location.search;
  };

  return (
    <>
    <header
      className={`sticky top-0 z-50 transition-all duration-300 mt-2 md:mt-4 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex flex-wrap items-center justify-between gap-4">
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
        <form action={`/${locale}/products`} className="hidden md:flex flex-1 max-w-lg h-10 mx-4">
          <div className="flex w-full rounded-2xl border border-gray-200 overflow-hidden focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
            <input
              name="search"
              placeholder={t("search_placeholder")}
              className="flex-1 min-w-0 h-full px-4 text-sm bg-gray-50 focus:outline-none focus:bg-white transition-colors"
            />
            <button
              type="submit"
              className="shrink-0 w-12 h-full flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white transition-colors"
            >
              <Icon name="search" size={18} strokeWidth={2.2} />
            </button>
          </div>
        </form>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowLang((v) => !v)}
              className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-gray-200 hover:border-brand-300 bg-white text-sm font-semibold text-gray-700 transition shadow-sm"
            >
              <Icon name="globe" size={16} className="text-brand-600" />
              {locale.toUpperCase()}
            </button>
            {showLang && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 w-24">
                {Object.keys(LOCALE_LABELS).map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLanguage(l)}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition ${
                      locale === l ? "text-brand-600 bg-brand-50/50" : "text-gray-700"
                    }`}
                  >
                    {LOCALE_LABELS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/elan-yerlesdir"
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <Icon name="plus" size={16} strokeWidth={2.3} />
            {locale === "az" ? "Yeni Elan" : locale === "ru" ? "Новое Обьявление" : "New Listing"}
          </Link>

          {user && (
            <Link href="/messages" className="relative w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:border-brand-300 hover:bg-gray-50 text-gray-700 transition-all">
              <Icon name="message" size={24} strokeWidth={2} />
              {unreadMsg > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[12px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {unreadMsg > 9 ? "9+" : unreadMsg}
                </span>
              )}
            </Link>
          )}
          
          <Link href="/cart" className="relative w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm hover:border-brand-300 hover:bg-gray-50 text-gray-700 transition-all">
            <Icon name="cart" size={24} strokeWidth={2} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[12px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 h-10 px-3 rounded-2xl border border-gray-200 hover:border-brand-300 bg-white text-sm font-medium transition-all shadow-sm"
              >
                <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                  {user.fullName?.[0] || "U"}
                </span>
                <span className="max-w-[80px] truncate">{user.fullName?.split(" ")[0]}</span>
                <Icon name="chevronDown" size={13} className={`text-gray-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 card shadow-xl p-2 text-sm z-50 rounded-2xl border border-gray-100">
                  <div className="px-3 py-2 border-b border-gray-100 mb-2">
                    <p className="font-semibold text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
                  </div>
                  {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-brand-700 font-medium transition" onClick={() => setMenuOpen(false)}>
                      <Icon name="layoutDashboard" size={16} /> Admin Panel
                    </Link>
                  )}
                  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-50 hover:text-brand-700 font-medium transition" onClick={() => setMenuOpen(false)}>
                    <Icon name="dashboard" size={16} /> {t("dashboard")}
                  </Link>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 font-medium mt-1 transition">
                    <Icon name="logout" size={16} /> {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="ml-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm px-5 py-2 rounded-xl transition">{t("login")}</Link>
          )}
        </div>

        {/* Mobile right icons */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          {user && <NotificationBell />}
          
          {/* Mobile Cart Icon */}
          <Link href="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm active:scale-95 transition-transform">
            <Icon name="cart" size={20} strokeWidth={2} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm animate-pulse">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
          
          {/* Mobile Lang Switch */}
          <button
            onClick={() => {
              const next = locale === "az" ? "en" : locale === "en" ? "ru" : "az";
              changeLanguage(next);
            }}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 bg-white"
          >
            {locale.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Desktop Bottom Menu Row */}
      <div className="hidden md:block border-t border-gray-100 bg-white">
        <nav className="max-w-6xl mx-auto px-4 h-11 flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[13px] font-bold text-gray-600 hover:text-brand-700 transition">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile search bar (Only visible on small screens) */}
      <div className="md:hidden w-full pb-3 px-3 mt-1 bg-white">
        <form action={`/${locale}/products`} className="flex h-11 shadow-sm rounded-xl overflow-hidden border border-gray-200 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-50 transition-all bg-gray-50">
          <div className="flex items-center justify-center w-11 text-gray-400">
            <Icon name="search" size={18} strokeWidth={2.2} />
          </div>
          <input
            name="search"
            placeholder={t("search_placeholder")}
            className="flex-1 min-w-0 h-full text-sm bg-transparent focus:outline-none text-gray-800 pr-4"
          />
        </form>
      </div>
    </header>
    </>
  );
}