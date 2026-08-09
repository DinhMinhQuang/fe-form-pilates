"use client";

import { useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import Select from "@/components/Select";
import { adminBookingApi, adminSessionApi } from "@/lib/api";
import type { Booking } from "@/types";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

interface Props {
  booking: Booking;
  open: boolean;
  onClose: () => void;
  onRescheduled: () => void;
}

export default function RescheduleBookingModal({ booking, open, onClose, onRescheduled }: Props) {
  const { data: sessions } = useSWR(
    open ? ["/admin/sessions", "reschedule"] : null,
    () => adminSessionApi.list({ status: "scheduled", limit: 100 }),
  );

  const [newSessionId, setNewSessionId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  function reset() {
    setNewSessionId(""); setReason(""); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newSessionId) { setError(new Error("Vui lòng chọn buổi tập mới")); return; }
    if (!reason.trim()) { setError(new Error("Vui lòng nhập lý do đổi lịch")); return; }

    setError(null);
    setLoading(true);
    try {
      await adminBookingApi.reschedule(booking.id, { new_session_id: newSessionId, reason: reason.trim() });
      reset();
      onRescheduled();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  const candidates = sessions?.filter((s) => s.id !== booking.session_id && s.booked_count < s.capacity);

  return (
    <Modal title={`Đổi lịch — ${booking.student_name}`} open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <p className="text-xs" style={{ color: "var(--warm-gray)" }}>
          Buổi hiện tại: {booking.class_type_name} · {new Date(booking.session_start_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Buổi tập mới <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <Select
            value={newSessionId}
            onChange={setNewSessionId}
            placeholder="Chọn buổi tập"
            options={(candidates ?? []).map((s) => ({
              value: s.id,
              label: `${s.class_type_name} · ${s.branch_name} · ${new Date(s.start_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })} (${s.capacity - s.booked_count} chỗ trống)`,
            }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Lý do đổi lịch <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <textarea
            className={inputClass} style={inputStyle} rows={2}
            value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="VD: học viên bận đột xuất, đổi theo yêu cầu..."
          />
        </div>

        <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
          Hệ thống sẽ hoàn buổi cũ và trừ đúng 1 buổi cho lịch mới, không trừ hai lần.
        </p>

        <FormError error={error} />

        <div className="flex gap-2 pt-1">
          <Btn variant="ghost" className="flex-1" type="button" onClick={handleClose}>Huỷ</Btn>
          <Btn variant="primary" className="flex-1" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Xác nhận đổi lịch"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
