"use client";

import { useState } from "react";
import useSWR from "swr";
import { trainerApi } from "@/lib/api";
import type { Booking, ClassSession } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import EmptyRow from "@/components/EmptyRow";

const SESSION_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  scheduled: { label: "Sắp diễn ra", bg: "#EAF5EA", color: "#2E6B2E" },
  completed: { label: "Đã xong",     bg: "#EEF2FF", color: "#3730A3" },
  cancelled: { label: "Đã huỷ",      bg: "#FBF0F0", color: "#B94B4B" },
};

function AttendanceButton({ booking, onMarked }: { booking: Booking; onMarked: () => void }) {
  const [loading, setLoading] = useState<"attended" | "no_show" | null>(null);

  async function mark(status: "attended" | "no_show") {
    setLoading(status);
    try {
      await trainerApi.markAttendance(booking.id, { status });
      onMarked();
    } finally {
      setLoading(null);
    }
  }

  if (booking.status === "attended") {
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#EEF2FF", color: "#3730A3" }}>Đã học</span>;
  }
  if (booking.status === "no_show") {
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#FEF9E7", color: "#7A5C00" }}>Vắng</span>;
  }
  if (booking.status === "cancelled_refunded") {
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#FBF0F0", color: "#B94B4B" }}>Đã huỷ</span>;
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={!!loading}
        onClick={() => mark("attended")}
        className="text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors disabled:opacity-40"
        style={{ borderColor: "#2E6B2E", color: "#2E6B2E" }}
      >
        {loading === "attended" ? "..." : "Có mặt"}
      </button>
      <button
        disabled={!!loading}
        onClick={() => mark("no_show")}
        className="text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors disabled:opacity-40"
        style={{ borderColor: "var(--sand)", color: "var(--warm-gray)" }}
      >
        {loading === "no_show" ? "..." : "Vắng"}
      </button>
    </div>
  );
}

function SessionStudents({ sessionId }: { sessionId: string }) {
  const { data: bookings, isLoading, error, mutate } = useSWR(
    `/trainer/sessions/${sessionId}/students`,
    () => trainerApi.students(sessionId),
  );

  if (error) return <div className="px-6 pb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>;

  return (
    <div style={{ borderTop: "1px solid var(--sand)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--cream)" }}>
            <th className="text-left px-6 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Học viên</th>
            <th className="text-left px-6 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Điện thoại</th>
            <th className="text-left px-6 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Điểm danh</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={3} className="px-6 py-6 text-sm text-center" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</td></tr>
          ) : !bookings?.length ? (
            <EmptyRow colSpan={3} message="Chưa có học viên đăng ký" />
          ) : bookings.map((b: Booking) => (
            <tr key={b.id} style={{ borderTop: "1px solid var(--cream-dark)" }}>
              <td className="px-6 py-3 font-medium" style={{ color: "var(--charcoal)" }}>{b.student_name}</td>
              <td className="px-6 py-3 text-sm" style={{ color: "var(--warm-gray)" }}>{b.student_phone ?? "—"}</td>
              <td className="px-6 py-3">
                <AttendanceButton booking={b} onMarked={() => mutate()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TrainerPage() {
  const { data: sessions, isLoading, error, mutate } = useSWR("/trainer/sessions", trainerApi.sessions);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>Lịch dạy</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>Chọn buổi tập để điểm danh học viên</p>
      </div>

      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

      {isLoading ? (
        <p className="text-sm" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</p>
      ) : !sessions?.length ? (
        <div className="rounded-xl border py-12 text-center text-sm" style={{ borderColor: "var(--sand)", background: "var(--white)", color: "var(--warm-gray-light)" }}>
          Không có buổi dạy nào
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s: ClassSession) => {
            const open = openId === s.id;
            const status = SESSION_STATUS[s.status] ?? { label: s.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
            return (
              <div key={s.id} className="rounded-xl border overflow-hidden" style={{ background: "var(--white)", borderColor: "var(--sand)" }}>
                <button
                  className="w-full flex items-center gap-4 px-6 py-4 text-left transition-colors"
                  style={{ background: open ? "var(--cream)" : "transparent" }}
                  onClick={() => setOpenId(open ? null : s.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="font-medium" style={{ color: "var(--charcoal)" }}>{s.class_type_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: "var(--warm-gray)" }}>
                      {new Date(s.start_at).toLocaleString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {" · "}{s.branch_name}
                      {" · "}{s.booked_count}/{s.capacity} học viên
                    </div>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: "var(--warm-gray-light)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {open && <SessionStudents sessionId={s.id} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
