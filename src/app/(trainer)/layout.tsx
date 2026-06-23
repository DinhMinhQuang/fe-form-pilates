"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV = [{ href: "/trainer", label: "Lịch dạy" }];

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, ready, logout } = useAuth("trainer");
  const pathname = usePathname();

  if (!ready) return null;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-4 h-14 flex items-center justify-between">
        <span className="font-semibold text-stone-800">FORM Pilates — HLV</span>
        <nav className="flex gap-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`text-sm font-medium ${
                pathname === n.href
                  ? "text-stone-900 underline underline-offset-4"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-stone-600">{user?.full_name}</span>
          <button
            onClick={logout}
            className="text-stone-400 hover:text-stone-700"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
