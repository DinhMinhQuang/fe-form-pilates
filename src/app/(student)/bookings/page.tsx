"use client";

import { useState } from "react";
import useSWR from "swr";
import { studentApi } from "@/lib/api";
import type { Booking } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import Btn from "@/components/Btn";

const STATUS: Record<string, { label: string; dot: string }> = {
  booked:             { label: "Đã đặt",  dot: "#2E6B2E" },
  attended:           { label: "Đã học",  dot: "#3730A3" },
  cancelled_refunded: { label: "Đã huỷ",  dot: "#B94B4B" },
  no_show:            { label: "Vắng",    dot: "#7A5C00" },
};

export default function BookingsPage() {
  const { data: bookings, isLoading, error, mutate } = useSWR("/me/bookings", studentApi.myBookings);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<Error | null>(null);

  async function handleCancel(id: string) {
    setCancelling(id);
    setCancelError(null);
    try {
      await studentApi.cancel(id);
      mutate();
    } catch (err) {
      setCancelError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setCancelling(null);
    }
  }

  const upcoming = bookings?.filter((b) => b.status === "booked") ?? [];
  const past = bookings?.filter((b) => b.status !== "booked") ?? [];

  return (
    <div className="max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--charcoal)" }}>Đặt chỗ của tôi</h1>
        <p className="text-sm mt-1" style={{ color: "var(--warm-gray)" }}>Các buổi sắp tới và lịch sử</p>
      </div>

      {cancelError && <div className="mb-4"><ErrorBox error={cancelError} /></div>}
      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--cream-dark)" }} />)}
        </div>
      ) : !bookings?.length ? (
        <div className="rounded-2xl border py-16 text-center text-sm" style={{ borderColor: "var(--sand)", background: "var(--white)", color: "var(--warm-gray)" }}>
          Chưa có đặt chỗ nào
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>Sắp tới</span>
                <div className="flex-1 h-px" style={{ background: "var(--sand)" }} />
              </div>
              <div className="flex flex-col gap-2">
                {upcoming.map((b: Booking) => <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--warm-gray)" }}>Lịch sử</span>
                <div className="flex-1 h-px" style={{ background: "var(--sand)" }} />
              </div>
              <div className="flex flex-col gap-2">
                {past.map((b: Booking) => <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b, onCancel, cancelling }: {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: string | null;
}) {
  const st = STATUS[b.status] ?? { label: b.status, dot: "var(--warm-gray)" };
  const start = new Date(b.session_start_at);
  return (
    <div className="rounded-2xl border flex items-center gap-4 px-5 py-4" style={{ background: "var(--white)", borderColor: "var(--sand)" }}>
      {/* Date */}
      <div className="flex-shrink-0 text-center w-12">
        <div className="text-base font-semibold leading-tight" style={{ color: "var(--charcoal)" }}>{start.getDate()}</div>
        <div className="text-xs uppercase mt-0.5" style={{ color: "var(--warm-gray-light)" }}>
          {start.toLocaleDateString("vi-VN", { month: "short" })}
        </div>
      </div>

      <div className="self-stretch w-px" style={{ background: "var(--sand)" }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-1" style={{ color: "var(--charcoal)" }}>{b.class_type_name}</div>
        <div className="text-xs" style={{ color: "var(--warm-gray)" }}>
          {start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          {b.trainer_name && <> · {b.trainer_name}</>}
          {b.branch_name && <> · {b.branch_name}</>}
        </div>
      </div>

      {/* Status + cancel */}
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
          <span className="text-xs" style={{ color: "var(--warm-gray)" }}>{st.label}</span>
        </div>
        {b.status === "booked" && (
          <Btn variant="danger" size="sm" disabled={cancelling === b.id} onClick={() => onCancel(b.id)}>
            {cancelling === b.id ? "..." : "Huỷ"}
          </Btn>
        )}
      </div>
    </div>
  );
}
