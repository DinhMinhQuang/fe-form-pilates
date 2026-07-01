"use client";

import { useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import ErrorBox from "@/components/ErrorBox";
import Btn from "@/components/Btn";
import { adminSessionApi, adminTrainerApi, catalogApi } from "@/lib/api";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

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
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  function reset() {
    setBranchId(""); setClassTypeId(""); setTrainerId("");
    setStartAt(""); setEndAt(""); setCapacity(10); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Chi nhánh <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <select
              className={inputClass} style={selectStyle}
              value={branchId} onChange={(e) => setBranchId(e.target.value)} required
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
              value={classTypeId} onChange={(e) => setClassTypeId(e.target.value)} required
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            >
              <option value="">Chọn loại lớp</option>
              {classTypes?.map((ct) => (
                <option key={ct.id} value={ct.id}>{ct.name}</option>
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
            value={trainerId} onChange={(e) => setTrainerId(e.target.value)} required
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          >
            <option value="">Chọn huấn luyện viên</option>
            {trainers?.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Bắt đầu <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              type="datetime-local" className={inputClass} style={inputStyle}
              value={startAt} onChange={(e) => setStartAt(e.target.value)} required
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
              value={endAt} onChange={(e) => setEndAt(e.target.value)} required
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Sức chứa <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <input
            type="number" min={1} max={100}
            className={inputClass} style={inputStyle}
            value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
          />
        </div>

        {error && <ErrorBox error={error} />}

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
