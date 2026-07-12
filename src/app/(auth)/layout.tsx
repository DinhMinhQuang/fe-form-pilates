export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--cream)" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[400px] flex-shrink-0 p-12"
        style={{ background: "var(--olive)", color: "var(--white)" }}
      >
        <div>
          <img
            src="/logo-horizontal.svg"
            alt="FORM Pilates"
            style={{ width: 200, height: "auto", filter: "brightness(0) invert(1)", opacity: 0.9 }}
          />
        </div>
        <div>
          <p className="text-sm leading-relaxed italic" style={{ color: "var(--warm-gray-light)" }}>
            "Movement is medicine. Every session, every student, every moment — managed with intention."
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
