"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getUser } from "@/lib/auth";
import type { AppUser, Role } from "@/types";

export function useAuth(requiredRole?: Role | Role[]) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = getUser();
    setUser(current);
    setReady(true);

    if (!current) {
      router.replace("/login");
      return;
    }

    if (requiredRole) {
      const allowed = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];
      if (!allowed.includes(current.role)) {
        router.replace(roleHome(current.role));
      }
    }
  }, []);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return { user, ready, logout };
}

export function roleHome(role: Role): string {
  switch (role) {
    case "student":
      return "/schedule";
    case "trainer":
      return "/trainer";
    case "admin":
      return "/admin/sessions";
  }
}
