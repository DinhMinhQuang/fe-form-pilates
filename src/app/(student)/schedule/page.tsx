"use client";

import useSWR from "swr";
import { studentApi, catalogApi } from "@/lib/api";

export default function SchedulePage() {
  const { data: sessions, isLoading } = useSWR("/sessions", () =>
    studentApi.sessions(),
  );
  const { data: branches } = useSWR("/branches", catalogApi.branches);

  if (isLoading) {
    return <p className="text-stone-400 text-sm">Đang tải lịch học...</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-4">Lịch học</h2>
      {/* TODO: implement schedule view */}
      <pre className="text-xs text-stone-400">{JSON.stringify({ sessions, branches }, null, 2)}</pre>
    </div>
  );
}
