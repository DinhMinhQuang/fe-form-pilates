"use client";

import { useState } from "react";
import useSWR from "swr";
import { trainerApi } from "@/lib/api";

export default function TrainerPage() {
  const { data: sessions, isLoading } = useSWR(
    "/trainer/sessions",
    trainerApi.sessions,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: students } = useSWR(
    selectedId ? `/trainer/sessions/${selectedId}/students` : null,
    () => trainerApi.students(selectedId!),
  );

  if (isLoading) {
    return <p className="text-stone-400 text-sm">Đang tải lịch dạy...</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-4">Lịch dạy</h2>
      {/* TODO: implement trainer schedule + attendance */}
      <pre className="text-xs text-stone-400">
        {JSON.stringify({ sessions, selectedId, students }, null, 2)}
      </pre>
    </div>
  );
}
