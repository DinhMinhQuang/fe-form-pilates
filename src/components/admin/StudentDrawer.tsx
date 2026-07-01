"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminStudentApi, adminBookingApi } from "@/lib/api";
import type { Booking, Student } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import EmptyRow from "@/components/EmptyRow";
import Btn from "@/components/Btn";
import BookForStudentModal from "@/components/admin/BookForStudentModal";

const BOOKING_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  booked:             { label: "Đã đặt",  bg: "#EAF5EA", color: "#2E6B2E" },
  attended:           { label: "Đã học",  bg: "#EEF2FF", color: "#3730A3" },
  cancelled_refunded: { label: "Đã huỷ",  bg: "#FBF0F0", color: "#B94B4B" },
  no_show:            { label: "Vắng",    bg: "#FEF9E7", color: "#7A5C00" },
};

interface Props {
  student: Student | null;
  onClose: () => void;
}

export default function StudentDrawer({ student, onClose }: Props) {
  const [showBook, setShowBook] = useState(false);

  const { data: detail, error: detailError, mutate: mutateDetail } = useSWR(
    student ? `/admin/students/${student.id}` : null,
    () => adminStudentApi.detail(student!.id),
  );

  const { data: bookings, error: bookingsError, mutate: mutateBookings } = useSWR(
    student ? `/admin/bookings?student_id=${student.id}` : null,
    () => adminBookingApi.list({ student_id: student!.id }),
  );

  function refetch() {
    mutateDetail();
    mutateBookings();
  }

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
          <Btn variant="ghost" size="sm" className="!px-2 !py-1 border-0" onClick={onClose}>✕</Btn>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {detailError && <ErrorBox error={detailError} onRetry={() => mutateDetail()} />}

          {/* Credits + book */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "var(--cream)" }}
            >
              <span className="text-2xl font-semibold" style={{ color: "var(--charcoal)" }}>
                {detail?.credits ?? student.credits}
              </span>
              <span className="text-xs" style={{ color: "var(--warm-gray)" }}>buổi còn lại</span>
            </div>
            <Btn variant="accent" onClick={() => setShowBook(true)}>Đặt lịch dùm</Btn>
          </div>

          {/* Booking history */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--warm-gray)" }}>
              Lịch sử đặt chỗ
            </h3>
            {bookingsError && <ErrorBox error={bookingsError} onRetry={() => mutateBookings()} />}
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
                  {!bookings ? (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-sm" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</td></tr>
                  ) : !bookings.length ? (
                    <EmptyRow colSpan={3} message="Chưa có booking" />
                  ) : bookings.slice(0, 30).map((b: Booking) => {
                    const s = BOOKING_STATUS[b.status] ?? { label: b.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
                    return (
                      <tr key={b.id} style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-xs" style={{ color: "var(--charcoal)" }}>{b.class_type_name}</div>
                          <div className="text-xs" style={{ color: "var(--warm-gray-light)" }}>{b.branch_name}</div>
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
        </div>
      </aside>

      <BookForStudentModal
        studentId={student.id}
        studentName={student.full_name}
        open={showBook}
        onClose={() => setShowBook(false)}
        onBooked={() => { setShowBook(false); refetch(); }}
      />
    </>
  );
}
