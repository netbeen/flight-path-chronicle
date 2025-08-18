import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flight Path Chronicle",
  description: "Track your flight history on a world map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}