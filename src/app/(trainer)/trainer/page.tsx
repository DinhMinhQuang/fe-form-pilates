"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { trainerApi } from "@/lib/api";
import type { Booking, ClassSession } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import EmptyRow from "@/components/EmptyRow";
import Btn from "@/components/Btn";
import TrainerBookModal from "@/components/TrainerBookModal";

const DAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getWeekDays(weekOffset: number): Date[] {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmt(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function AttendanceRow({ booking, onMarked }: { booking: Booking; onMarked: () => void }) {
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

  const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
    attended:           { label: "Có mặt", bg: "#EAF5EA", color: "#2E6B2E" },
    no_show:            { label: "Vắng",   bg: "#FEF9E7", color: "#7A5C00" },
    cancelled_refunded: { label: "Đã huỷ", bg: "#FBF0F0", color: "#B94B4B" },
  };

  const badge = STATUS_BADGE[booking.status];
  if (badge) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: badge.bg, color: badge.color }}>
        {badge.label}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      <Btn variant="ghost" size="sm" disabled={!!loading} onClick={() => mark("attended")}
        className="!border-[#2E6B2E] !text-[#2E6B2E] hover:!bg-[#EAF5EA]">
        {loading === "attended" ? "..." : "Có mặt"}
      </Btn>
      <Btn variant="ghost" size="sm" disabled={!!loading} onClick={() => mark("no_show")}>
        {loading === "no_show" ? "..." : "Vắng"}
      </Btn>
    </div>
  );
}

function SessionStudents({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const { data: bookings, isLoading, error, mutate } = useSWR(
    `/trainer/sessions/${sessionId}/students`,
    () => trainerApi.students(sessionId),
  );

  return (
    <div style={{ borderTop: "1px solid var(--sand)", background: "var(--cream)" }}>
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--warm-gray)" }}>
          Danh sách học viên
        </span>
        <button onClick={onClose} className="text-xs" style={{ color: "var(--warm-gray-light)" }}>✕ Đóng</button>
      </div>

      {error && <div className="px-5 pb-3"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderTop: "1px solid var(--sand)", borderBottom: "1px solid var(--sand)", background: "var(--white)" }}>
            <th className="text-left px-5 py-2 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Học viên</th>
            <th className="text-left px-5 py-2 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>SĐT</th>
            <th className="text-left px-5 py-2 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Điểm danh</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={3} className="px-5 py-6 text-center text-sm" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</td></tr>
          ) : !bookings?.length ? (
            <EmptyRow colSpan={3} message="Chưa có học viên đăng ký" />
          ) : bookings.map((b: Booking) => (
            <tr key={b.id} style={{ borderBottom: "1px solid var(--cream-dark)", background: "var(--white)" }}>
              <td className="px-5 py-3 font-medium text-sm" style={{ color: "var(--charcoal)" }}>{b.student_name}</td>
              <td className="px-5 py-3 text-sm" style={{ color: "var(--warm-gray)" }}>{b.student_phone ?? "—"}</td>
              <td className="px-5 py-3">
                <AttendanceRow booking={b} onMarked={() => mutate()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TrainerPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const [bookingSession, setBookingSession] = useState<ClassSession | null>(null);

  const days = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const from = days[0].toISOString();
  const to   = new Date(days[6].getTime() + 86400000).toISOString();

  const { data: sessions, isLoading, error, mutate } = useSWR(
    ["/trainer/sessions", from, to],
    () => trainerApi.sessions({ from, to }),
  );

  const todaySessions = useMemo(() => {
    if (!sessions) return [];
    const day = days[selectedDay];
    return sessions.filter((s) => sameDay(new Date(s.start_at), day));
  }, [sessions, days, selectedDay]);

  const now = new Date();

  return (
    <div>
      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-widest uppercase" style={{ color: "var(--charcoal)" }}>
          Lịch dạy
        </h1>
        <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: "var(--warm-gray)" }}>
          Chọn buổi để điểm danh học viên
        </p>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          className="text-xs font-semibold tracking-widest uppercase transition-colors"
          style={{ color: "var(--warm-gray)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--charcoal)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--warm-gray)")}
          onClick={() => { setWeekOffset((w) => w - 1); setOpenId(null); }}
        >
          ← Tuần trước
        </button>
        <span className="text-xs tracking-wide" style={{ color: "var(--warm-gray-light)" }}>
          {fmt(days[0])} – {fmt(days[6])}
        </span>
        <button
          className="text-xs font-semibold tracking-widest uppercase transition-colors"
          style={{ color: "var(--warm-gray)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--charcoal)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--warm-gray)")}
          onClick={() => { setWeekOffset((w) => w + 1); setOpenId(null); }}
        >
          Tuần sau →
        </button>
      </div>

      {/* Day tabs */}
      <div className="grid grid-cols-7 border-b mb-6" style={{ borderColor: "var(--sand)" }}>
        {days.map((d, i) => {
          const isToday = sameDay(d, new Date());
          const active = selectedDay === i;
          // Count sessions for dot indicator
          const count = sessions?.filter((s) => sameDay(new Date(s.start_at), d)).length ?? 0;
          return (
            <button
              key={i}
              onClick={() => { setSelectedDay(i); setOpenId(null); }}
              className="flex flex-col items-center py-3 text-center transition-colors relative"
              style={{
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                color: active ? "var(--accent)" : isToday ? "var(--charcoal)" : "var(--warm-gray)",
              }}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">{DAY_SHORT[i === 6 ? 0 : i + 1]}</span>
              <span className="text-xs mt-0.5">{fmt(d)}</span>
              {count > 0 && (
                <span className="mt-1 text-xs font-semibold" style={{ color: active ? "var(--accent)" : "var(--warm-gray-light)" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

      {/* Session list */}
      <div style={{ borderTop: "1px solid var(--sand)" }}>
        {isLoading ? (
          <div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-6 border-b animate-pulse flex justify-between" style={{ borderColor: "var(--sand)" }}>
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-48 rounded" style={{ background: "var(--cream-dark)" }} />
                  <div className="h-3 w-32 rounded" style={{ background: "var(--cream-dark)" }} />
                </div>
                <div className="h-8 w-24 rounded" style={{ background: "var(--cream-dark)" }} />
              </div>
            ))}
          </div>
        ) : !todaySessions.length ? (
          <div className="py-16 text-center">
            <p className="text-sm tracking-wide" style={{ color: "var(--warm-gray-light)" }}>
              Không có buổi dạy nào trong ngày này
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            {todaySessions.map((s: ClassSession) => {
              const start = new Date(s.start_at);
              const end   = new Date(s.end_at);
              const passed = start < now;
              const open   = openId === s.id;
              const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);

              const dayLabel  = start.toLocaleDateString("vi-VN", { weekday: "long" });
              const dateLabel = `${String(start.getDate()).padStart(2,"0")}/${String(start.getMonth()+1).padStart(2,"0")}`;
              const timeStart = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
              const timeEnd   = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

              return (
                <div
                  key={s.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: `1px solid ${open ? "var(--accent)" : "var(--sand)"}`,
                    background: "var(--white)",
                    opacity: passed ? 0.65 : 1,
                  }}
                >
                  {/* Card header — clickable */}
                  <div
                    className="relative p-4 cursor-pointer"
                    style={{ background: open ? "var(--cream)" : "var(--white)" }}
                    onClick={() => setOpenId(open ? null : s.id)}
                  >
                    {/* Status badge */}
                    <div className="absolute top-4 right-4">
                      {passed ? (
                        <span className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 border"
                          style={{ color: "var(--warm-gray)", borderColor: "var(--sand)", fontSize: 10 }}>
                          Đã qua
                        </span>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5"
                          style={{ color: "var(--white)", background: "var(--olive)", fontSize: 10 }}>
                          {s.booked_count}/{s.capacity}
                        </span>
                      )}
                    </div>

                    {/* Class name */}
                    <div className="font-bold uppercase pr-16 mb-2"
                      style={{ color: passed ? "var(--warm-gray)" : "var(--charcoal)", fontSize: 13, letterSpacing: "0.08em", lineHeight: 1.3 }}>
                      {s.class_type_name}
                    </div>

                    {/* Branch */}
                    <div className="text-xs mb-1" style={{ color: "var(--warm-gray)" }}>{s.branch_name}</div>

                    {/* Date & time */}
                    <div className="text-xs mb-1" style={{ color: "var(--warm-gray)" }}>
                      vào <strong style={{ color: "var(--charcoal)" }}>{dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}, {dateLabel}</strong> lúc <strong style={{ color: "var(--charcoal)" }}>{timeStart}</strong>
                    </div>

                    {/* Duration */}
                    <div className="text-xs" style={{ color: "var(--warm-gray)" }}>
                      Thời lượng: <strong style={{ color: "var(--charcoal)" }}>{durationMin} phút · {timeStart} – {timeEnd}</strong>
                    </div>

                    {/* Attendance toggle */}
                    {!passed && (
                      <div className="mt-3 pt-3 flex items-center justify-between"
                        style={{ borderTop: "1px solid var(--cream-dark)" }}>
                        <span className="text-xs font-semibold uppercase tracking-widest"
                          style={{ color: "var(--warm-gray)" }}>
                          Điểm danh học viên
                        </span>
                        <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                          {open ? "Thu gọn ↑" : "Mở ra ↓"}
                        </span>
                      </div>
                    )}

                    {/* Book on behalf of a student (private/duo) */}
                    {!passed && s.booked_count < s.capacity && (
                      <div className="mt-2">
                        <Btn
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); setBookingSession(s); }}
                        >
                          + Đặt hộ học viên
                        </Btn>
                      </div>
                    )}
                  </div>

                  {open && (
                    <SessionStudents sessionId={s.id} onClose={() => setOpenId(null)} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {bookingSession && (
        <TrainerBookModal
          session={bookingSession}
          open={!!bookingSession}
          onClose={() => setBookingSession(null)}
          onBooked={() => { setBookingSession(null); mutate(); }}
        />
      )}
    </div>
  );
}
