"use client";

import * as Popover from "@radix-ui/react-popover";
import { DayPicker, type Matcher } from "react-day-picker";
import { vi } from "react-day-picker/locale";
import { dateInputToLocalDate, toDateInputValue } from "@/lib/date";

interface Props {
  value: string; // "YYYY-MM-DD", or "" for empty
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Earliest selectable date ("YYYY-MM-DD") — e.g. pass the paired "from" value on a "to" field. */
  fromDate?: string;
  /** Latest selectable date ("YYYY-MM-DD") — e.g. pass the paired "to" value on a "from" field. */
  toDate?: string;
}

const triggerClass =
  "appearance-none w-full flex items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors text-left";
const triggerStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

const dayPickerClassNames = {
  root: "p-3",
  months: "flex flex-col gap-2",
  month: "flex flex-col gap-2",
  month_caption: "flex items-center justify-center h-8 text-sm font-semibold",
  caption_label: "",
  nav: "flex items-center justify-between absolute inset-x-1 top-1 h-8",
  button_previous: "w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--cream)] transition-colors",
  button_next: "w-7 h-7 flex items-center justify-center rounded-md hover:bg-[var(--cream)] transition-colors",
  month_grid: "border-collapse",
  weekdays: "flex",
  weekday: "w-8 h-8 text-xs font-medium flex items-center justify-center",
  weeks: "",
  week: "flex",
  day: "w-8 h-8 p-0 text-center align-middle rounded-full",
  day_button: "w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors hover:bg-[var(--cream)]",
  today: "font-semibold",
  selected: "",
  outside: "opacity-40",
  disabled: "opacity-30 cursor-not-allowed",
};

// Class-based color (even with `!important`) was getting inconsistently
// overridden — inline styles via modifiersStyles always win, so use that
// instead of fighting DayPicker's own classes for the selected-day color.
const selectedStyle = { backgroundColor: "var(--accent)", color: "var(--white)" };

export default function DatePicker({ value, onChange, placeholder, className, disabled, fromDate, toDate }: Props) {
  const selected = value ? dateInputToLocalDate(value) : undefined;
  const matchers: Matcher[] = [];
  if (fromDate) matchers.push({ before: dateInputToLocalDate(fromDate) });
  if (toDate) matchers.push({ after: dateInputToLocalDate(toDate) });

  return (
    <Popover.Root>
      <Popover.Trigger asChild disabled={disabled}>
        <button type="button" className={`${triggerClass} ${className ?? ""}`} style={triggerStyle}>
          <span style={!value ? { color: "var(--warm-gray-light)" } : undefined}>
            {value ? new Date(value).toLocaleDateString("vi-VN") : (placeholder ?? "Chọn ngày")}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "var(--warm-gray)", flexShrink: 0 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
            <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 rounded-lg border shadow-lg"
          style={{ background: "var(--white)", borderColor: "var(--sand)" }}
        >
          <DayPicker
            mode="single"
            locale={vi}
            selected={selected}
            onSelect={(d) => onChange(d ? toDateInputValue(d) : "")}
            disabled={matchers.length ? matchers : undefined}
            classNames={dayPickerClassNames}
            modifiersStyles={{ selected: selectedStyle }}
            styles={{ chevron: { fill: "var(--warm-gray)" } }}
          />
          {value && (
            <div className="px-3 pb-3 -mt-1">
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs underline"
                style={{ color: "var(--warm-gray)" }}
              >
                Xoá ngày đã chọn
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
