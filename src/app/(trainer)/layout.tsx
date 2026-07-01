"use client";

import { useAuth } from "@/hooks/useAuth";
import NavbarLayout from "@/components/NavbarLayout";

const NAV = [
  {
    href: "/trainer",
    label: "Lịch dạy",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  },
];

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth("trainer");
  if (!ready) return null;
  return (
    <NavbarLayout nav={NAV} accountHref="/trainer/account" userName={user?.full_name} userEmail={user?.email ?? undefined} onLogout={logout}>
      {children}
    </NavbarLayout>
  );
}
