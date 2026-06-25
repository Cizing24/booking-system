import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "通用型預約系統",
  description: "一個乾淨、可擴充的 Next.js 預約系統 MVP。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}