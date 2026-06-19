import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PM Pixel Simulator",
  description: "项目管理像素模拟器",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
