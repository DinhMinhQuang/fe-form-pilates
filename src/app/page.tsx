"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { roleHome } from "@/hooks/useAuth";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    router.replace(user ? roleHome(user.role) : "/login");
  }, []);

  return null;
}
