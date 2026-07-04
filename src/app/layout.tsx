import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "LogIQ — Học Logistics & Supply Chain chuyên nghiệp",
  description:
    "Nền tảng học Logistics & Supply Chain Management một cách chuyên nghiệp và thực tiễn. Bởi Brian Bach Truong.",
  keywords: [
    "logistics",
    "supply chain",
    "EOQ",
    "ABC analysis",
    "inventory management",
    "linear programming",
  ],
  openGraph: {
    title: "LogIQ — Logistics Intelligence Platform",
    description: "Học Logistics & Supply Chain một cách chuyên nghiệp và thực tiễn",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrains.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col terminal-bg text-slate-200">
        <Navbar />
        <main className="flex-1 relative z-[1]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}