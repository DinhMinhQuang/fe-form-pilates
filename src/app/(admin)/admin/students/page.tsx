"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminStudentApi } from "@/lib/api";
import type { Student } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import EmptyRow from "@/components/EmptyRow";
import CreateStudentModal from "@/components/admin/CreateStudentModal";
import EditStudentModal from "@/components/admin/EditStudentModal";
import StudentDrawer from "@/components/admin/StudentDrawer";
import Btn from "@/components/Btn";

const PAGE_SIZE = 10;

export default function AdminStudentsPage() {
  const [q, setQ] = useState("");
  const [cursors, setCursors] = useState<string[]>([]);
  const cursor = cursors[cursors.length - 1];

  const { data: students, isLoading, error, mutate } = useSWR(
    ["/admin/students", q, cursor],
    () => adminStudentApi.list({ q: q.trim() || undefined, cursor, limit: PAGE_SIZE }),
  );

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<Student | null>(null);

  function handleSearch(value: string) {
    setQ(value);
    setCursors([]);
  }

  function goNext() {
    if (students?.nextCursor) setCursors((c) => [...c, students.nextCursor!]);
  }

  function goPrev() {
    setCursors((c) => c.slice(0, -1));
  }

  function refresh() {
    setCursors([]);
    mutate();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>Học viên</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>Danh sách học viên đang theo học</p>
        </div>
        <Btn onClick={() => setShowCreate(true)}>+ Thêm học viên</Btn>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc số điện thoại..."
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors"
          style={{ borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" }}
        />
      </div>

      <CreateStudentModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); refresh(); }} />
      <EditStudentModal student={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />
      <StudentDrawer student={viewing} onClose={() => setViewing(null)} />

      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => refresh()} /></div>}

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--white)", borderColor: "var(--sand)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Họ tên</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Email</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Điện thoại</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-sm text-center" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</td></tr>
            ) : !students?.length ? (
              <EmptyRow colSpan={5} message="Chưa có học viên nào" />
            ) : students.map((s: Student) => (
              <tr
                key={s.id}
                style={{ borderBottom: "1px solid var(--cream-dark)", background: viewing?.id === s.id ? "var(--cream)" : undefined }}
                className="hover:bg-[var(--cream)] transition-colors group cursor-pointer"
                onClick={() => setViewing(s)}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: "var(--sand)", color: "var(--charcoal)" }}>
                      {s.full_name[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: "var(--charcoal)" }}>{s.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>{s.email ?? "—"}</td>
                <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>{s.phone ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={s.status === "active" ? { background: "#EAF5EA", color: "#2E6B2E" } : { background: "#FBF0F0", color: "#B94B4B" }}>
                    {s.status === "active" ? "Hoạt động" : "Vô hiệu"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <Btn variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" onClick={() => setEditing(s)}>Sửa</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="ghost" size="sm" onClick={goPrev} disabled={!cursors.length || isLoading}>← Trước</Btn>
        <Btn variant="ghost" size="sm" onClick={goNext} disabled={!students?.nextCursor || isLoading}>Tiếp →</Btn>
      </div>
    </div>
  );
}
