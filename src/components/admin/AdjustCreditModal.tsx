"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import { adminStudentApi } from "@/lib/api";
import type { CreditLot } from "@/types";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

interface Props {
  studentId: string;
  lot: CreditLot | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AdjustCreditModal({ studentId, lot, onClose, onSaved }: Props) {
  const [delta, setDelta] = useState(0);
  const [expiresAt, setExpiresAt] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (lot) {
      setDelta(0);
      setExpiresAt(lot.expires_at.slice(0, 10));
      setReason("");
      setError(null);
    }
  }, [lot]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lot) return;

    if (!reason.trim()) {
      setError(new Error("Vui lòng nhập lý do điều chỉnh"));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await adminStudentApi.adjustCredit(studentId, lot.id, {
        delta,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        reason,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  const preview = lot ? lot.sessions_remaining + delta : 0;

  return (
    <Modal title="Điều chỉnh gói tập" open={!!lot} onClose={onClose}>
      {lot && (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Package info */}
          <div className="rounded-lg px-4 py-3" style={{ background: "var(--cream)", borderRadius: 10 }}>
            <div className="text-xs mb-0.5" style={{ color: "var(--warm-gray)" }}>Gói tập</div>
            <div className="font-medium text-sm" style={{ color: "var(--charcoal)" }}>{lot.package_name}</div>
          </div>

          {/* Delta */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Điều chỉnh số buổi
            </label>
            <div className="flex items-center gap-3">
              <Btn variant="ghost" type="button" className="w-9 h-9 !px-0 text-lg" onClick={() => setDelta((d) => d - 1)}>−</Btn>
              <div className="flex-1 text-center">
                <span className="text-2xl font-semibold" style={{ color: delta >= 0 ? "#2E6B2E" : "#B94B4B" }}>
                  {delta >= 0 ? "+" : ""}{delta}
                </span>
              </div>
              <Btn variant="ghost" type="button" className="w-9 h-9 !px-0 text-lg" onClick={() => setDelta((d) => d + 1)}>+</Btn>
            </div>
            <p className="text-xs text-center" style={{ color: "var(--warm-gray-light)" }}>
              {lot.sessions_remaining} → <span style={{ color: "var(--charcoal)", fontWeight: 500 }}>{preview}</span> buổi
            </p>
          </div>

          {/* Expiry */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Ngày hết hạn
            </label>
            <input
              type="date"
              className={inputClass}
              style={inputStyle}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Lý do <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              className={inputClass}
              style={inputStyle}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Hoàn buổi do lỗi hệ thống"
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            />
          </div>

          <FormError error={error} />

          <div className="flex gap-2 pt-1">
            <Btn variant="ghost" className="flex-1" type="button" onClick={onClose}>Huỷ</Btn>
            <Btn variant="primary" className="flex-1" type="submit" disabled={loading || (delta === 0 && expiresAt === lot.expires_at.slice(0, 10))}>
              {loading ? "Đang lưu..." : "Xác nhận"}
            </Btn>
          </div>
        </form>
      )}
    </Modal>
  );
}
