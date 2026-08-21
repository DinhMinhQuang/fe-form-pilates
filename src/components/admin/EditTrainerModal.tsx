"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import { adminTrainerApi } from "@/lib/api";
import type { Trainer } from "@/types";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };
const MIN_PASSWORD_LENGTH = 10;

interface Props {
  trainer: Trainer | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditTrainerModal({ trainer, onClose, onSaved }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (trainer) {
      setFullName(trainer.full_name);
      setEmail(trainer.email ?? "");
      setPhone(trainer.phone ?? "");
      setNewPassword("");
      setError(null);
    }
  }, [trainer]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!trainer) return;

    if (!fullName.trim()) {
      setError(new Error("Vui lòng nhập họ tên"));
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(new Error("Email không hợp lệ"));
      return;
    }
    if (newPassword && newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(new Error(`Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await adminTrainerApi.update(trainer.id, {
        full_name: fullName,
        email,
        phone,
        ...(newPassword ? { password: newPassword } : {}),
      });
      setNewPassword("");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus() {
    if (!trainer) return;
    const disable = trainer.status === "active";
    if (disable && !window.confirm(`Vô hiệu hoá HLV "${trainer.full_name}"?`)) return;
    setTogglingStatus(true);
    try {
      if (disable) {
        await adminTrainerApi.disable(trainer.id);
      } else {
        await adminTrainerApi.update(trainer.id, { status: "active" });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setTogglingStatus(false);
    }
  }

  return (
    <Modal title="Sửa huấn luyện viên" open={!!trainer} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Họ tên <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input className={inputClass} style={inputStyle} value={fullName} onChange={(e) => setFullName(e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Email</label>
            <input type="email" className={inputClass} style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Điện thoại</label>
            <input type="tel" className={inputClass} style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Đặt lại mật khẩu</label>
          <input
            type="password" className={inputClass} style={inputStyle} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          />
          <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
            Để trống nếu không đổi. Nếu nhập, cần ít nhất {MIN_PASSWORD_LENGTH} ký tự.
          </p>
        </div>

        <FormError error={error} />

        {trainer && (
          <Btn
            variant={trainer.status === "active" ? "danger" : "ghost"}
            type="button"
            disabled={togglingStatus}
            onClick={handleToggleStatus}
          >
            {togglingStatus ? "..." : trainer.status === "active" ? "Vô hiệu hoá HLV" : "Kích hoạt lại"}
          </Btn>
        )}

        <div className="flex gap-2 pt-1">
          <Btn variant="ghost" className="flex-1" type="button" onClick={onClose}>Huỷ</Btn>
          <Btn variant="primary" className="flex-1" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
