"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import { adminSessionApi, adminTrainerApi, catalogApi } from "@/lib/api";
import type { ClassSession } from "@/types";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };
const selectStyle = { ...inputStyle, appearance: "none" as const };
const MAX_SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

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
}

export default function EditSessionModal({ session, open, onClose, onSaved }: Props) {
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
  const [cancelling, setCancelling] = useState(false);
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

  async function handleCancelSession() {
    if (!window.confirm("Huỷ buổi tập này? Tất cả học viên đã đặt sẽ được hoàn buổi.")) return;
    setCancelling(true);
    setError(null);
    try {
      await adminSessionApi.cancel(session.id);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Modal title="Sửa buổi tập" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Chi nhánh</label>
            <select className={inputClass} style={selectStyle} value={branchId} onChange={(e) => handleBranchChange(e.target.value)}>
              {branches?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Loại lớp</label>
            <select className={inputClass} style={selectStyle} value={classTypeId} onChange={(e) => handleClassTypeChange(e.target.value)}>
              {availableClassTypes?.map((ct) => <option key={ct.id} value={ct.id}>{ct.name} ({ct.default_capacity})</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Huấn luyện viên</label>
          <select className={inputClass} style={selectStyle} value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
            <option value="">— Chưa gán —</option>
            {trainers?.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </select>
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
          <select className={inputClass} style={selectStyle} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}>
            <option value={1}>1 (Private)</option>
            <option value={2}>2 (Duo)</option>
            <option value={3}>3 (Trio)</option>
            <option value={6}>6 (Nhóm)</option>
          </select>
          <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
            Tự động theo loại lớp, có thể đổi nếu cần. Đã đặt: {session.booked_count} người
          </p>
        </div>

        <FormError error={error} />

        <div className="flex gap-2 pt-1">
          <Btn variant="danger" type="button" disabled={cancelling || session.status !== "scheduled"} onClick={handleCancelSession}>
            {cancelling ? "Đang huỷ..." : "Huỷ buổi tập"}
          </Btn>
          <Btn variant="ghost" className="flex-1" type="button" onClick={onClose}>Đóng</Btn>
          <Btn variant="primary" className="flex-1" type="submit" disabled={loading || session.status !== "scheduled"}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
