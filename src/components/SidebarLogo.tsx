interface Props {
  role?: "admin" | "trainer" | "student";
}

const ROLE_LABEL: Record<string, string> = {
  admin:   "Quản trị",
  trainer: "Huấn luyện viên",
  student: "Học viên",
};

export default function SidebarLogo({ role }: Props) {
  return (
    <div className="px-5 pt-7 pb-6 border-b" style={{ borderColor: "var(--charcoal-soft)" }}>
      {/* SVG logo — form-icon fills white */}
        <div className="mb-1 -mx-1">
        <img
          src="/logo-full.svg"
          alt="FORM Pilates"
          style={{ width: 180, height: "auto", filter: "brightness(0) invert(1)", opacity: 0.9 }}
        />
      </div>
      {role && (
        <div className="text-xs tracking-widest uppercase" style={{ color: "var(--warm-gray-light)" }}>
          {ROLE_LABEL[role]}
        </div>
      )}
    </div>
  );
}
