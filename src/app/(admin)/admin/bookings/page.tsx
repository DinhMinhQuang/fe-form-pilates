"use client";

import useSWR from "swr";
import { adminBookingApi } from "@/lib/api";
import type { Booking } from "@/types";

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  booked:              { label: "Đã đặt",   bg: "#EAF5EA", color: "#2E6B2E" },
  attended:            { label: "Đã học",   bg: "#EEF2FF", color: "#3730A3" },
  cancelled_refunded:  { label: "Đã huỷ",   bg: "#FBF0F0", color: "#B94B4B" },
  no_show:             { label: "Vắng",     bg: "#FEF9E7", color: "#7A5C00" },
};

export default function AdminBookingsPage() {
  const { data: bookings, isLoading } = useSWR("/admin/bookings", adminBookingApi.list);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>
            Đặt lịch
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>
            Tất cả booking của học viên
          </p>
        </div>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--white)", borderColor: "var(--sand)" }}
      >
        {isLoading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--warm-gray-light)" }}>
            Đang tải...
          </div>
        ) : !bookings?.length ? (
          <div className="p-12 text-center">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--charcoal)" }}>
              Chưa có đặt lịch nào
            </p>
            <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
              Booking sẽ xuất hiện khi học viên đăng ký buổi tập
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Học viên</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Buổi tập</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Thời gian</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: Booking) => {
                const status = STATUS_MAP[b.status] ?? { label: b.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
                return (
                  <tr
                    key={b.id}
                    style={{ borderBottom: "1px solid var(--cream-dark)" }}
                    className="hover:bg-[var(--cream)] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium" style={{ color: "var(--charcoal)" }}>{b.student_name}</div>
                      {b.student_phone && (
                        <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray-light)" }}>{b.student_phone}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>
                      <div>{b.class_type_name}</div>
                      {b.trainer_name && (
                        <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray-light)" }}>{b.trainer_name}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "var(--warm-gray)" }}>
                      {new Date(b.session_start_at).toLocaleDateString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
