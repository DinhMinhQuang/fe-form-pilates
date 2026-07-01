"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import { meApi } from "@/lib/api";
import useSWR from "swr";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  nav: NavItem[];
  accountHref?: string;
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function NavbarLayout({ nav, accountHref = "/account", userName, userEmail, onLogout, children }: Props) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: profile } = useSWR(userMenuOpen ? "/me" : null, meApi.profile);

  function openMenu() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setPanelVisible(true);
    setUserMenuOpen(true);
  }

  function closeMenu() {
    setUserMenuOpen(false);
    closeTimerRef.current = setTimeout(() => setPanelVisible(false), 220);
  }

  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

  function isActive(href: string) {
    return pathname === href;
  }

  const initials = userName
    ? userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--cream)" }}>

      {/* ── Top navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 md:px-8"
        style={{ height: 56, background: "var(--white)", borderBottom: "1px solid var(--sand)" }}
      >
        {/* Logo */}
        <Link href={nav[0]?.href ?? "/"} className="flex-shrink-0 overflow-hidden flex items-center"
          style={{ height: 56, width: 160 }}>
          <img
            src="/logo-full.svg"
            alt="FORM Pilates"
            style={{ width: 160, height: "auto", filter: "brightness(0)", opacity: 0.9 }}
          />
        </Link>

        {/* User button */}
        <button
          onClick={() => userMenuOpen ? closeMenu() : openMenu()}
          className="flex items-center gap-2 transition-colors"
          style={{ padding: "4px 8px 4px 4px", borderRadius: 999, background: userMenuOpen ? "var(--cream)" : "transparent" }}
        >
          <span
            className="flex items-center justify-center rounded-full flex-shrink-0 font-bold"
            style={{ width: 30, height: 30, background: "var(--olive)", color: "var(--white)", fontSize: 11, letterSpacing: "0.05em" }}
          >
            {initials}
          </span>
          <span className="hidden md:block text-xs font-medium" style={{ color: "var(--charcoal)" }}>
            {userName}
          </span>
        </button>
      </header>

      {/* ── User side-panel ── */}
      {panelVisible && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.18)", animation: `${userMenuOpen ? "fadeIn" : "fadeOut"} 0.2s ease forwards` }}
            onClick={closeMenu}
          />
          {/* Panel */}
          <div
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
            style={{ width: 280, background: "var(--white)", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", animation: `${userMenuOpen ? "slideInRight" : "slideOutRight"} 0.22s cubic-bezier(0.4,0,0.2,1) forwards` }}
          >
            <div className="flex items-start gap-3 p-5 pb-4" style={{ borderBottom: "1px solid var(--sand)" }}>
              <span
                className="flex items-center justify-center rounded-full flex-shrink-0 font-bold"
                style={{ width: 44, height: 44, background: "var(--olive)", color: "var(--white)", fontSize: 15, letterSpacing: "0.05em" }}
              >
                {initials}
              </span>
              <div className="min-w-0 mt-1">
                <div className="font-semibold text-sm truncate" style={{ color: "var(--charcoal)" }}>{userName}</div>
                {userEmail && <div className="text-xs mt-0.5 truncate" style={{ color: "var(--warm-gray)" }}>{userEmail}</div>}
              </div>
              <button onClick={closeMenu} className="ml-auto flex-shrink-0 mt-0.5"
                style={{ color: "var(--warm-gray-light)", fontSize: 18, lineHeight: 1 }}>
                ✕
              </button>
            </div>

            <div className="flex flex-col" style={{ borderBottom: "1px solid var(--sand)" }}>
              {nav.map((n) => {
                const active = isActive(n.href);
                return (
                  <Link key={n.href} href={n.href} onClick={closeMenu}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors"
                    style={{ color: active ? "var(--accent)" : "var(--charcoal)", fontWeight: active ? 600 : 400, background: active ? "var(--cream)" : "transparent" }}>
                    <span style={{ opacity: 0.65 }}>{n.icon}</span>
                    {n.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col" style={{ borderBottom: "1px solid var(--sand)" }}>
              <Link href={accountHref} onClick={closeMenu}
                className="flex items-center gap-3 px-5 py-3.5 text-sm transition-colors"
                style={{ color: isActive(accountHref) ? "var(--accent)" : "var(--charcoal)", fontWeight: isActive(accountHref) ? 600 : 400, background: isActive(accountHref) ? "var(--cream)" : "transparent" }}
              >
                <span style={{ opacity: 0.65 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                Thông tin tài khoản
              </Link>
            </div>

            <div className="p-5 mt-auto">
              <button onClick={() => { closeMenu(); onLogout(); }}
                className="flex items-center gap-2 text-sm font-medium w-full transition-colors"
                style={{ color: "var(--warm-gray)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--charcoal)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--warm-gray)")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Page content (flex-1 pushes footer to bottom) ── */}
      <main className="flex-1 flex flex-col" style={{ paddingTop: 56 }}>
        {/* Inner content area — flex-1 so it expands and pushes footer down */}
        <div key={pathname} className="page-content flex-1 w-full max-w-2xl mx-auto px-4 py-6 md:py-10 pb-20 md:pb-10">
          {children}
        </div>
        <Footer />
      </main>

      {/* ── Bottom tab bar (mobile only, fixed) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex"
        style={{ height: 64, background: "var(--white)", borderTop: "1px solid var(--sand)" }}>
        {nav.map((n) => {
          const active = isActive(n.href);
          return (
            <Link key={n.href} href={n.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
              style={{ color: active ? "var(--accent)" : "var(--warm-gray)" }}>
              <span style={{ opacity: active ? 1 : 0.6 }}>{n.icon}</span>
              <span style={{ fontSize: 10, letterSpacing: "0.03em", fontWeight: 500 }}>{n.label}</span>
            </Link>
          );
        })}
        {/* Account tab */}
        <Link href={accountHref}
          className="flex-1 flex flex-col items-center justify-center gap-1"
          style={{ color: isActive(accountHref) ? "var(--accent)" : "var(--warm-gray)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isActive(accountHref) ? 1 : 0.65 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 500 }}>Tài khoản</span>
        </Link>
      </nav>
    </div>
  );
}
