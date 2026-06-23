"use client";

import useSWR from "swr";
import { adminSessionApi } from "@/lib/api";
import type { ClassSession } from "@/types";

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  scheduled:  { label: "Sắp diễn ra", bg: "#EAF5EA", color: "#2E6B2E" },
  completed:  { label: "Đã xong",     bg: "#EEF2FF", color: "#3730A3" },
  cancelled:  { label: "Đã huỷ",      bg: "#FBF0F0", color: "#B94B4B" },
};

export default function AdminSessionsPage() {
  const { data: sessions, isLoading } = useSWR("/admin/sessions", adminSessionApi.list);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>
            Lịch học
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>
            Quản lý các buổi tập của studio
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--charcoal)", color: "var(--white)" }}
        >
          + Thêm buổi tập
        </button>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--white)", borderColor: "var(--sand)" }}
      >
        {isLoading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--warm-gray-light)" }}>
            Đang tải...
          </div>
        ) : !sessions?.length ? (
          <div className="p-12 text-center">
            <div className="text-3xl mb-3">📅</div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--charcoal)" }}>
              Chưa có buổi tập nào
            </p>
            <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
              Thêm buổi tập đầu tiên để bắt đầu
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Buổi tập</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Huấn luyện viên</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Thời gian</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Sức chứa</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s: ClassSession) => {
                const status = STATUS_MAP[s.status] ?? { label: s.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
                return (
                  <tr
                    key={s.id}
                    style={{ borderBottom: "1px solid var(--cream-dark)" }}
                    className="hover:bg-[var(--cream)] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium" style={{ color: "var(--charcoal)" }}>{s.class_type_name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray-light)" }}>{s.branch_name}</div>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>
                      {s.trainer_name ?? <span style={{ color: "var(--warm-gray-light)" }}>Chưa phân công</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "var(--warm-gray)" }}>
                      {new Date(s.start_at).toLocaleDateString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>
                      <span>{s.booked_count}</span>
                      <span style={{ color: "var(--warm-gray-light)" }}>/{s.capacity}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
