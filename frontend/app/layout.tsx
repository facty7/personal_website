import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MentorSyc Survey",
  description: "Human study portal for LLM research mentorship feedback.",
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
