import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORM Pilates",
  description: "Hệ thống quản lý lịch học FORM Pilates",
  icons: { icon: "/favicon-32x32.png", shortcut: "/favicon-32x32.png", apple: "/icon-180.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
