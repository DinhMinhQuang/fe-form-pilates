"use client";

import { useState } from "react";
import useSWR from "swr";
import { meApi, trainerApi } from "@/lib/api";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";

const ROLE_LABEL: Record<string, string> = {
  student: "Học viên",
  trainer: "Huấn luyện viên",
  admin:   "Quản trị viên",
};

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };
const MIN_PASSWORD_LENGTH = 10;

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-4" style={{ borderBottom: "1px solid var(--cream-dark)" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--warm-gray)" }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: value ? "var(--charcoal)" : "var(--warm-gray-light)" }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
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
      await trainerApi.changePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--white)", border: "1px solid var(--sand)" }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
        <p className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>Đổi mật khẩu</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 p-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Mật khẩu hiện tại</label>
          <input type="password" className={inputClass} style={inputStyle} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Mật khẩu mới</label>
          <input type="password" className={inputClass} style={inputStyle} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>Ít nhất {MIN_PASSWORD_LENGTH} ký tự.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Xác nhận mật khẩu mới</label>
          <input type="password" className={inputClass} style={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>

        {success && <p className="text-xs" style={{ color: "#2E6B2E" }}>Đổi mật khẩu thành công.</p>}
        <FormError error={error} />

        <Btn variant="primary" type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Đổi mật khẩu"}
        </Btn>
      </form>
    </div>
  );
}

type Tab = "info" | "password";

export default function AccountPage() {
  const { data: user, isLoading } = useSWR("/me", meApi.profile);
  const [tab, setTab] = useState<Tab>("info");
  const canChangePassword = user?.role === "trainer";

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-widest uppercase" style={{ color: "var(--charcoal)" }}>
          Tài khoản
        </h1>
        <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: "var(--warm-gray)" }}>
          Thông tin cá nhân
        </p>
      </div>

      {!isLoading && canChangePassword && (
        <div className="flex gap-1 mb-4 rounded-lg p-1" style={{ background: "var(--cream)", border: "1px solid var(--sand)" }}>
          {([
            { key: "info", label: "Thông tin" },
            { key: "password", label: "Đổi mật khẩu" },
          ] as const).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="flex-1 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors"
              style={
                tab === t.key
                  ? { background: "var(--white)", color: "var(--charcoal)", boxShadow: "0 1px 2px rgba(28,28,28,0.08)" }
                  : { background: "transparent", color: "var(--warm-gray)" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-4 animate-pulse" style={{ borderBottom: "1px solid var(--cream-dark)" }}>
              <div className="h-3 w-20 rounded mb-2" style={{ background: "var(--cream-dark)" }} />
              <div className="h-4 w-40 rounded" style={{ background: "var(--cream-dark)" }} />
            </div>
          ))}
        </div>
      ) : tab === "password" && canChangePassword ? (
        <ChangePasswordCard />
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--white)", border: "1px solid var(--sand)" }}>
          {/* Avatar block */}
          <div className="flex items-center gap-4 p-5" style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
            <span
              className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
              style={{ width: 52, height: 52, background: "var(--olive)", color: "var(--white)", fontSize: 18, letterSpacing: "0.05em" }}
            >
              {user?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
            </span>
            <div>
              <p className="font-semibold text-base" style={{ color: "var(--charcoal)" }}>{user?.full_name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--warm-gray)" }}>
                {ROLE_LABEL[user?.role ?? ""] ?? user?.role}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="px-5">
            <Field label="Họ và tên"    value={user?.full_name} />
            <Field label="Email"        value={user?.email} />
            <Field label="Số điện thoại" value={user?.phone} />
            <Field label="Trạng thái"   value={user?.status === "active" ? "Đang hoạt động" : "Đã vô hiệu hoá"} />
          </div>
        </div>
      )}
    </div>
  );
}
