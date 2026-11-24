"use client";

import { useState } from "react";
import DatePicker from "@/components/DatePicker";

interface Props {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}

export default function SessionDateTimeField({ label, required, value, onChange }: Props) {
  // Keep the other half visible while the user clears or re-enters a date or time.
  const [partial, setPartial] = useState({ date: "", time: "" });
  const [date, time] = value ? value.split("T") : [partial.date, partial.time];

  function change(nextDate: string, nextTime: string) {
    if (nextDate && nextTime) {
      onChange(`${nextDate}T${nextTime}`);
    } else {
      setPartial({ date: nextDate, time: nextTime });
      onChange("");
    }
  }

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-[var(--warm-gray)]">
        {label}{required && <span className="text-[var(--accent)]"> *</span>}
      </legend>
      <DatePicker value={date} onChange={(day) => change(day, time)} />
      <input
        type="time"
        aria-label={`Giờ ${label.toLowerCase()}`}
        className="mt-1.5 w-full rounded-lg border border-[var(--sand)] bg-[var(--cream)] px-3.5 py-2.5 text-sm text-[var(--charcoal)] focus:border-[var(--accent)]"
        value={time}
        onChange={(event) => change(date, event.target.value)}
      />
    </fieldset>
  );
}
