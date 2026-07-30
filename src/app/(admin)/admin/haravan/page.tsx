"use client";

import { useState } from "react";
import useSWR from "swr";
import { adminHaravanApi } from "@/lib/api";
import type { HaravanProductMapping } from "@/types";
import ErrorBox from "@/components/ErrorBox";
import EmptyRow from "@/components/EmptyRow";
import Btn from "@/components/Btn";

const PAGE_SIZE = 10;

export default function AdminHaravanPage() {
  const [cursors, setCursors] = useState<string[]>([]);
  const cursor = cursors[cursors.length - 1];

  const { data: mappings, isLoading, error, mutate } = useSWR(
    ["/admin/haravan/product-mappings", cursor],
    () => adminHaravanApi.listMappings({ limit: PAGE_SIZE, cursor }),
  );

  function goNext() {
    if (mappings?.nextCursor) setCursors((c) => [...c, mappings.nextCursor!]);
  }

  function goPrev() {
    setCursors((c) => c.slice(0, -1));
  }

  function refresh() {
    setCursors([]);
    mutate();
  }

  async function toggleActive(m: HaravanProductMapping) {
    await adminHaravanApi.updateMapping(m.id, { active: !m.active });
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--charcoal)" }}>Haravan</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--warm-gray)" }}>Đồng bộ sản phẩm Haravan với gói credits</p>
        </div>
      </div>

      {error && <div className="mb-4"><ErrorBox error={error} onRetry={() => refresh()} /></div>}

      <div className="rounded-xl border overflow-hidden" style={{ background: "var(--white)", borderColor: "var(--sand)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Gói credits</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>SKU</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Haravan Variant ID</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Chi nhánh</th>
              <th className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--warm-gray)" }}>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-sm text-center" style={{ color: "var(--warm-gray-light)" }}>Đang tải...</td></tr>
            ) : !mappings?.length ? (
              <EmptyRow colSpan={6} message="Chưa có mapping nào" />
            ) : mappings.map((m: HaravanProductMapping) => (
              <tr key={m.id} style={{ borderBottom: "1px solid var(--cream-dark)" }} className="hover:bg-[var(--cream)] transition-colors group">
                <td className="px-5 py-3.5 font-medium" style={{ color: "var(--charcoal)" }}>{m.package_name}</td>
                <td className="px-5 py-3.5 font-mono text-xs" style={{ color: "var(--warm-gray)" }}>{m.haravan_sku ?? "—"}</td>
                <td className="px-5 py-3.5 font-mono text-xs" style={{ color: "var(--warm-gray)" }}>{m.haravan_variant_id}</td>
                <td className="px-5 py-3.5" style={{ color: "var(--warm-gray)" }}>{m.branch_name ?? "Tất cả"}</td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={m.active ? { background: "#EAF5EA", color: "#2E6B2E" } : { background: "#FBF0F0", color: "#B94B4B" }}>
                    {m.active ? "Hoạt động" : "Tắt"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Btn variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" onClick={() => toggleActive(m)}>
                    {m.active ? "Tắt" : "Bật"}
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Btn variant="ghost" size="sm" onClick={goPrev} disabled={!cursors.length || isLoading}>← Trước</Btn>
        <Btn variant="ghost" size="sm" onClick={goNext} disabled={!mappings?.nextCursor || isLoading}>Tiếp →</Btn>
      </div>
    </div>
  );
}
