import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "FORM Pilates",
  description: "Hệ thống quản lý lịch học FORM Pilates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist)] antialiased">
        {children}
      </body>
    </html>
  );
}
