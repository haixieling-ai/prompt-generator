import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "提示词生成器",
  description: "面向产品视觉创作的中英双语提示词生成器",
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
