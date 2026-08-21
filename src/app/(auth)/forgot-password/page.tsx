"use client";

import { useState } from "react";
import { authApi } from "@/lib/api";
import Btn from "@/components/Btn";
import FormError from "@/components/FormError";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const value = email.trim();
    if (!value) {
      setError("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      await authApi.requestPasswordReset(value);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi link. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Mobile logo */}
      <div className="lg:hidden mb-8">
        <img src="/logo-horizontal.svg" alt="FORM Pilates" style={{ width: 160, height: "auto", opacity: 0.85 }} />
      </div>

      <div
        className="rounded-2xl p-8 shadow-sm border"
        style={{ background: "var(--white)", borderColor: "var(--sand)" }}
      >
        <h1 className="text-lg font-semibold mb-1" style={{ color: "var(--charcoal)" }}>
          Quên mật khẩu
        </h1>
        <p className="text-sm mb-7" style={{ color: "var(--warm-gray)" }}>
          Dành cho nhân viên & huấn luyện viên
        </p>

        {sent ? (
          <div className="flex flex-col gap-3 text-center py-2">
            <p className="text-sm" style={{ color: "var(--charcoal)" }}>
              Nếu tài khoản tồn tại, chúng tôi đã gửi link đặt lại mật khẩu tới email của bạn.
            </p>
            <button
              type="button"
              className="text-xs underline underline-offset-2 self-center"
              style={{ color: "var(--warm-gray)" }}
              onClick={() => { setSent(false); setEmail(""); }}
            >
              Gửi lại
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequest} noValidate className="flex flex-col gap-4">
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

            <FormError error={error} />

            <Btn type="submit" disabled={loading} className="w-full mt-1 !bg-[var(--olive)] hover:!bg-[var(--charcoal)]">
              {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
            </Btn>
          </form>
        )}

        <p className="mt-6 text-xs text-center" style={{ color: "var(--warm-gray-light)" }}>
          Nhớ mật khẩu rồi?{" "}
          <a href="/login" className="underline underline-offset-2" style={{ color: "var(--warm-gray)" }}>
            Đăng nhập tại đây
          </a>
        </p>
      </div>
    </div>
  );
}
