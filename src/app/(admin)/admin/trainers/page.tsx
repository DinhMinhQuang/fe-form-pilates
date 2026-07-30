"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminTrainerApi } from "@/lib/api";
import type { Trainer } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import EmptyRow from "@/components/EmptyRow";
import Btn from "@/components/Btn";
import CreateTrainerModal from "@/components/admin/CreateTrainerModal";
import EditTrainerModal from "@/components/admin/EditTrainerModal";

export default function AdminTrainersPage() {
  const { data: trainers, isLoading, error, mutate } = useSWR("/admin/trainers", () => adminTrainerApi.list());
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Trainer | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>Huấn luyện viên</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>Đội ngũ huấn luyện viên của studio</p>
        </div>
        <Btn onClick={() => setShowCreate(true)}>+ Thêm HLV</Btn>
      </div>

      <CreateTrainerModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); mutate(); }} />
      <EditTrainerModal trainer={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); mutate(); }} />

      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

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
            ) : !trainers?.length ? (
              <EmptyRow colSpan={5} message="Chưa có huấn luyện viên nào" />
            ) : trainers.map((t: Trainer) => (
              <tr key={t.id} style={{ borderBottom: "1px solid var(--cream-dark)" }} className="hover:bg-[var(--cream)] transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: "var(--accent)", color: "var(--white)" }}>
                      {t.full_name[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: "var(--charcoal)" }}>{t.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>{t.email ?? "—"}</td>
                <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>{t.phone ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={t.status === "active" ? { background: "#EAF5EA", color: "#2E6B2E" } : { background: "#FBF0F0", color: "#B94B4B" }}>
                    {t.status === "active" ? "Hoạt động" : "Vô hiệu"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Btn variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" onClick={() => setEditing(t)}>Sửa</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
