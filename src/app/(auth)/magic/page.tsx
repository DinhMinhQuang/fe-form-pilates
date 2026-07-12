"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, meApi } from "@/lib/api";
import { setSession, setToken } from "@/lib/auth";
import { roleHome } from "@/hooks/useAuth";
import ErrorBox from "@/components/ErrorBox";

function MagicExchange() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError(new Error("Link không hợp lệ."));
      return;
    }
    authApi
      .exchangeMagicToken(token)
      .then(async ({ access_token }) => {
        setToken(access_token);
        const user = await meApi.profile();
        setSession(access_token, user);
        router.replace(roleHome(user.role));
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Link hết hạn hoặc đã dùng."));
      });
  }, []);

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorBox error={error} />
        <a
          href="/student/login"
          className="text-sm text-center underline underline-offset-2"
          style={{ color: "var(--warm-gray)" }}
        >
          Gửi lại link đăng nhập
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--sand)", borderTopColor: "var(--accent)" }} />
      <p className="text-sm" style={{ color: "var(--warm-gray)" }}>Đang xác thực...</p>
    </div>
  );
}

export default function MagicPage() {
  return (
    <div
      className="w-full max-w-sm rounded-2xl border p-8"
      style={{ background: "var(--white)", borderColor: "var(--sand)" }}
    >
      <div className="text-sm font-semibold mb-6 text-center" style={{ color: "var(--charcoal)" }}>
        FORM Pilates
      </div>
      <Suspense fallback={<p className="text-sm text-center" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</p>}>
        <MagicExchange />
      </Suspense>
    </div>
  );
}
