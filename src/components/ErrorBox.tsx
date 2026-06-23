interface ErrorBoxProps {
  error: unknown;
  onRetry?: () => void;
}

function getMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    const msg = e.message ?? e.error ?? e.detail;
    if (typeof msg === "string") return msg;
  }
  return "Có lỗi xảy ra. Vui lòng thử lại.";
}

export default function ErrorBox({ error, onRetry }: ErrorBoxProps) {
  return (
    <div
      className="rounded-xl border px-5 py-4 flex items-start gap-3"
      style={{ background: "#FBF0F0", borderColor: "#F0CECE" }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#B94B4B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0 mt-0.5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "#B94B4B" }}>
          {getMessage(error)}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs mt-1.5 underline underline-offset-2"
            style={{ color: "#B94B4B" }}
          >
            Thử lại
          </button>
        )}
      </div>
    </div>
  );
}
