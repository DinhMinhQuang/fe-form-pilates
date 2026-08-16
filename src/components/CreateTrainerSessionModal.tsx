"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import Select from "@/components/Select";
import { catalogApi, trainerApi } from "@/lib/api";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };
const START_OFFSET_HOURS = 1;
const DEFAULT_DURATION_MINUTES = 55;
const MAX_SESSION_DURATION_MS = 3 * 60 * 60 * 1000;

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStartDate() {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(d.getHours() + START_OFFSET_HOURS);
  return d;
}

function defaultStart() {
  return toLocalInput(defaultStartDate());
}

function defaultEnd() {
  const d = new Date(defaultStartDate().getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);
  return toLocalInput(d);
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTrainerSessionModal({ open, onClose, onCreated }: Props) {
  const { data: branches } = useSWR(open ? "/branches" : null, catalogApi.branches);
  const { data: classTypes } = useSWR(open ? "/class-types" : null, catalogApi.classTypes);

  const [branchId, setBranchId] = useState("");
  const [classTypeId, setClassTypeId] = useState("");
  const [startAt, setStartAt] = useState(defaultStart);
  const [endAt, setEndAt] = useState(defaultEnd);
  const [capacity, setCapacity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Trainer chỉ được tự tạo Private (1) hoặc Duo (2) — không cho tạo lớp nhóm.
  const selectedBranch = branches?.find((b) => b.id === branchId);
  const availableClassTypes = (selectedBranch ? classTypes?.filter((ct) => selectedBranch.class_type_ids.includes(ct.id)) : classTypes)
    ?.filter((ct) => ct.category === "private" || ct.category === "duo");

  function reset() {
    setBranchId(""); setClassTypeId("");
    setStartAt(defaultStart()); setEndAt(defaultEnd()); setCapacity(1); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  function handleBranchChange(id: string) {
    setBranchId(id);
    setClassTypeId("");
  }

  function handleClassTypeChange(id: string) {
    setClassTypeId(id);
    const ct = availableClassTypes?.find((c) => c.id === id);
    if (ct) setCapacity(ct.category === "duo" ? 2 : 1);
  }

  function handleStartAtChange(value: string) {
    setStartAt(value);
    const start = new Date(value);
    if (!value || Number.isNaN(start.getTime())) return;
    setEndAt(toLocalInput(new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000)));
  }

  useEffect(() => {
    if (open) {
      setStartAt(defaultStart());
      setEndAt(defaultEnd());
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!branchId) { setError(new Error("Vui lòng chọn chi nhánh")); return; }
    if (!classTypeId) { setError(new Error("Vui lòng chọn loại lớp")); return; }
    if (!startAt) { setError(new Error("Vui lòng chọn thời gian bắt đầu")); return; }
    if (!endAt) { setError(new Error("Vui lòng chọn thời gian kết thúc")); return; }
    if (new Date(startAt) <= new Date()) { setError(new Error("Thời gian bắt đầu phải ở tương lai")); return; }
    if (new Date(endAt) <= new Date(startAt)) { setError(new Error("Thời gian kết thúc phải sau thời gian bắt đầu")); return; }
    if (new Date(endAt).getTime() - new Date(startAt).getTime() > MAX_SESSION_DURATION_MS) {
      setError(new Error("Thời lượng buổi tập tối đa là 3 tiếng"));
      return;
    }
    if (capacity < 1 || capacity > 2) { setError(new Error("Private/Duo chỉ được tối đa 2 người")); return; }

    setError(null);
    setLoading(true);
    try {
      await trainerApi.createSession({
        branch_id: branchId,
        class_type_id: classTypeId,
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

  return (
    <Modal title="Tạo lớp Private / Duo" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Chi nhánh <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <Select
              value={branchId}
              onChange={handleBranchChange}
              placeholder="Chọn chi nhánh"
              options={(branches ?? []).map((b) => ({ value: b.id, label: b.name }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Loại lớp <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <Select
              value={classTypeId}
              onChange={handleClassTypeChange}
              disabled={!branchId}
              placeholder={branchId ? "Chọn loại lớp" : "Chọn chi nhánh trước"}
              options={(availableClassTypes ?? []).map((ct) => ({
                value: ct.id,
                label: `${ct.name} (${ct.category === "duo" ? "Duo, 2 người" : "Private, 1 người"})`,
              }))}
            />
            {branchId && !availableClassTypes?.length && (
              <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
                Chi nhánh này chưa có loại lớp Private/Duo nào.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Bắt đầu <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input type="datetime-local" className={inputClass} style={inputStyle} value={startAt} onChange={(e) => handleStartAtChange(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Kết thúc <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input type="datetime-local" className={inputClass} style={inputStyle} value={endAt} onChange={(e) => setEndAt(e.target.value)} />
          </div>
        </div>

        <FormError error={error} />

        <div className="flex gap-2 pt-1">
          <Btn variant="ghost" className="flex-1" type="button" onClick={handleClose}>Huỷ</Btn>
          <Btn variant="primary" className="flex-1" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Tạo lớp"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
