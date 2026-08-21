"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import Btn from "@/components/Btn";
import FormError from "@/components/FormError";
import ErrorBox from "@/components/ErrorBox";

const MIN_PASSWORD_LENGTH = 10;

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorBox error="Link không hợp lệ." />
        <a
          href="/forgot-password"
          className="text-sm text-center underline underline-offset-2"
          style={{ color: "var(--warm-gray)" }}
        >
          Gửi lại link đặt lại mật khẩu
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-3 text-center py-2">
        <p className="text-sm" style={{ color: "var(--charcoal)" }}>
          Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.
        </p>
        <a
          href="/login"
          className="text-xs underline underline-offset-2 self-center"
          style={{ color: "var(--warm-gray)" }}
        >
          Đăng nhập
        </a>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(new Error(`Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(new Error("Xác nhận mật khẩu mới không khớp"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.confirmPasswordReset(token as string, newPassword);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--warm-gray)" }}>
          Mật khẩu mới
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors"
          style={{ borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
        />
        <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>Ít nhất {MIN_PASSWORD_LENGTH} ký tự.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--warm-gray)" }}>
          Xác nhận mật khẩu mới
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors"
          style={{ borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
        />
      </div>

      <FormError error={error} />

      <Btn type="submit" disabled={loading} className="w-full mt-1 !bg-[var(--olive)] hover:!bg-[var(--charcoal)]">
        {loading ? "Đang lưu..." : "Đặt lại mật khẩu"}
      </Btn>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          Đặt lại mật khẩu
        </h1>
        <p className="text-sm mb-7" style={{ color: "var(--warm-gray)" }}>
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>

        <Suspense fallback={<p className="text-sm text-center" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
