"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminStudentApi } from "@/lib/api";
import type { Student } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import CreateStudentModal from "@/components/admin/CreateStudentModal";

export default function AdminStudentsPage() {
  const { data: students, isLoading, error, mutate } = useSWR("/admin/students", adminStudentApi.list);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>
            Học viên
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>
            Danh sách học viên đang theo học
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--charcoal)", color: "var(--white)" }}
          onClick={() => setShowCreate(true)}
        >
          + Thêm học viên
        </button>
      </div>

      <CreateStudentModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); mutate(); }}
      />

      {error && <ErrorBox error={error} onRetry={() => mutate()} />}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--white)", borderColor: "var(--sand)" }}
      >
        {isLoading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--warm-gray-light)" }}>
            Đang tải...
          </div>
        ) : !students?.length ? (
          <div className="p-12 text-center">
            <div className="text-3xl mb-3">👥</div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--charcoal)" }}>
              Chưa có học viên nào
            </p>
            <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
              Thêm học viên để bắt đầu quản lý
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Họ tên</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Email</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Số điện thoại</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s: Student) => (
                <tr
                  key={s.id}
                  style={{ borderBottom: "1px solid var(--cream-dark)" }}
                  className="hover:bg-[var(--cream)] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ background: "var(--sand)", color: "var(--charcoal)" }}
                      >
                        {s.full_name[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: "var(--charcoal)" }}>
                        {s.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>{s.email ?? "—"}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>{s.phone ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={
                        s.status === "active"
                          ? { background: "#EAF5EA", color: "#2E6B2E" }
                          : { background: "#FBF0F0", color: "#B94B4B" }
                      }
                    >
                      {s.status === "active" ? "Hoạt động" : "Vô hiệu"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
