"use client";

import useSWR from "swr";
import { studentApi } from "@/lib/api";
import type { CreditLot } from "@/types";
import ErrorBox from "@/components/ErrorBox";

const LOT_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: "Đang dùng", bg: "#EAF5EA", color: "#2E6B2E" },
  frozen: { label: "Tạm dừng",  bg: "#FEF9E7", color: "#7A5C00" },
  void:   { label: "Hết hạn",   bg: "#FBF0F0", color: "#B94B4B" },
};

export default function CreditsPage() {
  const { data: credits, isLoading, error, mutate } = useSWR("/me/credits", studentApi.myCredits);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>Số buổi</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>Gói tập và số buổi còn lại</p>
      </div>

      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

      {isLoading ? (
        <p className="text-sm" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</p>
      ) : !credits ? null : (
        <>
          {/* Summary card */}
          <div
            className="rounded-xl px-6 py-5 mb-6 flex items-center justify-between"
            style={{ background: "var(--charcoal)", color: "var(--white)" }}
          >
            <div>
              <div className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--warm-gray-light)" }}>
                Tổng số buổi còn lại
              </div>
              <div className="text-4xl font-semibold">{credits.total_remaining}</div>
            </div>
            <div className="text-xs text-right" style={{ color: "var(--warm-gray-light)" }}>
              {credits.lots.filter((l) => l.status === "active").length} gói đang hoạt động
            </div>
          </div>

          {/* Lots list */}
          {credits.lots.length === 0 ? (
            <div className="rounded-xl border py-10 text-center text-sm" style={{ borderColor: "var(--sand)", background: "var(--white)", color: "var(--warm-gray-light)" }}>
              Chưa có gói tập nào
            </div>
          ) : (
            <div className="rounded-xl border overflow-hidden" style={{ background: "var(--white)", borderColor: "var(--sand)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Gói tập</th>
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Còn lại</th>
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Hết hạn</th>
                    <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {credits.lots.map((lot: CreditLot) => {
                    const s = LOT_STATUS[lot.status] ?? { label: lot.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
                    return (
                      <tr key={lot.id} style={{ borderBottom: "1px solid var(--cream-dark)" }}>
                        <td className="px-5 py-3.5 font-medium" style={{ color: "var(--charcoal)" }}>{lot.package_name}</td>
                        <td className="px-5 py-3.5" style={{ color: "var(--charcoal)" }}>
                          {lot.sessions_remaining}
                          <span className="text-xs ml-1" style={{ color: "var(--warm-gray-light)" }}>/ {lot.sessions_total}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: "var(--warm-gray)" }}>
                          {new Date(lot.expires_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
