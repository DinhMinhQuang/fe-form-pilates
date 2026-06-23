export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--cream)" }}
    >
      {/* Left panel - branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12"
        style={{ background: "var(--charcoal)", color: "var(--white)" }}
      >
        <div>
          <div className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: "var(--warm-gray-light)" }}>
            Studio Management
          </div>
          <div className="text-2xl font-semibold tracking-wide">FORM Pilates</div>
        </div>
        <div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--warm-gray-light)" }}>
            "Movement is medicine. Every session, every student, every moment — managed with intention."
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
