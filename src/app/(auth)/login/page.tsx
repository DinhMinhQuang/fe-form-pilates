"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, meApi } from "@/lib/api";
import { setSession, setToken } from "@/lib/auth";
import { roleHome } from "@/hooks/useAuth";
import Btn from "@/components/Btn";
import FormError from "@/components/FormError";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const { access_token } = await authApi.staffLogin(email, password);
      setToken(access_token);
      const user = await meApi.profile();
      setSession(access_token, user);
      router.replace(roleHome(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Mobile logo */}
      <div className="lg:hidden mb-8">
        <img src="/logo-full.svg" alt="FORM Pilates" style={{ width: 160, height: "auto", opacity: 0.85 }} />
      </div>

      <div
        className="rounded-2xl p-8 shadow-sm border"
        style={{ background: "var(--white)", borderColor: "var(--sand)" }}
      >
        <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--charcoal)" }}>
          Đăng nhập
        </h1>
        <p className="text-sm mb-7" style={{ color: "var(--warm-gray)" }}>
          Dành cho nhân viên & huấn luyện viên
        </p>

        <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--warm-gray)" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="ten@formstudio.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors"
              style={{ borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--warm-gray)" }}>
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors"
              style={{ borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            />
          </div>

          <FormError error={error} />

          <Btn type="submit" disabled={loading} className="w-full mt-1 !bg-[var(--olive)] hover:!bg-[var(--charcoal)]">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Btn>
        </form>

        <p className="mt-6 text-xs text-center" style={{ color: "var(--warm-gray-light)" }}>
          Học viên đăng nhập qua magic link được gửi qua email.
        </p>
      </div>
    </div>
  );
}
