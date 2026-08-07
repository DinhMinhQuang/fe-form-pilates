"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

interface Props {
  open: boolean;
  title: string;
  description?: string;
  showRefundOption?: boolean;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (reason: string, refund: boolean) => Promise<void>;
}

export default function CancelBookingModal({
  open,
  title,
  description,
  showRefundOption = true,
  confirmLabel = "Xác nhận huỷ",
  onClose,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  function reset() {
    setReason(""); setRefund(true); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reason.trim()) {
      setError(new Error("Vui lòng nhập lý do huỷ"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onConfirm(reason.trim(), refund);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={title} open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {description && (
          <p className="text-xs" style={{ color: "var(--warm-gray)" }}>{description}</p>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Lý do huỷ <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <textarea
            autoFocus
            className={inputClass} style={inputStyle} rows={3}
            value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="VD: học viên báo bận đột xuất, đổi lịch theo yêu cầu..."
          />
        </div>

        {showRefundOption && (
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--charcoal)" }}>
            <input type="checkbox" checked={refund} onChange={(e) => setRefund(e.target.checked)} />
            Hoàn lại 1 buổi cho học viên
          </label>
        )}

        <FormError error={error} />

        <div className="flex gap-2 pt-1">
          <Btn variant="ghost" className="flex-1" type="button" onClick={handleClose}>Đóng</Btn>
          <Btn variant="danger" className="flex-1" type="submit" disabled={loading}>
            {loading ? "Đang huỷ..." : confirmLabel}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
