function getMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    const msg = e.message ?? e.error ?? e.detail;
    if (typeof msg === "string") return msg;
  }
  return "Có lỗi xảy ra. Vui lòng thử lại.";
}

export default function FormError({ error }: { error: unknown }) {
  const message = getMessage(error);
  if (!message) return null;
  return (
    <div
      className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
      style={{ background: "#FBF0F0", border: "1px solid #F0CECE", color: "#B94B4B" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
