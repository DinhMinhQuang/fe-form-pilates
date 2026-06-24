"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  {
    href: "/schedule",
    label: "Lịch học",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/bookings",
    label: "Đặt chỗ của tôi",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
  },
  {
    href: "/credits",
    label: "Số buổi",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
      </svg>
    ),
  },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth("student");
  const pathname = usePathname();

  if (!ready) return null;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cream)" }}>
      {/* Sidebar */}
      <aside className="w-60 flex flex-col fixed inset-y-0 left-0 z-20" style={{ background: "var(--charcoal)", color: "var(--white)" }}>
        <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: "#2E2E2E" }}>
          <div className="text-xs tracking-[0.2em] uppercase mb-1" style={{ color: "var(--warm-gray-light)" }}>
            Học viên
          </div>
          <div className="font-semibold tracking-wide text-base" style={{ color: "var(--white)" }}>
            FORM Pilates
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "var(--white)" : "var(--warm-gray-light)",
                }}
              >
                <span style={{ color: active ? "var(--white)" : "var(--warm-gray)" }}>{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-5 border-t" style={{ borderColor: "#2E2E2E" }}>
          <div className="text-xs mb-0.5" style={{ color: "var(--warm-gray-light)" }}>{user?.full_name}</div>
          <button
            onClick={logout}
            className="text-xs transition-colors"
            style={{ color: "var(--warm-gray)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--warm-gray)")}
          >
            Đăng xuất →
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <header className="h-14 flex items-center px-8 border-b sticky top-0 z-10" style={{ background: "var(--white)", borderColor: "var(--sand)" }}>
          <span className="text-sm" style={{ color: "var(--warm-gray)" }}>
            {NAV.find((n) => pathname === n.href)?.label ?? ""}
          </span>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
