"use client";

import { useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import { trainerApi } from "@/lib/api";
import type { ClassSession } from "@/types";

interface Props {
  session: ClassSession;
  open: boolean;
  onClose: () => void;
  onBooked: () => void;
}

export default function TrainerBookModal({ session, open, onClose, onBooked }: Props) {
  const [q, setQ] = useState("");
  const [booking, setBooking] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { data: results, isLoading } = useSWR(
    open && q.trim().length >= 2 ? ["/trainer/students", q] : null,
    () => trainerApi.searchStudents(q.trim()),
  );

  async function handleBook(studentId: string) {
    setBooking(studentId);
    setError(null);
    try {
      await trainerApi.book(studentId, session.id);
      onBooked();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setBooking(null);
    }
  }

  return (
    <Modal title={`Đặt buổi — ${session.class_type_name}`} open={open} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-xs" style={{ color: "var(--warm-gray)" }}>
          {new Date(session.start_at).toLocaleString("vi-VN", {
            weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
          })}
          {" · "}
          {session.booked_count}/{session.capacity} chỗ
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--warm-gray)" }}>
            Tìm học viên (tên hoặc SĐT)
          </label>
          <input
            type="text"
            autoFocus
            placeholder="Nhập ít nhất 2 ký tự..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors"
            style={{ borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" }}
          />
        </div>

        <FormError error={error} />

        {q.trim().length >= 2 && (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--sand)", maxHeight: 280, overflowY: "auto" }}>
            {isLoading ? (
              <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--warm-gray-light)" }}>Đang tìm...</div>
            ) : !results?.length ? (
              <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--warm-gray-light)" }}>Không tìm thấy học viên</div>
            ) : (
              <ul>
                {results.map((s) => (
                  <li key={s.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                    <div>
                      <div className="font-medium text-sm" style={{ color: "var(--charcoal)" }}>{s.full_name}</div>
                      <div className="text-xs" style={{ color: "var(--warm-gray-light)" }}>{s.phone ?? "—"}</div>
                    </div>
                    <Btn size="sm" variant="primary" disabled={booking === s.id || session.booked_count >= session.capacity} onClick={() => handleBook(s.id)}>
                      {booking === s.id ? "..." : "Đặt"}
                    </Btn>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Btn variant="ghost" className="w-full" type="button" onClick={onClose}>Đóng</Btn>
      </div>
    </Modal>
  );
}
