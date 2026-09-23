"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Fill the whole screen on mobile — for long forms. */
  fullScreenMobile?: boolean;
}

export default function Modal({ title, open, onClose, children, fullScreenMobile }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  // Render via portal — modals (e.g. CancelBookingModal) are often opened
  // from inside another modal's <form> (e.g. EditSessionModal); without a
  // portal their own <form> would nest inside that ancestor <form> in the
  // DOM, which HTML disallows and breaks the inner submit button.
  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${fullScreenMobile ? "sm:p-4" : "p-4"}`}
      style={{ background: "rgba(28,28,28,0.4)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full flex flex-col shadow-xl ${fullScreenMobile ? "h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl" : "max-h-[90vh] max-w-md rounded-2xl"}`}
        style={{ background: "var(--white)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--sand)" }}
        >
          <h2 className="text-base font-semibold" style={{ color: "var(--charcoal)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--warm-gray)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
