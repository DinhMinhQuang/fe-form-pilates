"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import ErrorBox from "@/components/ErrorBox";
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
  const [error, setError] = useState<unknown>(null);

  function reset() {
    setFullName(""); setEmail(""); setPhone(""); setPassword(""); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminTrainerApi.create({ full_name: fullName, email, phone, password });
      reset();
      onCreated();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Thêm huấn luyện viên" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Họ tên <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input
            className={inputClass} style={inputStyle}
            value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="Trần Thị B" required
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
              placeholder="b@formstudio.vn" required
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
              placeholder="0901234567" required
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
            placeholder="••••••••" required minLength={8}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          />
        </div>

        {error && <ErrorBox error={error} />}

        <div className="flex gap-2 pt-1">
          <button
            type="button" onClick={handleClose}
            className="flex-1 rounded-lg py-2.5 text-sm font-medium border"
            style={{ borderColor: "var(--sand)", color: "var(--warm-gray)" }}
          >
            Huỷ
          </button>
          <button
            type="submit" disabled={loading}
            className="flex-1 rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
            style={{ background: "var(--charcoal)", color: "var(--white)" }}
          >
            {loading ? "Đang lưu..." : "Tạo HLV"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
