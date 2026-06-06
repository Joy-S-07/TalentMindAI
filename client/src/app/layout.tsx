import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { BGPattern } from "@/components/ui/bg-pattern";

export const metadata: Metadata = {
  title: "TalentMind AI",
  description: "Intelligent Candidate Ranking Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#030303] text-white overflow-x-hidden relative">
        <BGPattern variant="grid" mask="fade-edges" fill="#ffffff15" size={64} className="fixed inset-0 z-[-50]" />
        {children}
      </body>
    </html>
  );
}
