"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminStudentApi } from "@/lib/api";
import type { Booking, CreditLot, Student } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import EmptyRow from "@/components/EmptyRow";
import AdjustCreditModal from "@/components/admin/AdjustCreditModal";
import BookForStudentModal from "@/components/admin/BookForStudentModal";

const BOOKING_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  booked:             { label: "Đã đặt",  bg: "#EAF5EA", color: "#2E6B2E" },
  attended:           { label: "Đã học",  bg: "#EEF2FF", color: "#3730A3" },
  cancelled_refunded: { label: "Đã huỷ",  bg: "#FBF0F0", color: "#B94B4B" },
  no_show:            { label: "Vắng",    bg: "#FEF9E7", color: "#7A5C00" },
};

const LOT_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: "Đang dùng", bg: "#EAF5EA", color: "#2E6B2E" },
  frozen: { label: "Tạm dừng",  bg: "#FEF9E7", color: "#7A5C00" },
  void:   { label: "Hết hạn",   bg: "#FBF0F0", color: "#B94B4B" },
};

interface Props {
  student: Student | null;
  onClose: () => void;
}

export default function StudentDrawer({ student, onClose }: Props) {
  const { data, error, mutate } = useSWR(
    student ? `/admin/students/${student.id}` : null,
    () => adminStudentApi.detail(student!.id),
  );

  const [adjustingLot, setAdjustingLot] = useState<CreditLot | null>(null);
  const [showBook, setShowBook] = useState(false);

  if (!student) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30"
        style={{ background: "rgba(28,28,28,0.25)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 bottom-0 z-40 flex flex-col overflow-hidden"
        style={{ width: 480, background: "var(--white)", borderLeft: "1px solid var(--sand)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b"
          style={{ borderColor: "var(--sand)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{ background: "var(--sand)", color: "var(--charcoal)" }}
            >
              {student.full_name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>{student.full_name}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray)" }}>
                {[student.email, student.phone].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-sm"
            style={{ color: "var(--warm-gray)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {error && <ErrorBox error={error} onRetry={() => mutate()} />}

          {data && (
            <>
              {/* Credits summary + book button */}
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "var(--cream)" }}
                >
                  <span className="text-2xl font-semibold" style={{ color: "var(--charcoal)" }}>
                    {data.credits.total_remaining}
                  </span>
                  <span className="text-xs" style={{ color: "var(--warm-gray)" }}>buổi còn lại</span>
                </div>
                <button
                  onClick={() => setShowBook(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ background: "var(--accent)", color: "var(--white)" }}
                >
                  Đặt lịch dùm
                </button>
              </div>

              {/* Credit lots */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--warm-gray)" }}>
                  Gói tập
                </h3>
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--sand)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Gói</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Còn</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Hết hạn</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {!data.credits.lots.length ? (
                        <EmptyRow colSpan={4} message="Chưa có gói tập" />
                      ) : data.credits.lots.map((lot: CreditLot) => {
                        const s = LOT_STATUS[lot.status] ?? { label: lot.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
                        return (
                          <tr key={lot.id} style={{ borderBottom: "1px solid var(--cream-dark)" }} className="group">
                            <td className="px-4 py-2.5">
                              <div className="font-medium text-xs" style={{ color: "var(--charcoal)" }}>{lot.package_name}</div>
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                            </td>
                            <td className="px-4 py-2.5 text-xs" style={{ color: "var(--charcoal)" }}>
                              {lot.sessions_remaining}<span style={{ color: "var(--warm-gray-light)" }}>/{lot.sessions_total}</span>
                            </td>
                            <td className="px-4 py-2.5 text-xs" style={{ color: "var(--warm-gray)" }}>
                              {new Date(lot.expires_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: "var(--warm-gray)" }}
                                onClick={() => setAdjustingLot(lot)}
                              >
                                Sửa
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Recent bookings */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--warm-gray)" }}>
                  Lịch sử đặt chỗ
                </h3>
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--sand)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Buổi tập</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Thời gian</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>TT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!data.recent_bookings.length ? (
                        <EmptyRow colSpan={3} message="Chưa có booking" />
                      ) : data.recent_bookings.map((b: Booking) => {
                        const s = BOOKING_STATUS[b.status] ?? { label: b.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
                        return (
                          <tr key={b.id} style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                            <td className="px-4 py-2.5">
                              <div className="font-medium text-xs" style={{ color: "var(--charcoal)" }}>{b.class_type_name}</div>
                              {b.trainer_name && <div className="text-xs" style={{ color: "var(--warm-gray-light)" }}>{b.trainer_name}</div>}
                            </td>
                            <td className="px-4 py-2.5 text-xs" style={{ color: "var(--warm-gray)" }}>
                              {new Date(b.session_start_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </aside>

      <AdjustCreditModal
        studentId={student.id}
        lot={adjustingLot}
        onClose={() => setAdjustingLot(null)}
        onSaved={() => { setAdjustingLot(null); mutate(); }}
      />
      <BookForStudentModal
        studentId={student.id}
        studentName={student.full_name}
        open={showBook}
        onClose={() => setShowBook(false)}
        onBooked={() => { setShowBook(false); mutate(); }}
      />
    </>
  );
}
