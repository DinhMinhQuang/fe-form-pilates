"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, meApi } from "@/lib/api";
import { setSession, setToken } from "@/lib/auth";
import { roleHome } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
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
        <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: "var(--warm-gray)" }}>
          Studio Management
        </div>
        <div className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>
          FORM Pilates
        </div>
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

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--warm-gray)" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="ten@formstudio.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors"
              style={{
                borderColor: "var(--sand)",
                background: "var(--cream)",
                color: "var(--charcoal)",
              }}
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
              required
              className="rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors"
              style={{
                borderColor: "var(--sand)",
                background: "var(--cream)",
                color: "var(--charcoal)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#B94B4B", background: "#FBF0F0" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg py-2.5 text-sm font-medium transition-opacity disabled:opacity-50 mt-1"
            style={{ background: "var(--charcoal)", color: "var(--white)" }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-6 text-xs text-center" style={{ color: "var(--warm-gray-light)" }}>
          Học viên đăng nhập qua magic link được gửi qua email.
        </p>
      </div>
    </div>
  );
}
