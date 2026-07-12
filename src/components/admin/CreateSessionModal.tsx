"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import { adminSessionApi, adminTrainerApi, catalogApi } from "@/lib/api";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

// Bắt đầu tối thiểu +1h so với hiện tại — backend chặn start_at <= now(),
// và mặc định = "now" sẽ hết hạn ngay khi admin còn đang điền form.
const START_OFFSET_HOURS = 1;
const MAX_SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStart() {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(d.getHours() + START_OFFSET_HOURS);
  return toLocalInput(d);
}

function defaultEnd() {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(d.getHours() + START_OFFSET_HOURS + 1);
  return toLocalInput(d);
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateSessionModal({ open, onClose, onCreated }: Props) {
  const { data: branches } = useSWR("/branches", catalogApi.branches);
  const { data: classTypes } = useSWR("/class-types", catalogApi.classTypes);
  const { data: trainers } = useSWR("/admin/trainers", adminTrainerApi.list);

  const [branchId, setBranchId] = useState("");
  const [classTypeId, setClassTypeId] = useState("");
  const [trainerId, setTrainerId] = useState("");

  const { data: trainerSchedule } = useSWR(
    trainerId ? ["/admin/sessions", trainerId] : null,
    () => adminSessionApi.list({ trainer_id: trainerId, status: "scheduled" }),
  );
  const [startAt, setStartAt] = useState(defaultStart);
  const [endAt, setEndAt] = useState(defaultEnd);
  const [capacity, setCapacity] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  function reset() {
    setBranchId(""); setClassTypeId(""); setTrainerId("");
    setStartAt(defaultStart()); setEndAt(defaultEnd()); setCapacity(6); setError(null);
  }

  function handleClose() { reset(); onClose(); }

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

  useEffect(() => {
    if (open) {
      setStartAt(defaultStart());
      setEndAt(defaultEnd());
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!branchId) {
      setError(new Error("Vui lòng chọn chi nhánh"));
      return;
    }
    if (!classTypeId) {
      setError(new Error("Vui lòng chọn loại lớp"));
      return;
    }
    if (!trainerId) {
      setError(new Error("Vui lòng chọn huấn luyện viên"));
      return;
    }
    if (!startAt) {
      setError(new Error("Vui lòng chọn thời gian bắt đầu"));
      return;
    }
    if (!endAt) {
      setError(new Error("Vui lòng chọn thời gian kết thúc"));
      return;
    }
    if (new Date(endAt) <= new Date(startAt)) {
      setError(new Error("Thời gian kết thúc phải sau thời gian bắt đầu"));
      return;
    }
    if (new Date(endAt).getTime() - new Date(startAt).getTime() > MAX_SESSION_DURATION_MS) {
      setError(new Error("Thời lượng buổi tập tối đa là 2 tiếng"));
      return;
    }
    if (capacity < 1) {
      setError(new Error("Sức chứa phải ít nhất 1 người"));
      return;
    }
    const newStart = new Date(startAt).getTime();
    const newEnd = new Date(endAt).getTime();
    const conflict = trainerSchedule?.some(
      (s) => new Date(s.start_at).getTime() < newEnd && new Date(s.end_at).getTime() > newStart,
    );
    if (conflict) {
      setError(new Error("Huấn luyện viên đã có lịch dạy trong khoảng thời gian này."));
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await adminSessionApi.create({
        branch_id: branchId,
        class_type_id: classTypeId,
        trainer_id: trainerId,
        start_at: new Date(startAt).toISOString(),
        end_at: new Date(endAt).toISOString(),
        capacity,
      });
      reset();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  const selectStyle = { ...inputStyle, appearance: "none" as const };

  return (
    <Modal title="Thêm buổi tập" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Chi nhánh <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <select
              className={inputClass} style={selectStyle}
              value={branchId} onChange={(e) => handleBranchChange(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            >
              <option value="">Chọn chi nhánh</option>
              {branches?.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Loại lớp <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <select
              className={inputClass} style={selectStyle}
              value={classTypeId} onChange={(e) => handleClassTypeChange(e.target.value)}
              disabled={!branchId}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            >
              <option value="">{branchId ? "Chọn loại lớp" : "Chọn chi nhánh trước"}</option>
              {availableClassTypes?.map((ct) => (
                <option key={ct.id} value={ct.id}>{ct.name} ({ct.default_capacity})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Huấn luyện viên <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <select
            className={inputClass} style={selectStyle}
            value={trainerId} onChange={(e) => setTrainerId(e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          >
            <option value="">Chọn huấn luyện viên</option>
            {trainers?.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
          {trainerId && !!trainerSchedule?.length && (
            <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
              Lịch dạy sắp tới:{" "}
              {trainerSchedule
                .map((s) =>
                  new Date(s.start_at).toLocaleString("vi-VN", {
                    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                  }),
                )
                .join(", ")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Bắt đầu <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              type="datetime-local" className={inputClass} style={inputStyle}
              value={startAt} onChange={(e) => setStartAt(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Kết thúc <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              type="datetime-local" className={inputClass} style={inputStyle}
              value={endAt} onChange={(e) => setEndAt(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Sức chứa <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <select
            className={inputClass} style={selectStyle}
            value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}
            disabled={!classTypeId}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          >
            <option value={1}>1 (Private)</option>
            <option value={2}>2 (Duo)</option>
            <option value={3}>3 (Trio)</option>
            <option value={6}>6 (Nhóm)</option>
          </select>
          <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
            Tự động theo loại lớp, có thể đổi nếu cần.
          </p>
        </div>

        <FormError error={error} />

        <div className="flex gap-2 pt-1">
          <Btn variant="ghost" className="flex-1" type="button" onClick={handleClose}>Huỷ</Btn>
          <Btn variant="primary" className="flex-1" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Tạo buổi tập"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
