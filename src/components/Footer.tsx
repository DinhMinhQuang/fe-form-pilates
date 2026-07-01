export default function Footer() {
  return (
    <footer style={{ background: "var(--white)", borderTop: "1px solid var(--sand)" }}>
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Col 1 — About */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--charcoal)" }}>
            Về Form Pilates
          </h3>
          <div className="w-6 mb-4" style={{ borderTop: "2px solid var(--sand)" }} />

          <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-start">
              {/* Building icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0 mt-0.5" style={{ color: "var(--warm-gray)" }}>
                <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M9 22V12h6v10M3 9h18" />
              </svg>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--charcoal)" }}>FORM PILATES STUDIO</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--warm-gray)" }}>
                  Mã số thuế: [Điền MST]<br />
                  Cấp bởi Sở KH&ĐT TP. HCM
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              {/* Location icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0 mt-0.5" style={{ color: "var(--warm-gray)" }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: "var(--warm-gray)" }}>
                [Địa chỉ studio], TP. Hồ Chí Minh, Việt Nam
              </p>
            </div>

            <div className="flex gap-3 items-center">
              {/* Phone icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0" style={{ color: "var(--warm-gray)" }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <p className="text-xs" style={{ color: "var(--warm-gray)" }}>
                <strong style={{ color: "var(--charcoal)" }}>Hotline:</strong> [Số điện thoại]
              </p>
            </div>

            <div className="flex gap-3 items-center">
              {/* Email icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0" style={{ color: "var(--warm-gray)" }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
              <p className="text-xs" style={{ color: "var(--warm-gray)" }}>
                <strong style={{ color: "var(--charcoal)" }}>Email:</strong> [email@formpilates.vn]
              </p>
            </div>
          </div>
        </div>

        {/* Col 2 — Info links */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--charcoal)" }}>
            Thông tin
          </h3>
          <div className="w-6 mb-4" style={{ borderTop: "2px solid var(--sand)" }} />

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              "Điều khoản sử dụng",
              "FAQs",
              "Chính sách thành viên",
              "Tuyển dụng",
              "Chính sách bảo mật",
            ].map((label) => (
              <a
                key={label}
                href="#"
                className="text-xs transition-colors"
                style={{ color: "var(--warm-gray)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--charcoal)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--warm-gray)")}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--warm-gray)" }}>
              Mạng xã hội
            </p>
            <div className="flex gap-2">
              {/* Facebook */}
              <a
                href="#"
                className="flex items-center justify-center transition-colors"
                style={{ width: 36, height: 36, border: "1px solid var(--sand)", color: "var(--warm-gray)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--charcoal)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                className="flex items-center justify-center transition-colors"
                style={{ width: 36, height: 36, border: "1px solid var(--sand)", color: "var(--warm-gray)" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--charcoal)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--sand)")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Col 3 — Hours */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--charcoal)" }}>
            Giờ hoạt động
          </h3>
          <div className="w-6 mb-4" style={{ borderTop: "2px solid var(--sand)" }} />

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--warm-gray)" }}>Thứ Hai – Thứ Sáu</span>
              <span className="font-semibold" style={{ color: "var(--charcoal)" }}>6:00 – 20:30</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--warm-gray)" }}>Thứ Bảy – Chủ Nhật</span>
              <span className="font-semibold" style={{ color: "var(--charcoal)" }}>7:00 – 12:30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="px-6 py-4 flex items-center justify-center"
        style={{ background: "var(--charcoal)" }}
      >
        <p className="text-xs" style={{ color: "var(--warm-gray-light)", letterSpacing: "0.04em" }}>
          © {new Date().getFullYear()} FORM Pilates. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
