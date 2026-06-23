"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, meApi } from "@/lib/api";
import { setSession, setToken } from "@/lib/auth";
import { roleHome } from "@/hooks/useAuth";

function MagicExchange() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError("Link không hợp lệ.");
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
        setError(
          err instanceof Error ? err.message : "Link hết hạn hoặc đã dùng.",
        );
      });
  }, []);

  if (error) {
    return (
      <>
        <p className="text-red-500 mb-4">{error}</p>
        <a href="/login" className="text-sm text-stone-600 underline">
          Quay lại đăng nhập
        </a>
      </>
    );
  }

  return <p className="text-stone-500 text-sm">Đang xác thực...</p>;
}

export default function MagicPage() {
  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
      <Suspense fallback={<p className="text-stone-500 text-sm">Đang tải...</p>}>
        <MagicExchange />
      </Suspense>
    </div>
  );
}
