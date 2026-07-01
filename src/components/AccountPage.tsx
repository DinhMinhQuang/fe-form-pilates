"use client";

import useSWR from "swr";
import { meApi } from "@/lib/api";

const ROLE_LABEL: Record<string, string> = {
  student: "Học viên",
  trainer: "Huấn luyện viên",
  admin:   "Quản trị viên",
};

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-4" style={{ borderBottom: "1px solid var(--cream-dark)" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--warm-gray)" }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: value ? "var(--charcoal)" : "var(--warm-gray-light)" }}>
        {value ?? "—"}
      </p>
    </div>
  );
}

export default function AccountPage() {
  const { data: user, isLoading } = useSWR("/me", meApi.profile);

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-widest uppercase" style={{ color: "var(--charcoal)" }}>
          Tài khoản
        </h1>
        <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: "var(--warm-gray)" }}>
          Thông tin cá nhân
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-4 animate-pulse" style={{ borderBottom: "1px solid var(--cream-dark)" }}>
              <div className="h-3 w-20 rounded mb-2" style={{ background: "var(--cream-dark)" }} />
              <div className="h-4 w-40 rounded" style={{ background: "var(--cream-dark)" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--white)", border: "1px solid var(--sand)" }}>
          {/* Avatar block */}
          <div className="flex items-center gap-4 p-5" style={{ borderBottom: "1px solid var(--sand)", background: "var(--cream)" }}>
            <span
              className="flex items-center justify-center rounded-full font-bold flex-shrink-0"
              style={{ width: 52, height: 52, background: "var(--olive)", color: "var(--white)", fontSize: 18, letterSpacing: "0.05em" }}
            >
              {user?.full_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
            </span>
            <div>
              <p className="font-semibold text-base" style={{ color: "var(--charcoal)" }}>{user?.full_name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--warm-gray)" }}>
                {ROLE_LABEL[user?.role ?? ""] ?? user?.role}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="px-5">
            <Field label="Họ và tên"    value={user?.full_name} />
            <Field label="Email"        value={user?.email} />
            <Field label="Số điện thoại" value={user?.phone} />
            <Field label="Trạng thái"   value={user?.status === "active" ? "Đang hoạt động" : "Đã vô hiệu hoá"} />
          </div>
        </div>
      )}
    </div>
  );
}
