"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminSessionApi } from "@/lib/api";
import type { ClassSession } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import EmptyRow from "@/components/EmptyRow";
import CreateSessionModal from "@/components/admin/CreateSessionModal";
import EditSessionModal from "@/components/admin/EditSessionModal";
import SessionsCalendarView from "@/components/admin/SessionsCalendarView";
import Btn from "@/components/Btn";

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  scheduled:  { label: "Sắp diễn ra", bg: "#EAF5EA", color: "#2E6B2E" },
  completed:  { label: "Đã xong",     bg: "#EEF2FF", color: "#3730A3" },
  cancelled:  { label: "Đã huỷ",      bg: "#FBF0F0", color: "#B94B4B" },
};

export default function AdminSessionsPage() {
  const { data: sessions, isLoading, error, mutate } = useSWR("/admin/sessions", () => adminSessionApi.list());
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ClassSession | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>Lịch học</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>Quản lý các buổi tập của studio</p>
        </div>
        <Btn onClick={() => setShowCreate(true)}>+ Thêm buổi tập</Btn>
      </div>

      <div className="flex gap-1 mb-5 p-1 rounded-lg w-fit" style={{ background: "var(--cream)" }}>
        {(["list", "calendar"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className="px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={
              view === v
                ? { background: "var(--white)", color: "var(--charcoal)" }
                : { color: "var(--warm-gray)" }
            }
          >
            {v === "list" ? "Danh sách" : "Lịch"}
          </button>
        ))}
      </div>

      <CreateSessionModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); mutate(); }} />

      {editing && (
        <EditSessionModal
          session={editing}
          open={!!editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); mutate(); }}
        />
      )}

      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

      {view === "calendar" ? (
        <SessionsCalendarView onSelect={(s) => setEditing(s)} />
      ) : (
      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--white)", borderColor: "var(--sand)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Buổi tập</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>HLV</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Thời gian</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Sức chứa</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-sm text-center" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</td></tr>
            ) : !sessions?.length ? (
              <EmptyRow colSpan={5} message="Chưa có buổi tập nào" />
            ) : sessions.map((s: ClassSession) => {
              const status = STATUS_MAP[s.status] ?? { label: s.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
              return (
                <tr
                  key={s.id}
                  style={{ borderBottom: "1px solid var(--cream-dark)" }}
                  className="hover:bg-[var(--cream)] transition-colors cursor-pointer"
                  onClick={() => setEditing(s)}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium" style={{ color: "var(--charcoal)" }}>{s.class_type_name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray-light)" }}>{s.branch_name}</div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>
                    {s.trainer_name ?? <span style={{ color: "var(--warm-gray-light)" }}>—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "var(--warm-gray)" }}>
                    {new Date(s.start_at).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>
                    {s.booked_count}<span style={{ color: "var(--warm-gray-light)" }}>/{s.capacity}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
