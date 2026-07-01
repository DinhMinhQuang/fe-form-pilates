"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "ghost" | "danger";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

const base =
  "inline-flex items-center justify-center font-medium rounded-lg border-0 cursor-pointer select-none transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

const variants: Record<Variant, string> = {
  primary: "bg-[var(--charcoal)] text-[var(--white)] hover:-translate-y-px hover:shadow-[0_3px_10px_rgba(28,28,28,0.18)]",
  accent:  "bg-[var(--accent)] text-[var(--white)] hover:-translate-y-px hover:bg-[var(--accent-dark)] hover:shadow-[0_3px_10px_rgba(196,144,106,0.3)]",
  ghost:   "border border-[var(--sand)] text-[var(--warm-gray)] bg-transparent hover:bg-[var(--cream)] hover:border-[var(--warm-gray-light)] hover:text-[var(--charcoal)]",
  danger:  "text-[#B94B4B] bg-transparent hover:bg-[#FBF0F0]",
};

export default function Btn({ variant = "primary", size = "md", className = "", ...props }: BtnProps) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
