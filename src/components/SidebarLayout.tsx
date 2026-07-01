"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  nav: NavItem[];
  role: "admin" | "trainer" | "student";
  matchStart?: boolean;
  userName?: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function SidebarLayout({ nav, matchStart, userName, onLogout, children }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    return matchStart ? pathname.startsWith(href) : pathname === href;
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cream)" }}>

      {/* Sidebar — w-16 by default, w-56 on xl */}
      <aside
        className="fixed inset-y-0 left-0 z-20 flex flex-col w-16 xl:w-56 transition-all duration-200"
        style={{ background: "var(--olive)", color: "var(--white)", overflow: "hidden" }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center xl:justify-start border-b flex-shrink-0 overflow-hidden"
          style={{ borderColor: "var(--charcoal-soft)", height: 64 }}
        >
          {/* Icon only on small, full logo on xl */}
          <img
            src="/logo-icon.svg"
            alt="FORM"
            className="block xl:hidden"
            style={{ width: 26, height: 26, filter: "brightness(0) invert(1)", opacity: 0.85 }}
          />
          <img
            src="/logo-full.svg"
            alt="FORM Pilates"
            className="hidden xl:block"
            style={{ width: 170, height: "auto", filter: "brightness(0) invert(1)", opacity: 0.9, marginLeft: 20 }}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
          {nav.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                title={n.label}
                className="flex items-center w-full rounded-lg font-medium transition-all duration-150"
                style={{
                  height: 40,
                  paddingLeft: 0,
                  paddingRight: 0,
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "var(--white)" : "var(--warm-gray-light)",
                  fontSize: 14,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--charcoal-soft)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {/* Icon column — fixed 40px, always centered */}
                <span className="flex items-center justify-center flex-shrink-0" style={{ width: 40, opacity: active ? 1 : 0.7 }}>
                  {n.icon}
                </span>
                {/* Label — only visible on xl */}
                <span className="hidden xl:block pr-3">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="border-t flex-shrink-0 flex flex-col items-center xl:items-start"
          style={{ borderColor: "var(--charcoal-soft)", padding: "14px 0" }}
        >
          {/* Collapsed: just logout icon */}
          <button
            onClick={onLogout}
            title="Đăng xuất"
            className="xl:hidden flex items-center justify-center w-16 py-1 transition-colors"
            style={{ color: "var(--warm-gray-light)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--warm-gray-light)")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>

          {/* Expanded: name + logout text */}
          <div className="hidden xl:flex flex-col gap-1.5 px-5 w-full">
            <div className="text-xs font-medium truncate" style={{ color: "var(--cream-dark)" }}>{userName}</div>
            <button
              onClick={onLogout}
              className="text-xs text-left transition-colors"
              style={{ color: "var(--warm-gray-light)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--warm-gray-light)")}
            >
              Đăng xuất →
            </button>
          </div>
        </div>
      </aside>

      {/* Main — ml-16 default, ml-56 on xl */}
      <div className="flex-1 ml-16 xl:ml-56 flex flex-col min-h-screen transition-all duration-200">
        <header
          className="h-14 flex items-center px-5 xl:px-8 border-b sticky top-0 z-10"
          style={{ background: "var(--white)", borderColor: "var(--sand)" }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--warm-gray)" }}>
            {nav.find((n) => isActive(n.href))?.label ?? ""}
          </span>
        </header>
        <main key={pathname} className="page-content flex-1 p-4 xl:p-8">{children}</main>
      </div>
    </div>
  );
}
