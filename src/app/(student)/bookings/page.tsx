"use client";

import { useState } from "react";
import useSWR from "swr";
import { studentApi } from "@/lib/api";
import type { Booking } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import EmptyRow from "@/components/EmptyRow";

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  booked:             { label: "Đã đặt",  bg: "#EAF5EA", color: "#2E6B2E" },
  attended:           { label: "Đã học",  bg: "#EEF2FF", color: "#3730A3" },
  cancelled_refunded: { label: "Đã huỷ",  bg: "#FBF0F0", color: "#B94B4B" },
  no_show:            { label: "Vắng",    bg: "#FEF9E7", color: "#7A5C00" },
};

export default function BookingsPage() {
  const { data: bookings, isLoading, error, mutate } = useSWR("/me/bookings", studentApi.myBookings);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<Error | null>(null);

  async function handleCancel(bookingId: string) {
    setCancelling(bookingId);
    setCancelError(null);
    try {
      await studentApi.cancel(bookingId);
      mutate();
    } catch (err) {
      setCancelError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>Đặt chỗ của tôi</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>Lịch sử và các buổi sắp tới</p>
      </div>

      {cancelError && <div className="mb-4"><ErrorBox error={cancelError} /></div>}
      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--white)", borderColor: "var(--sand)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Buổi tập</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Thời gian</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-5 py-10 text-sm text-center" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</td></tr>
            ) : !bookings?.length ? (
              <EmptyRow colSpan={4} message="Chưa có đặt chỗ nào" />
            ) : bookings.map((b: Booking) => {
              const status = STATUS_MAP[b.status] ?? { label: b.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
              return (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--cream-dark)" }} className="group">
                  <td className="px-5 py-3.5">
                    <div className="font-medium" style={{ color: "var(--charcoal)" }}>{b.class_type_name}</div>
                    {b.trainer_name && <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray-light)" }}>{b.trainer_name} · {b.branch_name}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--warm-gray)" }}>
                    {new Date(b.session_start_at).toLocaleString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {b.status === "booked" && (
                      <button
                        disabled={cancelling === b.id}
                        onClick={() => handleCancel(b.id)}
                        className="text-xs opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                        style={{ color: "#B94B4B" }}
                      >
                        {cancelling === b.id ? "Đang huỷ..." : "Huỷ"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
