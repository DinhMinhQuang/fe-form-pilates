"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import { adminBookingApi, adminSessionApi, adminStudentApi, adminTrainerApi, catalogApi } from "@/lib/api";
import type { Booking, ClassSession, Student } from "@/types";
import CancelBookingModal from "@/components/admin/CancelBookingModal";
import Select from "@/components/Select";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };
const MAX_SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

const BOOKING_STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  booked:             { label: "Đã đặt",  bg: "#EAF5EA", color: "#2E6B2E" },
  attended:           { label: "Đã học",  bg: "#EEF2FF", color: "#3730A3" },
  cancelled_refunded: { label: "Đã huỷ",  bg: "#FBF0F0", color: "#B94B4B" },
  no_show:            { label: "Vắng",    bg: "#FEF9E7", color: "#7A5C00" },
};

function AddWalkInStudent({ sessionId, onAdded }: { sessionId: string; onAdded: () => void }) {
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { data: results } = useSWR(
    q.trim().length >= 2 ? ["/admin/students/walk-in-search", q] : null,
    () => adminStudentApi.list({ q, limit: 6 }),
  );

  async function handleAdd(student: Student) {
    setAdding(student.id);
    setError(null);
    try {
      await adminStudentApi.bookAttended(student.id, sessionId);
      setQ("");
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
        Ghi nhận học viên tập ngoài lịch (walk-in)
      </span>
      <div className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên hoặc số điện thoại..."
          className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors"
          style={{ borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" }}
        />
        {results && results.length > 0 && (
          <div
            className="absolute z-10 mt-1 w-full rounded-lg border shadow-lg overflow-hidden"
            style={{ background: "var(--white)", borderColor: "var(--sand)" }}
          >
            {results.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={adding === s.id}
                onClick={() => handleAdd(s)}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-[var(--cream)] transition-colors"
                style={{ color: "var(--charcoal)" }}
              >
                <span>
                  {s.full_name} <span style={{ color: "var(--warm-gray-light)" }}>{s.phone ?? ""}</span>
                </span>
                <span className="text-xs" style={{ color: "var(--accent)" }}>{adding === s.id ? "..." : "Ghi nhận đã tập"}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <FormError error={error} />
    </div>
  );
}

function SessionRoster({ sessionId, onChanged }: { sessionId: string; onChanged: () => void }) {
  const { data: bookings, isLoading, error, mutate } = useSWR(
    ["/admin/bookings", sessionId],
    () => adminBookingApi.list({ session_id: sessionId, limit: 100 }),
  );
  const [rosterError, setRosterError] = useState<Error | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  async function handleCancel(reason: string, refund: boolean) {
    if (!cancelTarget) return;
    setRosterError(null);
    try {
      await adminBookingApi.cancel(cancelTarget.id, { reason, refund });
      setCancelTarget(null);
      await mutate();
      onChanged();
    } catch (err) {
      setRosterError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  async function handleWalkInAdded() {
    await mutate();
    onChanged();
  }

  return (
    <div className="flex flex-col gap-3">
      <AddWalkInStudent sessionId={sessionId} onAdded={handleWalkInAdded} />
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
        Danh sách học viên đã đặt
      </span>
      {rosterError && <FormError error={rosterError} />}
      {error && <FormError error={error} />}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--sand)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
              <th className="text-left px-3 py-2 text-xs font-medium uppercase" style={{ color: "var(--warm-gray)" }}>Học viên</th>
              <th className="text-left px-3 py-2 text-xs font-medium uppercase" style={{ color: "var(--warm-gray)" }}>SĐT</th>
              <th className="text-left px-3 py-2 text-xs font-medium uppercase" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-3 py-4 text-center text-xs" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</td></tr>
            ) : !bookings?.length ? (
              <tr><td colSpan={4} className="px-3 py-4 text-center text-xs" style={{ color: "var(--warm-gray-light)" }}>Chưa có học viên đăng ký</td></tr>
            ) : bookings.map((b) => {
              const s = BOOKING_STATUS_MAP[b.status] ?? { label: b.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
              return (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                  <td className="px-3 py-2 font-medium" style={{ color: "var(--charcoal)" }}>{b.student_name}</td>
                  <td className="px-3 py-2" style={{ color: "var(--warm-gray)" }}>{b.student_phone ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {b.status === "booked" && (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(b)}
                        className="text-xs underline"
                        style={{ color: "#B94B4B" }}
                      >
                        Huỷ
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {cancelTarget && (
        <CancelBookingModal
          open={!!cancelTarget}
          title={`Huỷ booking — ${cancelTarget.student_name}`}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancel}
        />
      )}
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  session: ClassSession;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onRosterChanged?: () => void;
}

export default function EditSessionModal({ session, open, onClose, onSaved, onRosterChanged }: Props) {
  const { data: branches } = useSWR(open ? "/branches" : null, catalogApi.branches);
  const { data: classTypes } = useSWR(open ? "/class-types" : null, catalogApi.classTypes);
  const { data: trainers } = useSWR(open ? "/admin/trainers" : null, () => adminTrainerApi.list());

  const [branchId, setBranchId] = useState(session.branch_id);
  const [classTypeId, setClassTypeId] = useState(session.class_type_id);
  const [trainerId, setTrainerId] = useState(session.trainer_id ?? "");
  const [startAt, setStartAt] = useState(toLocalInput(session.start_at));
  const [endAt, setEndAt] = useState(toLocalInput(session.end_at));
  const [capacity, setCapacity] = useState(session.capacity);
  const [loading, setLoading] = useState(false);
  const [showCancelSession, setShowCancelSession] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setBranchId(session.branch_id);
    setClassTypeId(session.class_type_id);
    setTrainerId(session.trainer_id ?? "");
    setStartAt(toLocalInput(session.start_at));
    setEndAt(toLocalInput(session.end_at));
    setCapacity(session.capacity);
    setError(null);
  }, [session]);

  const selectedBranch = branches?.find((b) => b.id === branchId);
  const availableClassTypes = selectedBranch
    ? classTypes?.filter((ct) => selectedBranch.class_type_ids.includes(ct.id))
    : classTypes;

  function handleBranchChange(id: string) {
    setBranchId(id);
    const branch = branches?.find((b) => b.id === id);
    if (branch && classTypeId && !branch.class_type_ids.includes(classTypeId)) {
      setClassTypeId("");
    }
  }

  function handleClassTypeChange(id: string) {
    setClassTypeId(id);
    const ct = classTypes?.find((c) => c.id === id);
    if (ct) setCapacity(ct.default_capacity);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (new Date(endAt) <= new Date(startAt)) {
      setError(new Error("Thời gian kết thúc phải sau thời gian bắt đầu"));
      return;
    }
    if (new Date(endAt).getTime() - new Date(startAt).getTime() > MAX_SESSION_DURATION_MS) {
      setError(new Error("Thời lượng buổi tập tối đa là 2 tiếng"));
      return;
    }
    if (capacity < session.booked_count) {
      setError(new Error(`Sức chứa không thể nhỏ hơn số đã đặt (${session.booked_count})`));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await adminSessionApi.update(session.id, {
        branch_id: branchId,
        class_type_id: classTypeId,
        trainer_id: trainerId || undefined,
        start_at: new Date(startAt).toISOString(),
        end_at: new Date(endAt).toISOString(),
        capacity,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSession(reason: string) {
    try {
      await adminSessionApi.cancel(session.id, { reason });
      setShowCancelSession(false);
      onSaved();
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  return (
    <Modal title="Sửa buổi tập" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Chi nhánh</label>
            <Select
              value={branchId}
              onChange={handleBranchChange}
              options={(branches ?? []).map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Loại lớp</label>
            <Select
              value={classTypeId}
              onChange={handleClassTypeChange}
              options={(availableClassTypes ?? []).map((ct) => ({ value: ct.id, label: `${ct.name} (${ct.default_capacity})` }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Huấn luyện viên</label>
          <Select
            value={trainerId}
            onChange={setTrainerId}
            placeholder="— Chưa gán —"
            options={[{ value: "", label: "— Chưa gán —" }, ...(trainers ?? []).map((t) => ({ value: t.id, label: t.full_name }))]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Bắt đầu</label>
            <input type="datetime-local" className={inputClass} style={inputStyle} value={startAt} onChange={(e) => setStartAt(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Kết thúc</label>
            <input type="datetime-local" className={inputClass} style={inputStyle} value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Sức chứa</label>
          <Select
            value={String(capacity)}
            onChange={(v) => setCapacity(Number(v))}
            options={[
              { value: "1", label: "1 (Private)" },
              { value: "2", label: "2 (Duo)" },
              { value: "3", label: "3 (Trio)" },
              { value: "6", label: "6 (Nhóm)" },
            ]}
          />
          <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
            Tự động theo loại lớp, có thể đổi nếu cần. Đã đặt: {session.booked_count} người
          </p>
        </div>

        <SessionRoster sessionId={session.id} onChanged={() => onRosterChanged?.()} />

        <FormError error={error} />

        <div className="flex gap-2 pt-1">
          <Btn variant="danger" type="button" disabled={session.status !== "scheduled"} onClick={() => setShowCancelSession(true)}>
            Huỷ buổi tập
          </Btn>
          <Btn variant="ghost" className="flex-1" type="button" onClick={onClose}>Đóng</Btn>
          <Btn variant="primary" className="flex-1" type="submit" disabled={loading || session.status !== "scheduled"}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Btn>
        </div>
      </form>

      {showCancelSession && (
        <CancelBookingModal
          open={showCancelSession}
          title="Huỷ buổi tập"
          description="Tất cả học viên đã đặt trong buổi này sẽ được hoàn buổi tự động."
          showRefundOption={false}
          confirmLabel="Huỷ buổi tập"
          onClose={() => setShowCancelSession(false)}
          onConfirm={(reason) => handleCancelSession(reason)}
        />
      )}
    </Modal>
  );
}
