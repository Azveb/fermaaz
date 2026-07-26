"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { apiFetch, getUser } from "@/lib/apiClient";
import Icon from "@/components/ui/Icon";

function NavItem({ href, label, icon, active, badge }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex-1 flex flex-col items-center justify-center py-1 gap-0.5 relative transition-colors duration-150 min-w-0 ${
        active ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <span className={`leading-none transition-transform duration-200 ${active ? "scale-110" : ""}`}>
        <Icon name={icon} size={21} strokeWidth={active ? 2.2 : 1.8} />
      </span>
      <span className="text-[10px] font-medium leading-none whitespace-nowrap truncate w-full text-center px-0.5">
        {label}
      </span>
      {badge > 0 && (
        <span className="absolute top-0 right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const [unreadMsg, setUnreadMsg] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = getUser();
    setIsLoggedIn(!!user);
    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  async function fetchUnread() {
    try {
      const data = await apiFetch("/api/conversations/unread");
      setUnreadMsg(data.count || 0);
    } catch {}
  }

  if (!mounted) return null;

  const leftItems = [
    { href: "/",           label: "Əsas",     icon: "home" },
    { href: "/categories", label: "Kataloq",  icon: "dashboard" },
  ];
  const rightItems = isLoggedIn
    ? [
        { href: "/messages",  label: "Mesajlar", icon: "message", badge: unreadMsg },
        { href: "/dashboard", label: "Profil",   icon: "user" },
      ]
    : [
        { href: "/blog",  label: "Bloq",  icon: "newspaper" },
        { href: "/login", label: "Giriş", icon: "user" },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
      <div className="flex items-end" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex items-stretch w-full h-16 flex-nowrap">

          {/* Sol 2 buton — hər biri flex-1 (NavItem-in özündə) */}
          {leftItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
            />
          ))}

          {/* Center Floating FAB */}
          <div className="flex-shrink-0 w-[72px] flex flex-col items-center justify-end pb-1 relative z-10">
            <Link
              href="/elan-yerlesdir"
              aria-label="Elan yerləşdir"
              className="absolute -top-6 w-[56px] h-[56px] rounded-full bg-gradient-to-br from-brand-500 to-brand-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 border-[4px] border-white transition-all"
            >
              <Icon name="plus" size={24} strokeWidth={2.8} />
            </Link>
            <span className="text-[10px] font-bold text-brand-700 mt-9 leading-none">Sat</span>
          </div>

          {/* Sağ 2 buton — hər biri flex-1 */}
          {rightItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname.startsWith(item.href)}
              badge={item.badge || 0}
            />
          ))}

        </div>
      </div>
    </nav>
  );
}
