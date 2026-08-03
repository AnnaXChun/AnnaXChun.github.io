import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "椿襄｜软件开发工程师与多面个人档案",
  description:
    "椿襄的三维互动个人档案，展示人工智能原生研发、高并发后端与智能体工程，也记录 ENFP、羽毛球、健身和视频剪辑构成的多面生活。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${sans.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
