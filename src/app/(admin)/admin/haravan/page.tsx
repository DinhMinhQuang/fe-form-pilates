"use client";

import useSWR from "swr";
import { adminHaravanApi } from "@/lib/api";
import type { HaravanProductMapping } from "@/types";

export default function AdminHaravanPage() {
  const { data: mappings, isLoading } = useSWR("/admin/haravan/product-mappings", adminHaravanApi.listMappings);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>
            Haravan
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>
            Đồng bộ sản phẩm Haravan với gói credits
          </p>
        </div>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--white)", borderColor: "var(--sand)" }}
      >
        {isLoading ? (
          <div className="p-8 text-center text-sm" style={{ color: "var(--warm-gray-light)" }}>
            Đang tải...
          </div>
        ) : !mappings?.length ? (
          <div className="p-12 text-center">
            <div className="text-3xl mb-3">🔗</div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--charcoal)" }}>
              Chưa có mapping nào
            </p>
            <p className="text-xs" style={{ color: "var(--warm-gray-light)" }}>
              Kết nối sản phẩm Haravan với gói credits của studio
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Gói credits</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Haravan Variant ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Chi nhánh</th>
                <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m: HaravanProductMapping) => (
                <tr
                  key={m.id}
                  style={{ borderBottom: "1px solid var(--cream-dark)" }}
                  className="hover:bg-[var(--cream)] transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium" style={{ color: "var(--charcoal)" }}>{m.package_name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs" style={{ color: "var(--warm-gray)" }}>{m.haravan_variant_id}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>{m.branch_name ?? "Tất cả"}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={
                        m.active
                          ? { background: "#EAF5EA", color: "#2E6B2E" }
                          : { background: "#FBF0F0", color: "#B94B4B" }
                      }
                    >
                      {m.active ? "Hoạt động" : "Tắt"}
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
