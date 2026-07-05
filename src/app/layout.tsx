import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandPaletteProvider } from "@/components/layout/CommandPaletteContext";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
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
  title: "LogIQ — Logistics Intelligence Platform",
  description:
    "Nền tảng học Logistics & Supply Chain tối tân: Notebook AI, 32 chủ đề tri thức, công cụ tương tác, dashboard chuyên nghiệp. Bởi Brian Bach Truong.",
  keywords: [
    "logistics",
    "supply chain",
    "EOQ",
    "ABC analysis",
    "inventory management",
    "notebook AI",
    "Incoterms",
    "demand forecasting",
  ],
  openGraph: {
    title: "LogIQ — Logistics Intelligence Platform",
    description: "Học Logistics & Supply Chain — Notebook AI, tri thức chuyên sâu, công cụ thực hành",
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogIQ — Logistics Intelligence",
    description: "Nền tảng SCM học tập & AI notebook",
  },
};

export const viewport: Viewport = {
  themeColor: "#060a12",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrains.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col terminal-bg text-slate-200 selection:bg-blue-500/30">
        <CommandPaletteProvider>
          <ScrollProgress />
          <Navbar />
          <main className="flex-1 relative z-[1]">{children}</main>
          <Footer />
        </CommandPaletteProvider>
      </body>
    </html>
  );
}