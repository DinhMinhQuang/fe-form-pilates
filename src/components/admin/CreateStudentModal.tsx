"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import ErrorBox from "@/components/ErrorBox";
import Btn from "@/components/Btn";
import { adminStudentApi } from "@/lib/api";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateStudentModal({ open, onClose, onCreated }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  function reset() {
    setFullName(""); setEmail(""); setPhone(""); setNotes(""); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminStudentApi.create({
        full_name: fullName,
        email: email || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      });
      reset();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Thêm học viên" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Họ tên <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input
            className={inputClass}
            style={inputStyle}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Thị A"
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Email
          </label>
          <input
            type="email"
            className={inputClass}
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="a@example.com"
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Số điện thoại
          </label>
          <input
            type="tel"
            className={inputClass}
            style={inputStyle}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0901234567"
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Ghi chú
          </label>
          <textarea
            className={inputClass}
            style={{ ...inputStyle, resize: "none" }}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ghi chú nội bộ..."
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          />
        </div>

        {error && <ErrorBox error={error} />}

        <div className="flex gap-2 pt-1">
          <Btn variant="ghost" className="flex-1" type="button" onClick={handleClose}>Huỷ</Btn>
          <Btn variant="primary" className="flex-1" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Tạo học viên"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
