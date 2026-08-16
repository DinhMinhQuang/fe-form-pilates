"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { catalogApi, studentApi } from "@/lib/api";
import type { ClassSession } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import Btn from "@/components/Btn";
import Select from "@/components/Select";

// Học viên tự đặt chỗ phải trước giờ học ít nhất 3 tiếng — cho HLV/lễ tân đủ
// thời gian chuẩn bị. Chỉ áp dụng ở client cho học viên; admin/HLV đặt hộ
// không bị chặn bởi rule này.
const BOOK_CUTOFF_MS = 3 * 60 * 60 * 1000;

const DAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const DAY_LONG  = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

function getWeekDays(weekOffset: number): Date[] {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun
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

export default function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // 0=Mon … 6=Sun
  });
  const [classFilter, setClassFilter] = useState("");
  const [branchId, setBranchId] = useState("");
  const [booking, setBooking] = useState<string | null>(null);
  const [bookError, setBookError] = useState<Error | null>(null);

  const { data: branches } = useSWR("/branches", catalogApi.branches);

  const days = useMemo(() => getWeekDays(weekOffset), [weekOffset]);
  const from = days[0].toISOString();
  const to   = new Date(days[6].getTime() + 86400000).toISOString();

  const { data: sessions, isLoading, error, mutate } = useSWR(
    ["/sessions", from, to, branchId],
    () => studentApi.sessions({ from, to, branchId: branchId || undefined }),
  );

  const { data: myBookings, mutate: mutateBookings } = useSWR(
    "/me/bookings?status=booked",
    () => studentApi.myBookings({ status: "booked" }),
  );
  const bookedSessionIds = useMemo(
    () => new Set((myBookings ?? []).map((b) => b.session_id)),
    [myBookings],
  );

  // Unique class type names
  const classTypes = useMemo(() => {
    if (!sessions) return [];
    return [...new Set(sessions.map((s) => s.class_type_name))].sort();
  }, [sessions]);

  // Filter sessions for selected day + class type
  const todaySessions = useMemo(() => {
    if (!sessions) return [];
    const day = days[selectedDay];
    return sessions.filter((s) => {
      const start = new Date(s.start_at);
      if (!sameDay(start, day)) return false;
      if (classFilter && s.class_type_name !== classFilter) return false;
      return true;
    });
  }, [sessions, days, selectedDay, classFilter]);

  const now = new Date();

  async function handleBook(sessionId: string) {
    setBooking(sessionId);
    setBookError(null);
    try {
      await studentApi.book(sessionId);
      mutate();
      mutateBookings();
    } catch (err) {
      setBookError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setBooking(null);
    }
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-widest uppercase" style={{ color: "var(--charcoal)" }}>
          Lịch học
        </h1>
        <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: "var(--warm-gray)" }}>
          Chọn buổi và đặt chỗ ngay
        </p>
      </div>

      {/* Branch filter */}
      {branches && branches.length > 1 && (
        <div className="mb-4">
          <Select
            value={branchId}
            onChange={setBranchId}
            options={[{ value: "", label: "Tất cả chi nhánh" }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
          />
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          className="text-xs font-semibold tracking-widest uppercase transition-colors"
          style={{ color: "var(--warm-gray)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--charcoal)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--warm-gray)")}
          onClick={() => setWeekOffset((w) => w - 1)}
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
          onClick={() => setWeekOffset((w) => w + 1)}
        >
          Tuần sau →
        </button>
      </div>

      {/* Day tabs */}
      <div className="grid grid-cols-7 border-b mb-6" style={{ borderColor: "var(--sand)" }}>
        {days.map((d, i) => {
          const isToday = sameDay(d, new Date());
          const active = selectedDay === i;
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className="flex flex-col items-center py-3 text-center transition-colors"
              style={{
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                color: active ? "var(--accent)" : isToday ? "var(--charcoal)" : "var(--warm-gray)",
              }}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">{DAY_SHORT[i === 6 ? 0 : i + 1]}</span>
              <span className="text-xs mt-0.5">{fmt(d)}</span>
            </button>
          );
        })}
      </div>

      {/* Class type filter */}
      {classTypes.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setClassFilter("")}
            className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest border transition-colors"
            style={{
              borderColor: classFilter === "" ? "var(--charcoal)" : "var(--sand)",
              color: classFilter === "" ? "var(--white)" : "var(--warm-gray)",
              background: classFilter === "" ? "var(--charcoal)" : "transparent",
            }}
          >
            Tất cả
          </button>
          {classTypes.map((ct) => (
            <button
              key={ct}
              onClick={() => setClassFilter(ct === classFilter ? "" : ct)}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest border transition-colors"
              style={{
                borderColor: classFilter === ct ? "var(--charcoal)" : "var(--sand)",
                color: classFilter === ct ? "var(--white)" : "var(--warm-gray)",
                background: classFilter === ct ? "var(--charcoal)" : "transparent",
              }}
            >
              {ct}
            </button>
          ))}
        </div>
      )}

      {bookError && <div className="mb-4"><ErrorBox error={bookError} /></div>}
      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

      {/* Session list */}
      <div style={{ borderTop: "1px solid var(--sand)" }}>
        {isLoading ? (
          <div className="flex flex-col">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-6 border-b animate-pulse flex justify-between" style={{ borderColor: "var(--sand)" }}>
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-48 rounded" style={{ background: "var(--cream-dark)" }} />
                  <div className="h-3 w-32 rounded" style={{ background: "var(--cream-dark)" }} />
                </div>
                <div className="h-8 w-20 rounded" style={{ background: "var(--cream-dark)" }} />
              </div>
            ))}
          </div>
        ) : !todaySessions.length ? (
          <div className="py-16 text-center">
            <p className="text-sm tracking-wide" style={{ color: "var(--warm-gray-light)" }}>
              Không có buổi học nào trong ngày này
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            {todaySessions.map((s: ClassSession) => {
              const start = new Date(s.start_at);
              const end   = new Date(s.end_at);
              const passed = start < now;
              const full   = s.booked_count >= s.capacity;
              const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);
              const isBooking = booking === s.id;
              const alreadyBooked = bookedSessionIds.has(s.id);
              const tooLate = !passed && !alreadyBooked && start.getTime() - now.getTime() < BOOK_CUTOFF_MS;

              const dayLabel = start.toLocaleDateString("vi-VN", { weekday: "long" });
              const dateLabel = `${String(start.getDate()).padStart(2,"0")}/${String(start.getMonth()+1).padStart(2,"0")}`;
              const timeStart = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
              const timeEnd   = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

              return (
                <div
                  key={s.id}
                  className="relative rounded-xl p-4"
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--sand)",
                    opacity: passed ? 0.65 : 1,
                  }}
                >
                  {/* Status badge — top right */}
                  <div className="absolute top-4 right-4">
                    {passed ? (
                      <span
                        className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 border"
                        style={{ color: "var(--warm-gray)", borderColor: "var(--sand)", fontSize: 10 }}
                      >
                        Đã qua
                      </span>
                    ) : alreadyBooked ? (
                      <span
                        className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5"
                        style={{ color: "var(--white)", background: "#2E6B2E", fontSize: 10 }}
                      >
                        Đã đặt
                      </span>
                    ) : tooLate ? (
                      <span
                        className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 border"
                        style={{ color: "var(--warm-gray)", borderColor: "var(--sand)", fontSize: 10 }}
                      >
                        Đã đóng đặt chỗ
                      </span>
                    ) : full ? (
                      <span
                        className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5"
                        style={{ color: "#B94B4B", background: "#FBF0F0", fontSize: 10 }}
                      >
                        Hết chỗ
                      </span>
                    ) : (
                      <span
                        className="text-xs font-semibold uppercase tracking-widest px-2 py-0.5"
                        style={{ color: "var(--white)", background: "var(--accent)", fontSize: 10 }}
                      >
                        {s.capacity - s.booked_count} chỗ
                      </span>
                    )}
                  </div>

                  {/* Class name */}
                  <div
                    className="font-bold uppercase pr-20 mb-2"
                    style={{
                      color: passed ? "var(--warm-gray)" : "var(--charcoal)",
                      fontSize: 13,
                      letterSpacing: "0.08em",
                      lineHeight: 1.3,
                    }}
                  >
                    {s.class_type_name}
                  </div>

                  {/* Trainer */}
                  {s.trainer_name && (
                    <div className="text-xs mb-1" style={{ color: "var(--warm-gray)" }}>
                      với <strong style={{ color: "var(--charcoal)" }}>{s.trainer_name}</strong>
                    </div>
                  )}

                  {/* Branch */}
                  <div className="text-xs mb-1" style={{ color: "var(--warm-gray)" }}>
                    {s.branch_name}
                  </div>

                  {/* Date & time */}
                  <div className="text-xs mb-1" style={{ color: "var(--warm-gray)" }}>
                    vào <strong style={{ color: "var(--charcoal)" }}>{dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1)}, {dateLabel}</strong> lúc <strong style={{ color: "var(--charcoal)" }}>{timeStart}</strong>
                  </div>

                  {/* Duration */}
                  <div className="text-xs" style={{ color: "var(--warm-gray)" }}>
                    Thời lượng: <strong style={{ color: "var(--charcoal)" }}>{durationMin} phút · {timeStart} – {timeEnd}</strong>
                  </div>

                  {/* Book button */}
                  {!passed && (alreadyBooked || (!full && !tooLate)) && (
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--cream-dark)" }}>
                      <Btn
                        variant={alreadyBooked ? "ghost" : "accent"}
                        size="sm"
                        disabled={isBooking || alreadyBooked}
                        onClick={() => handleBook(s.id)}
                        className="w-full tracking-widest uppercase"
                      >
                        {alreadyBooked ? "Đã đặt" : isBooking ? "Đang đặt..." : "Đặt chỗ"}
                      </Btn>
                    </div>
                  )}
                  {!passed && !alreadyBooked && tooLate && (
                    <p className="mt-3 pt-3 text-xs" style={{ borderTop: "1px solid var(--cream-dark)", color: "var(--warm-gray-light)" }}>
                      Chỉ nhận đặt chỗ trước giờ học ít nhất 3 tiếng. Vui lòng liên hệ studio nếu cần hỗ trợ.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
