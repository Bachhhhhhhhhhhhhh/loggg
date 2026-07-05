"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, TrendingUp, User, Clock, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { MarketTicker } from "./MarketTicker";
import { CommandPaletteTrigger } from "./CommandPalette";
import { useCommandPaletteContext } from "./CommandPaletteContext";
import { getCompletionStats } from "@/lib/progress";

const navItems = [
  { href: "/", label: "Tổng quan" },
  { href: "/notebook", label: "Notebook", highlight: true },
  { href: "/roadmap", label: "Lộ trình học" },
  { href: "/learn", label: "Học tập" },
  { href: "/tools", label: "Công cụ" },
  { href: "/incoterms", label: "Incoterms" },
  { href: "/resources", label: "Tri thức" },
  { href: "/about", label: "Về tác giả" },
];

function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
      <Clock className="h-3 w-3" />
      <span suppressHydrationWarning>{time ?? "--:--:--"}</span>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { percent } = getCompletionStats();
  const { setOpen: setCommandOpen } = useCommandPaletteContext();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-shadow duration-300",
        scrolled && "shadow-lg shadow-black/20"
      )}
    >
      <div
        className={cn(
          "border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all",
          scrolled && "bg-slate-950/98"
        )}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-14 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold gradient-text">LogIQ</span>
                <p className="text-[10px] text-slate-600 leading-none font-mono">
                  Logistics Intelligence
                </p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "text-blue-400 bg-blue-500/10"
                        : "highlight" in item && item.highlight
                          ? "text-teal-400/90 hover:text-teal-300 hover:bg-teal-500/10"
                          : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                  >
                    {"highlight" in item && item.highlight && (
                      <BookMarked className="inline h-3 w-3 mr-1 -mt-0.5" />
                    )}
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2.5">
              <LiveClock />

              <CommandPaletteTrigger onClick={() => setCommandOpen(true)} />

              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-slate-700">
                  <User className="h-3 w-3 text-slate-400" />
                </div>
                <div className="w-16">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>Tiến độ</span>
                    <span className="text-blue-400 font-semibold font-mono">{percent}%</span>
                  </div>
                  <Progress value={percent} className="h-1" />
                </div>
              </div>

              <button
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden border-t border-slate-800/60 py-2 pb-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setCommandOpen(true);
                  closeMobile();
                }}
                className="w-full mx-1 flex items-center gap-2 h-9 px-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-500"
              >
                Tìm kiếm nhanh (⌘K)
              </button>
              <nav className="space-y-0.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={cn(
                      "block px-3 py-2.5 text-sm rounded-lg transition-colors",
                      pathname === item.href
                        ? "text-blue-400 bg-blue-500/10"
                        : "text-slate-400 hover:bg-slate-800/50"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
      <MarketTicker />
    </header>
  );
}