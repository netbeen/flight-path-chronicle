import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "飞行纪事 | Flight Path Chronicle",
  description: "查询职业生涯差旅行程，记录每一次飞行轨迹。",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✈️</text></svg>",
  },
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
