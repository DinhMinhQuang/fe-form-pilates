"use client";

import { useAuth } from "@/hooks/useAuth";
import NavbarLayout from "@/components/NavbarLayout";

const NAV = [
  {
    href: "/schedule",
    label: "Lịch học",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  },
  {
    href: "/bookings",
    label: "Đặt lịch của tôi",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>,
  },
  {
    href: "/credits",
    label: "Số buổi",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth("student");
  if (!ready) return null;
  return (
    <NavbarLayout nav={NAV} userName={user?.full_name} userEmail={user?.email ?? undefined} onLogout={logout}>
      {children}
    </NavbarLayout>
  );
}
