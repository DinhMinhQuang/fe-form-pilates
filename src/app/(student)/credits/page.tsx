"use client";

import useSWR from "swr";
import { studentApi } from "@/lib/api";

export default function CreditsPage() {
  const { data: credits, isLoading } = useSWR("/me/credits", studentApi.myCredits);

  if (isLoading) {
    return <p className="text-stone-400 text-sm">Đang tải...</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-4">Số buổi còn lại</h2>
      {/* TODO: implement credits view */}
      <pre className="text-xs text-stone-400">{JSON.stringify(credits, null, 2)}</pre>
    </div>
  );
}
