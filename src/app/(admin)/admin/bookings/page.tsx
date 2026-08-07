"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminBookingApi } from "@/lib/api";
import type { Booking } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import EmptyRow from "@/components/EmptyRow";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import RescheduleBookingModal from "@/components/admin/RescheduleBookingModal";
import CancelBookingModal from "@/components/admin/CancelBookingModal";
import { dateInputToEndOfDayIso, dateInputToIso } from "@/lib/date";

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  booked:             { label: "Đã đặt",  bg: "#EAF5EA", color: "#2E6B2E" },
  attended:           { label: "Đã học",  bg: "#EEF2FF", color: "#3730A3" },
  cancelled_refunded: { label: "Đã huỷ",  bg: "#FBF0F0", color: "#B94B4B" },
  no_show:            { label: "Vắng",    bg: "#FEF9E7", color: "#7A5C00" },
};

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "booked", label: "Đã đặt" },
  { value: "attended", label: "Đã học" },
  { value: "cancelled_refunded", label: "Đã huỷ" },
  { value: "no_show", label: "Vắng" },
];

const PAGE_SIZE = 10;

const inputClass = "rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

export default function AdminBookingsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cursors, setCursors] = useState<string[]>([]);
  const cursor = cursors[cursors.length - 1];

  const { data: bookings, isLoading, error, mutate } = useSWR(
    ["/admin/bookings", q, status, from, to, cursor],
    () =>
      adminBookingApi.list({
        q: q.trim() || undefined,
        status: status || undefined,
        from: from ? dateInputToIso(from) : undefined,
        to: to ? dateInputToEndOfDayIso(to) : undefined,
        limit: PAGE_SIZE,
        cursor,
      }),
  );

  const [cancelError, setCancelError] = useState<Error | null>(null);
  const [rescheduling, setRescheduling] = useState<Booking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  function resetPage() {
    setCursors([]);
  }

  function goNext() {
    if (bookings?.nextCursor) setCursors((c) => [...c, bookings.nextCursor!]);
  }

  function goPrev() {
    setCursors((c) => c.slice(0, -1));
  }

  function refresh() {
    setCursors([]);
    mutate();
  }

  async function handleCancel(reason: string, refund: boolean) {
    if (!cancelTarget) return;
    setCancelError(null);
    try {
      await adminBookingApi.cancel(cancelTarget.id, { reason, refund });
      setCancelTarget(null);
      refresh();
    } catch (err) {
      setCancelError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>Đặt lịch</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>Tất cả booking của học viên</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc số điện thoại..."
          value={q}
          onChange={(e) => { setQ(e.target.value); resetPage(); }}
          className={`${inputClass} w-full max-w-xs`}
          style={inputStyle}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); resetPage(); }}
          className={inputClass}
          style={{ ...inputStyle, appearance: "none" }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); resetPage(); }}
          className={inputClass}
          style={inputStyle}
        />
        <span className="self-center text-sm" style={{ color: "var(--warm-gray-light)" }}>đến</span>
        <input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); resetPage(); }}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => refresh()} /></div>}
      {cancelError && <div className="mb-4"><FormError error={cancelError} /></div>}

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--white)", borderColor: "var(--sand)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Học viên</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Buổi tập</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Thời gian</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Ngày đặt</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Lý do</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-5 py-10 text-sm text-center" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</td></tr>
            ) : !bookings?.length ? (
              <EmptyRow colSpan={7} message="Chưa có booking nào" />
            ) : bookings.map((b: Booking) => {
              const s = STATUS_MAP[b.status] ?? { label: b.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
              return (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--cream-dark)" }} className="hover:bg-[var(--cream)] transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="font-medium" style={{ color: "var(--charcoal)" }}>{b.student_name}</div>
                    {b.student_phone && <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray-light)" }}>{b.student_phone}</div>}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>
                    <div>{b.class_type_name}</div>
                    {b.trainer_name && <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray-light)" }}>{b.trainer_name}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--warm-gray)" }}>
                    {new Date(b.session_start_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--warm-gray-light)" }}>
                    {b.booked_at ? new Date(b.booked_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs max-w-[220px]" style={{ color: "var(--warm-gray)" }}>
                    {b.cancellation_reason ?? "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    {b.status === "booked" && (
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100">
                        <Btn variant="ghost" size="sm" onClick={() => setRescheduling(b)}>
                          Đổi lịch
                        </Btn>
                        <Btn variant="danger" size="sm" onClick={() => setCancelTarget(b)}>
                          Huỷ
                        </Btn>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="ghost" size="sm" onClick={goPrev} disabled={!cursors.length || isLoading}>← Trước</Btn>
        <Btn variant="ghost" size="sm" onClick={goNext} disabled={!bookings?.nextCursor || isLoading}>Tiếp →</Btn>
      </div>

      {rescheduling && (
        <RescheduleBookingModal
          booking={rescheduling}
          open={!!rescheduling}
          onClose={() => setRescheduling(null)}
          onRescheduled={() => { setRescheduling(null); refresh(); }}
        />
      )}

      {cancelTarget && (
        <CancelBookingModal
          open={!!cancelTarget}
          title={`Huỷ booking — ${cancelTarget.student_name}`}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancel}
        />
      )}
    </div>
  );
}
