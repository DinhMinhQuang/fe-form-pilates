"use client";

import useSWR from "swr";
import { studentApi } from "@/lib/api";

export default function BookingsPage() {
  const { data: bookings, isLoading } = useSWR("/me/bookings", studentApi.myBookings);

  if (isLoading) {
    return <p className="text-stone-400 text-sm">Đang tải...</p>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900 mb-4">Đặt chỗ của tôi</h2>
      {/* TODO: implement bookings list */}
      <pre className="text-xs text-stone-400">{JSON.stringify(bookings, null, 2)}</pre>
    </div>
  );
}
