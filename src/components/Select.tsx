"use client";

import * as RadixSelect from "@radix-ui/react-select";

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const triggerClass =
  "appearance-none w-full flex items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-sm outline-none border transition-colors";
const triggerStyle = { borderColor: "var(--sand)", background: "var(--cream)", color: "var(--charcoal)" };

// Radix disallows an empty-string item value, but our forms often use "" for
// a default/placeholder option (e.g. "Tất cả trạng thái") — map it to a
// sentinel internally and translate back at the boundary.
const EMPTY = "__empty__";

export default function Select({ value, onChange, options, placeholder, className, disabled }: Props) {
  const selectedLabel = options.find((o) => o.value === value)?.label;
  return (
    <RadixSelect.Root
      value={value || EMPTY}
      onValueChange={(v) => onChange(v === EMPTY ? "" : v)}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        className={`${triggerClass} ${className ?? ""}`}
        style={triggerStyle}
      >
        {/* Radix only falls back to `placeholder` when its internal value is
            exactly "" — our EMPTY sentinel means that never happens for
            values with no matching option, so we render the label ourselves
            instead of relying on RadixSelect.Value's own placeholder logic. */}
        <RadixSelect.Value
          placeholder={placeholder}
          style={!selectedLabel ? { color: "var(--warm-gray-light)" } : undefined}
        >
          {selectedLabel ?? placeholder}
        </RadixSelect.Value>
        <RadixSelect.Icon>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ color: "var(--warm-gray)" }}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 overflow-hidden rounded-lg border shadow-lg"
          style={{ background: "var(--white)", borderColor: "var(--sand)", minWidth: "var(--radix-select-trigger-width)" }}
        >
          <RadixSelect.Viewport className="p-1 max-h-72">
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value}
                value={o.value || EMPTY}
                className="relative flex items-center rounded-md px-3 py-2 text-sm outline-none cursor-pointer select-none data-[highlighted]:bg-[var(--cream)] data-[state=checked]:font-medium"
                style={{ color: "var(--charcoal)" }}
              >
                <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
