"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import { adminTrainerApi } from "@/lib/api";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTrainerModal({ open, onClose, onCreated }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  function reset() {
    setFullName(""); setEmail(""); setPhone(""); setPassword(""); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!fullName.trim()) {
      setError(new Error("Vui lòng nhập họ tên"));
      return;
    }
    if (!email.trim()) {
      setError(new Error("Vui lòng nhập email"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(new Error("Email không hợp lệ"));
      return;
    }
    if (!phone.trim()) {
      setError(new Error("Vui lòng nhập số điện thoại"));
      return;
    }
    if (!password) {
      setError(new Error("Vui lòng nhập mật khẩu"));
      return;
    }
    if (password.length < 10) {
      setError(new Error("Mật khẩu phải có ít nhất 10 ký tự"));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await adminTrainerApi.create({ full_name: fullName, email, phone, password });
      reset();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Thêm huấn luyện viên" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Họ tên <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input
            className={inputClass} style={inputStyle}
            value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="Trần Thị B"
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Email <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              type="email" className={inputClass} style={inputStyle}
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="b@formstudio.vn"
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Điện thoại <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              type="tel" className={inputClass} style={inputStyle}
              value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Mật khẩu <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input
            type="password" className={inputClass} style={inputStyle}
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          />
        </div>

        <FormError error={error} />

        <div className="flex gap-2 pt-1">
          <Btn variant="ghost" className="flex-1" type="button" onClick={handleClose}>Huỷ</Btn>
          <Btn variant="primary" className="flex-1" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Tạo HLV"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
