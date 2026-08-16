"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Modal from "@/components/Modal";
import FormError from "@/components/FormError";
import Btn from "@/components/Btn";
import Select from "@/components/Select";
import { adminSessionApi, adminStudentApi, adminTrainerApi, catalogApi } from "@/lib/api";
import type { Student, StudentDetail } from "@/types";

const inputClass = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const inputStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

interface BookResult {
  student: Student;
  error?: string;
}

function eligibleSessionsRemaining(detail: StudentDetail | undefined, branchId: string, classTypeId: string) {
  if (!detail) return null;
  const now = Date.now();
  return detail.credit_lots
    .filter(
      (l) =>
        l.status === "active" &&
        l.sessions_remaining > 0 &&
        new Date(l.expires_at).getTime() > now &&
        l.class_type_ids.includes(classTypeId) &&
        (l.branch_id == null || l.branch_id === branchId),
    )
    .reduce((sum, l) => sum + l.sessions_remaining, 0);
}

function SuggestionRow({
  student, branchId, classTypeId, onSelect,
}: { student: Student; branchId: string; classTypeId: string; onSelect: (s: Student) => void }) {
  const canFilter = !!branchId && !!classTypeId;
  const { data: detail } = useSWR(
    canFilter ? ["/admin/students/eligibility", student.id] : null,
    () => adminStudentApi.detail(student.id),
  );
  const eligible = canFilter ? eligibleSessionsRemaining(detail, branchId, classTypeId) : null;
  // eligible === null: chưa chọn chi nhánh/loại lớp, hoặc detail đang tải — hiện tổng credit chung tạm thời.
  const label = eligible === null ? (student.credits > 0 ? `còn ${student.credits} buổi` : "hết buổi")
    : eligible > 0 ? `còn ${eligible} buổi phù hợp` : "không có gói phù hợp";
  const ok = eligible === null ? student.credits > 0 : eligible > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(student)}
      className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-[var(--cream)] transition-colors"
      style={{ color: "var(--charcoal)" }}
    >
      <span>
        {student.full_name} <span style={{ color: "var(--warm-gray-light)" }}>{student.phone ?? ""}</span>
      </span>
      <span className="text-xs flex-shrink-0" style={{ color: ok ? "var(--accent)" : "#B94B4B" }}>
        {label}
      </span>
    </button>
  );
}

function StudentPicker({
  selected, branchId, classTypeId, onSelect,
}: { selected: Student[]; branchId: string; classTypeId: string; onSelect: (s: Student) => void }) {
  const [q, setQ] = useState("");
  const canSearch = !!branchId && !!classTypeId;
  const { data: results } = useSWR(
    canSearch && q.trim().length >= 2 ? ["/admin/students/session-picker", q] : null,
    () => adminStudentApi.list({ q, limit: 6 }),
  );
  const selectedIds = new Set(selected.map((s) => s.id));
  const suggestions = results?.filter((s) => !selectedIds.has(s.id));

  return (
    <div className="relative">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        disabled={!canSearch}
        placeholder={canSearch ? "Tìm theo tên hoặc số điện thoại..." : "Chọn chi nhánh & loại lớp trước"}
        className={inputClass}
        style={inputStyle}
      />
      {canSearch && suggestions && suggestions.length > 0 && (
        <div
          className="absolute z-10 mt-1 w-full rounded-lg border shadow-lg overflow-hidden"
          style={{ background: "var(--white)", borderColor: "var(--sand)" }}
        >
          {suggestions.map((s) => (
            <SuggestionRow
              key={s.id}
              student={s}
              branchId={branchId}
              classTypeId={classTypeId}
              onSelect={(picked) => { onSelect(picked); setQ(""); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Bắt đầu tối thiểu +1h so với hiện tại — backend chặn start_at <= now(),
// và mặc định = "now" sẽ hết hạn ngay khi admin còn đang điền form.
const START_OFFSET_HOURS = 1;
const DEFAULT_DURATION_MINUTES = 55;
const MAX_SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

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

export default function CreateSessionModal({ open, onClose, onCreated }: Props) {
  const { data: branches } = useSWR("/branches", catalogApi.branches);
  const { data: classTypes } = useSWR("/class-types", catalogApi.classTypes);
  const { data: trainers } = useSWR("/admin/trainers", () => adminTrainerApi.list());

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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [bookResults, setBookResults] = useState<BookResult[] | null>(null);

  function reset() {
    setBranchId(""); setClassTypeId(""); setTrainerId("");
    setStartAt(defaultStart()); setEndAt(defaultEnd()); setCapacity(6);
    setStudents([]); setError(null); setBookResults(null);
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

  // Đổi giờ bắt đầu thì tự dời giờ kết thúc theo đúng 55 phút mặc định,
  // thay vì giữ nguyên giờ kết thúc cũ (dễ tạo buổi âm/quá ngắn/quá dài).
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
      const { session_id } = await adminSessionApi.create({
        branch_id: branchId,
        class_type_id: classTypeId,
        trainer_id: trainerId,
        start_at: new Date(startAt).toISOString(),
        end_at: new Date(endAt).toISOString(),
        capacity,
      });

      if (students.length === 0) {
        reset();
        onCreated();
        return;
      }

      // Buổi tập đã tạo xong bất kể đặt chỗ có thành công hay không — mỗi
      // học viên có thể fail riêng (vd hết credit phù hợp), nên không dùng
      // Promise.all (sẽ reject sớm và bỏ sót kết quả của các học viên khác).
      const results: BookResult[] = [];
      for (const s of students) {
        try {
          await adminStudentApi.book(s.id, session_id);
          results.push({ student: s });
        } catch (err) {
          results.push({ student: s, error: err instanceof Error ? err.message : String(err) });
        }
      }
      setBookResults(results);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Thêm buổi tập" open={open} onClose={handleClose}>
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
              options={(availableClassTypes ?? []).map((ct) => ({ value: ct.id, label: `${ct.name} (${ct.default_capacity})` }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
            Huấn luyện viên <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <Select
            value={trainerId}
            onChange={setTrainerId}
            placeholder="Chọn huấn luyện viên"
            options={(trainers ?? []).map((t) => ({ value: t.id, label: t.full_name }))}
          />
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
              value={startAt} onChange={(e) => handleStartAtChange(e.target.value)}
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
          <Select
            value={String(capacity)}
            onChange={(v) => setCapacity(Number(v))}
            disabled={!classTypeId}
            options={[
              { value: "1", label: "1 (Private)" },
              { value: "2", label: "2 (Duo)" },
              { value: "3", label: "3 (Trio)" },
              { value: "6", label: "6 (Nhóm)" },
            ]}
          />
          <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
            Tự động theo loại lớp, có thể đổi nếu cần.
          </p>
        </div>

        {!bookResults && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Đặt chỗ sẵn cho học viên
            </label>
            <StudentPicker
              selected={students}
              branchId={branchId}
              classTypeId={classTypeId}
              onSelect={(s) => setStudents((prev) => [...prev, s])}
            />
            {students.length > 0 && (
              <div className="flex flex-col gap-1 mt-1">
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: "var(--cream)" }}
                  >
                    <span style={{ color: "var(--charcoal)" }}>{s.full_name}</span>
                    <button
                      type="button"
                      onClick={() => setStudents((prev) => prev.filter((x) => x.id !== s.id))}
                      className="text-xs"
                      style={{ color: "var(--warm-gray)" }}
                    >
                      Bỏ chọn
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {bookResults && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>
              Kết quả đặt chỗ
            </span>
            <div className="flex flex-col gap-1">
              {bookResults.map((r) => (
                <div key={r.student.id} className="flex items-center justify-between gap-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: "var(--cream)" }}>
                  <span style={{ color: "var(--charcoal)" }}>{r.student.full_name}</span>
                  {r.error ? (
                    <span style={{ color: "#B94B4B" }}>{r.error}</span>
                  ) : (
                    <span style={{ color: "#2E6B2E" }}>Đã đặt</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <FormError error={error} />

        <div className="flex gap-2 pt-1">
          {bookResults ? (
            <Btn variant="primary" className="flex-1" type="button" onClick={() => { reset(); onClose(); }}>Xong</Btn>
          ) : (
            <>
              <Btn variant="ghost" className="flex-1" type="button" onClick={handleClose}>Huỷ</Btn>
              <Btn variant="primary" className="flex-1" type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Tạo buổi tập"}
              </Btn>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
}
