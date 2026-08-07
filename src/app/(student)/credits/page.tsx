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

function ProgressBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.round(((total - used) / total) * 100) : 0;
  const color = pct > 50 ? "#2E6B2E" : pct > 20 ? "#7A5C00" : "#B94B4B";
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cream-dark)" }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs flex-shrink-0" style={{ color: "var(--warm-gray-light)" }}>{pct}%</span>
    </div>
  );
}

export default function CreditsPage() {
  const { data: credits, isLoading, error, mutate } = useSWR("/me/credits", studentApi.myCredits);

  return (
    <div className="max-w-2xl">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--charcoal)" }}>Số buổi</h1>
        <p className="text-sm mt-1" style={{ color: "var(--warm-gray)" }}>Gói tập và số buổi còn lại</p>
      </div>

      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => mutate()} /></div>}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <div className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--cream-dark)" }} />
          {[1, 2].map((i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--cream-dark)" }} />)}
        </div>
      ) : !credits ? null : (
        <div className="flex flex-col gap-4">
          {/* Summary */}
          <div className="rounded-2xl px-6 py-5 flex items-center justify-between" style={{ background: "var(--olive)", color: "var(--white)" }}>
            <div>
              <div className="text-xs tracking-widest uppercase mb-1.5" style={{ color: "var(--warm-gray-light)", opacity: 0.8 }}>
                Tổng số buổi còn lại
              </div>
              <div className="text-4xl font-semibold">{credits.total_remaining}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold" style={{ color: "var(--cream)" }}>
                {credits.lots.filter((l) => l.status === "active").length}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray-light)", opacity: 0.8 }}>gói đang hoạt động</div>
            </div>
          </div>

          {/* Lots */}
          {credits.lots.length === 0 ? (
            <div className="rounded-2xl border py-14 text-center text-sm" style={{ borderColor: "var(--sand)", background: "var(--white)", color: "var(--warm-gray)" }}>
              Chưa có gói tập nào
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {credits.lots.map((lot: CreditLot) => {
                const s = LOT_STATUS[lot.status] ?? { label: lot.status, bg: "var(--cream-dark)", color: "var(--charcoal)" };
                const used = lot.sessions_total - lot.sessions_remaining;
                return (
                  <div key={lot.id} className="rounded-2xl border px-5 py-4" style={{ background: "var(--white)", borderColor: "var(--sand)" }}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: "var(--charcoal)" }}>{lot.package_name}</div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray)" }}>
                          Hết hạn {new Date(lot.expires_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--warm-gray)" }}>
                          Áp dụng: {lot.branch_name ?? "Mọi chi nhánh"}
                        </div>
                        <ProgressBar used={used} total={lot.sessions_total} />
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-semibold" style={{ color: "var(--charcoal)" }}>{lot.sessions_remaining}</div>
                        <div className="text-xs" style={{ color: "var(--warm-gray-light)" }}>/ {lot.sessions_total}</div>
                        <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
