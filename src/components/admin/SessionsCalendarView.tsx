"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminSessionApi } from "@/lib/api";
import type { ClassSession } from "@/types";

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  scheduled: { bg: "#EAF5EA", color: "#2E6B2E" },
  completed: { bg: "#EEF2FF", color: "#3730A3" },
  cancelled: { bg: "#FBF0F0", color: "#B94B4B" },
};

const WEEKDAY_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + diff);
  return monday;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface Props {
  onSelect: (session: ClassSession) => void;
}

export default function SessionsCalendarView({ onSelect }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const weekEnd = addDays(weekStart, 7);
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today);

  const { data: sessions, isLoading } = useSWR(
    ["/admin/sessions/calendar", weekStart.toISOString()],
    () => adminSessionApi.list({ from: weekStart.toISOString(), to: weekEnd.toISOString() }),
  );

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const selectedDaySessions = (sessions ?? [])
    .filter((s) => isSameDay(new Date(s.start_at), selectedDay))
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm border transition-colors"
            style={{ borderColor: "var(--sand)", color: "var(--warm-gray)" }}
            onClick={() => setWeekStart((w) => { const n = addDays(w, -7); setSelectedDay(n); return n; })}
          >
            ←
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm border transition-colors"
            style={{ borderColor: "var(--sand)", color: "var(--warm-gray)" }}
            onClick={() => { setWeekStart(startOfWeek(new Date())); setSelectedDay(new Date()); }}
          >
            Hôm nay
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-sm border transition-colors"
            style={{ borderColor: "var(--sand)", color: "var(--warm-gray)" }}
            onClick={() => setWeekStart((w) => { const n = addDays(w, 7); setSelectedDay(n); return n; })}
          >
            →
          </button>
        </div>
        <div className="text-sm font-medium" style={{ color: "var(--charcoal)" }}>
          {weekStart.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
          {" – "}
          {addDays(weekStart, 6).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
        </div>
      </div>

      {isLoading ? (
        <div className="px-5 py-10 text-sm text-center" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</div>
      ) : (
        <>
        {/* iOS Calendar-style day strip + agenda list, phones only */}
        <div className="sm:hidden">
          <div className="flex justify-between mb-4">
            {days.map((day, i) => {
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDay);
              const hasSessions = (sessions ?? []).some((s) => isSameDay(new Date(s.start_at), day));
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className="flex flex-col items-center gap-1 w-9"
                >
                  <span className="text-[10px] uppercase" style={{ color: "var(--warm-gray-light)" }}>
                    {WEEKDAY_LABELS[i].replace("Thứ ", "T").replace("Chủ nhật", "CN")}
                  </span>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={
                      isSelected
                        ? { background: "var(--charcoal)", color: "var(--white)" }
                        : isToday
                        ? { color: "var(--accent)" }
                        : { color: "var(--charcoal)" }
                    }
                  >
                    {day.getDate()}
                  </span>
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: hasSessions ? "var(--accent)" : "transparent" }}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            {selectedDaySessions.length === 0 ? (
              <div className="text-sm text-center py-10" style={{ color: "var(--warm-gray-light)" }}>Không có buổi tập</div>
            ) : (
              selectedDaySessions.map((s) => {
                const status = STATUS_COLOR[s.status] ?? { bg: "var(--cream-dark)", color: "var(--charcoal)" };
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelect(s)}
                    className="text-left rounded-lg px-3 py-2.5 border flex items-center gap-3"
                    style={{ borderColor: "var(--sand)", background: "var(--white)" }}
                  >
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ background: status.color }}
                    />
                    <div className="text-sm font-medium w-14 flex-shrink-0" style={{ color: "var(--charcoal)" }}>
                      {new Date(s.start_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate" style={{ color: "var(--charcoal)" }}>
                        {s.class_type_name}
                      </div>
                      <div className="text-xs truncate font-bold" style={{ color: "var(--charcoal)" }}>
                        {s.branch_name}
                      </div>
                      <div className="text-xs truncate" style={{ color: "var(--warm-gray-light)" }}>
                        {s.trainer_name ?? "—"} · {s.booked_count}/{s.capacity}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-7 gap-2">
          {days.map((day, i) => {
            const daySessions = (sessions ?? [])
              .filter((s) => isSameDay(new Date(s.start_at), day))
              .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
            const isToday = isSameDay(day, today);
            return (
              <div key={i} className="flex flex-col gap-2">
                <div
                  className="text-center rounded-lg px-2 py-1.5"
                  style={{ background: isToday ? "var(--charcoal)" : "var(--cream)" }}
                >
                  <div
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: isToday ? "var(--white)" : "var(--warm-gray)" }}
                  >
                    {WEEKDAY_LABELS[i]}
                  </div>
                  <div className="text-xs" style={{ color: isToday ? "var(--white)" : "var(--warm-gray-light)" }}>
                    {day.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 min-h-[60px]">
                  {daySessions.length === 0 ? (
                    <div className="text-xs text-center py-2" style={{ color: "var(--warm-gray-light)" }}>—</div>
                  ) : (
                    daySessions.map((s) => {
                      const status = STATUS_COLOR[s.status] ?? { bg: "var(--cream-dark)", color: "var(--charcoal)" };
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onSelect(s)}
                          className="text-left rounded-lg px-2 py-1.5 border transition-colors hover:-translate-y-px"
                          style={{ borderColor: "var(--sand)", background: status.bg }}
                        >
                          <div className="text-xs font-medium" style={{ color: status.color }}>
                            {new Date(s.start_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="text-xs mt-0.5 truncate" style={{ color: "var(--charcoal)" }}>
                            {s.class_type_name}
                          </div>
                          <div className="text-xs truncate font-bold" style={{ color: "var(--charcoal)" }}>
                            {s.branch_name}
                          </div>
                          <div className="text-xs truncate" style={{ color: "var(--warm-gray-light)" }}>
                            {s.trainer_name ?? "—"} · {s.booked_count}/{s.capacity}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
