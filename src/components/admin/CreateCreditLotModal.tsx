"use client";

import { useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import { adminStudentApi, catalogApi } from "@/lib/api";
import { dateInputToEndOfDayIso, expiryFromNow, toDateInputValue } from "@/lib/date";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };
const selectStyle = { ...inputStyle, appearance: "none" as const };

interface Props {
  studentId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCreditLotModal({ studentId, open, onClose, onCreated }: Props) {
  const { data: packages } = useSWR(open ? "/packages" : null, catalogApi.packages);
  const { data: branches } = useSWR(open ? "/branches" : null, catalogApi.branches);

  const [packageId, setPackageId] = useState("");
  const [sessionsTotal, setSessionsTotal] = useState(10);
  const [expiresAt, setExpiresAt] = useState("");
  // Hạn dùng auto-tính theo gói chỉ là preview — nếu admin không tự sửa ngày,
  // tính lại đúng lúc bấm submit (không dùng giá trị tính sẵn lúc chọn gói,
  // vì admin có thể mất thêm vài giây/phút điền các trường khác, khiến hạn
  // dùng đã tính trước đó bị lùi vào quá khứ so với "now" thực tế lúc gửi).
  const [expiryTouched, setExpiryTouched] = useState(false);
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  function reset() {
    setPackageId(""); setSessionsTotal(10); setExpiresAt(""); setExpiryTouched(false); setBranchId(""); setError(null);
  }

  function handleClose() { reset(); onClose(); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!packageId) {
      setError(new Error("Vui lòng chọn gói tập"));
      return;
    }
    if (sessionsTotal < 1) {
      setError(new Error("Số buổi phải ít nhất 1"));
      return;
    }
    if (!expiresAt) {
      setError(new Error("Vui lòng chọn ngày hết hạn"));
      return;
    }

    const pkg = packages?.find((p) => p.id === packageId);
    const finalExpiresAt =
      !expiryTouched && pkg
        ? expiryFromNow(pkg.validity_days).toISOString()
        : dateInputToEndOfDayIso(toDateInputValue(expiresAt));

    setError(null);
    setLoading(true);
    try {
      await adminStudentApi.createCredit(studentId, {
        package_id: packageId,
        sessions_total: sessionsTotal,
        expires_at: finalExpiresAt,
        branch_id: branchId || undefined,
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
    <Modal title="Cấp gói tập mới" open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Gói tập <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <select
            className={inputClass}
            style={selectStyle}
            value={packageId}
            onChange={(e) => {
              const id = e.target.value;
              setPackageId(id);
              const pkg = packages?.find((p) => p.id === id);
              if (pkg) {
                setSessionsTotal(pkg.sessions);
                // Chỉ để preview ngày trên form — giá trị thật gửi lên lúc submit
                // sẽ được tính lại từ "now" tại thời điểm đó (xem handleSubmit).
                setExpiresAt(expiryFromNow(pkg.validity_days).toISOString());
                setExpiryTouched(false);
              }
            }}
          >
            <option value="">Chọn gói tập</option>
            {packages?.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sessions} buổi)</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Số buổi <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              type="number" min={1} className={inputClass} style={inputStyle}
              value={sessionsTotal} onChange={(e) => setSessionsTotal(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Hết hạn <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input
              type="date" className={inputClass} style={inputStyle}
              value={expiresAt ? toDateInputValue(expiresAt) : ""}
              onChange={(e) => {
                setExpiresAt(e.target.value ? dateInputToEndOfDayIso(e.target.value) : "");
                setExpiryTouched(true);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Chi nhánh áp dụng
          </label>
          <select className={inputClass} style={selectStyle} value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">Mọi chi nhánh</option>
            {branches?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
            Để trống nếu học viên được dùng gói này ở bất kỳ chi nhánh nào.
          </p>
        </div>

        <FormError error={error} />

        <div className="flex gap-2 pt-1">
          <Btn variant="ghost" className="flex-1" type="button" onClick={handleClose}>Huỷ</Btn>
          <Btn variant="primary" className="flex-1" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Cấp gói"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
