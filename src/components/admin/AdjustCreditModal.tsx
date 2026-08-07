"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import { adminStudentApi } from "@/lib/api";
import { dateInputToEndOfDayIso, toDateInputValue } from "@/lib/date";
import type { CreditHistoryEntry, CreditLot } from "@/types";

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
      setExpiresAt(toDateInputValue(lot.expires_at));
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
      const expiryChanged = expiresAt !== toDateInputValue(lot.expires_at);
      await adminStudentApi.adjustCredit(studentId, lot.id, {
        delta: delta !== 0 ? delta : undefined,
        expires_at: expiryChanged && expiresAt ? dateInputToEndOfDayIso(expiresAt) : undefined,
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

  const { data: history, isLoading: historyLoading, error: historyError } = useSWR(
    lot ? ["/admin/credits/history", studentId, lot.id] : null,
    () => adminStudentApi.creditHistory(studentId, lot!.id),
  );

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
            <Btn variant="primary" className="flex-1" type="submit" disabled={loading || (delta === 0 && expiresAt === toDateInputValue(lot.expires_at))}>
              {loading ? "Đang lưu..." : "Xác nhận"}
            </Btn>
          </div>
        </form>
      )}

      {lot && (
        <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--sand)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--warm-gray)" }}>
            Lịch sử điều chỉnh
          </h3>
          {historyError && <FormError error={historyError} />}
          {historyLoading ? (
            <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</p>
          ) : !history?.length ? (
            <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>Chưa có thay đổi nào</p>
          ) : (
            <ul className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
              {history.map((h: CreditHistoryEntry, i: number) => (
                <li key={i} className="text-xs" style={{ borderLeft: "2px solid var(--sand)", paddingLeft: 10 }}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: "var(--charcoal)" }}>
                      {h.kind === "credit"
                        ? `${(h.detail.delta ?? 0) >= 0 ? "+" : ""}${h.detail.delta} buổi (còn ${h.detail.balance_after})`
                        : `Đổi hạn dùng: ${h.detail.old_expires_at ? new Date(h.detail.old_expires_at).toLocaleDateString("vi-VN") : "?"} → ${h.detail.new_expires_at ? new Date(h.detail.new_expires_at).toLocaleDateString("vi-VN") : "?"}`}
                    </span>
                    <span style={{ color: "var(--warm-gray-light)" }}>
                      {new Date(h.at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div style={{ color: "var(--warm-gray)" }}>
                    {h.reason}{h.actor_name ? ` — ${h.actor_name}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
