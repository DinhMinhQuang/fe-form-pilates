"use client";

import { useState } from "react";
import useSWR from "swr";
import { studentApi, catalogApi } from "@/lib/api";
import type { ClassSession, Branch } from "@/types";
import ErrorBox from "@/components/ErrorBox";

const CATEGORY_LABEL: Record<string, string> = {
  group_reformer: "Reformer nhóm",
  group_mat: "Mat nhóm",
  private: "Cá nhân",
  duo: "Duo",
};

export default function SchedulePage() {
  const [branchId, setBranchId] = useState("");
  const [booking, setBooking] = useState<string | null>(null);
  const [bookError, setBookError] = useState<Error | null>(null);

  const { data: branches } = useSWR("/branches", catalogApi.branches);
  const { data: sessions, isLoading, error, mutate } = useSWR(
    ["/sessions", branchId],
    () => studentApi.sessions(branchId || undefined),
  );

  async function handleBook(sessionId: string) {
    setBooking(sessionId);
    setBookError(null);
    try {
      await studentApi.book(sessionId);
      mutate();
    } catch (err) {
      setBookError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setBooking(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>Lịch học</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>Chọn buổi tập và đặt chỗ</p>
        </div>
        {branches && branches.length > 1 && (
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="text-sm rounded-lg px-3 py-2 border outline-none"
            style={{ borderColor: "var(--sand)", background: "var(--white)", color: "var(--charcoal)" }}
          >
            <option value="">Tất cả chi nhánh</option>
            {branches.map((b: Branch) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
      </div>

      {bookError && <div className="mb-4"><ErrorBox error={bookError} /></div>}
      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

      {isLoading ? (
        <p className="text-sm" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</p>
      ) : !sessions?.length ? (
        <div className="rounded-xl border py-12 text-center text-sm" style={{ borderColor: "var(--sand)", background: "var(--white)", color: "var(--warm-gray-light)" }}>
          Không có buổi học nào trong thời gian tới
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s: ClassSession) => {
            const full = s.booked_count >= s.capacity;
            const start = new Date(s.start_at);
            const end = new Date(s.end_at);
            return (
              <div
                key={s.id}
                className="rounded-xl border px-5 py-4 flex items-center gap-5"
                style={{ background: "var(--white)", borderColor: "var(--sand)" }}
              >
                {/* Date column */}
                <div className="flex-shrink-0 w-12 text-center">
                  <div className="text-lg font-semibold leading-none" style={{ color: "var(--charcoal)" }}>
                    {start.getDate()}
                  </div>
                  <div className="text-xs mt-0.5 uppercase" style={{ color: "var(--warm-gray-light)" }}>
                    {start.toLocaleDateString("vi-VN", { month: "short" })}
                  </div>
                </div>

                <div className="w-px self-stretch" style={{ background: "var(--sand)" }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium" style={{ color: "var(--charcoal)" }}>{s.class_type_name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--cream-dark)", color: "var(--warm-gray)" }}>
                      {CATEGORY_LABEL[s.class_type_name] ?? s.class_type_name}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: "var(--warm-gray)" }}>
                    {start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    {" – "}
                    {end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    {s.trainer_name && <> · {s.trainer_name}</>}
                    {" · "}{s.branch_name}
                  </div>
                </div>

                {/* Slots + book */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <span className="text-xs" style={{ color: full ? "#B94B4B" : "var(--warm-gray-light)" }}>
                    {s.capacity - s.booked_count} chỗ
                  </span>
                  <button
                    disabled={full || booking === s.id}
                    onClick={() => handleBook(s.id)}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
                    style={{
                      background: full ? "var(--cream-dark)" : "var(--charcoal)",
                      color: full ? "var(--warm-gray)" : "var(--white)",
                    }}
                  >
                    {booking === s.id ? "Đang đặt..." : full ? "Hết chỗ" : "Đặt chỗ"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
