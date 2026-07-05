"use client";

import { useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import EmptyRow from "@/components/EmptyRow";
import Btn from "@/components/Btn";
import { adminStudentApi, studentApi } from "@/lib/api";
import type { ClassSession } from "@/types";

interface Props {
  studentId: string;
  studentName: string;
  open: boolean;
  onClose: () => void;
  onBooked: () => void;
}

export default function BookForStudentModal({ studentId, studentName, open, onClose, onBooked }: Props) {
  const { data: sessions, isLoading } = useSWR(
    open ? "/sessions/admin-book" : null,
    () => studentApi.sessions(),
  );
  const [booking, setBooking] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  async function handleBook(sessionId: string) {
    setBooking(sessionId);
    setError(null);
    try {
      await adminStudentApi.book(studentId, sessionId);
      onBooked();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setBooking(null);
    }
  }

  return (
    <Modal title={`Đặt lịch dùm — ${studentName}`} open={open} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <FormError error={error} />

        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--sand)", maxHeight: 380, overflowY: "auto" }}
        >
          <table className="w-full text-sm">
            <thead className="sticky top-0" style={{ background: "var(--cream)" }}>
              <tr style={{ borderBottom: "1px solid var(--sand)" }}>
                <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Buổi tập</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Thời gian</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Chỗ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</td></tr>
              ) : !sessions?.length ? (
                <EmptyRow colSpan={4} message="Không có buổi học nào" />
              ) : sessions.map((s: ClassSession) => {
                const full = s.booked_count >= s.capacity;
                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color: "var(--charcoal)" }}>{s.class_type_name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray-light)" }}>{s.branch_name}</div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--warm-gray)" }}>
                      {new Date(s.start_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: full ? "#B94B4B" : "var(--warm-gray-light)" }}>
                      {s.capacity - s.booked_count}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Btn size="sm" variant="primary" disabled={full || booking === s.id} onClick={() => handleBook(s.id)}>
                        {booking === s.id ? "..." : "Đặt"}
                      </Btn>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Btn variant="ghost" className="w-full" type="button" onClick={onClose}>Đóng</Btn>
      </div>
    </Modal>
  );
}
