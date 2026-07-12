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
      router.replace(loginPathFor(requiredRole));
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
    const role = user?.role;
    clearSession();
    router.replace(role === "student" ? "/student/login" : "/login");
  }

  return { user, ready, logout };
}

function loginPathFor(requiredRole?: Role | Role[]): string {
  const roles = Array.isArray(requiredRole) ? requiredRole : requiredRole ? [requiredRole] : [];
  return roles.length === 1 && roles[0] === "student" ? "/student/login" : "/login";
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
