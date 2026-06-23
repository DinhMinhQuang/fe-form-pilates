"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminTrainerApi } from "@/lib/api";
import type { Trainer } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import CreateTrainerModal from "@/components/admin/CreateTrainerModal";

export default function AdminTrainersPage() {
  const { data: trainers, isLoading, error, mutate } = useSWR("/admin/trainers", adminTrainerApi.list);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>
            Huấn luyện viên
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>
            Đội ngũ huấn luyện viên của studio
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--charcoal)", color: "var(--white)" }}
          onClick={() => setShowCreate(true)}
        >
          + Thêm HLV
        </button>
      </div>

      <CreateTrainerModal
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
        ) : !trainers?.length ? (
          <div className="p-12 text-center">
            <div className="text-3xl mb-3">🧘</div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--charcoal)" }}>
              Chưa có huấn luyện viên nào
            </p>
            <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
              Thêm huấn luyện viên để phân công lịch dạy
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
              {trainers.map((t: Trainer) => (
                <tr
                  key={t.id}
                  style={{ borderBottom: "1px solid var(--cream-dark)" }}
                  className="hover:bg-[var(--cream)] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ background: "var(--accent)", color: "var(--white)" }}
                      >
                        {t.full_name[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: "var(--charcoal)" }}>
                        {t.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>{t.email ?? "—"}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>{t.phone ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={
                        t.status === "active"
                          ? { background: "#EAF5EA", color: "#2E6B2E" }
                          : { background: "#FBF0F0", color: "#B94B4B" }
                      }
                    >
                      {t.status === "active" ? "Hoạt động" : "Vô hiệu"}
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
