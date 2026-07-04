"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Menu, X, TrendingUp, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MarketTicker } from "./MarketTicker";
import { getAllLessons } from "@/data/modules";

const navItems = [
  { href: "/", label: "Tổng quan" },
  { href: "/roadmap", label: "Lộ trình học" },
  { href: "/learn", label: "Học tập" },
  { href: "/tools", label: "Công cụ" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lessons = getAllLessons();
  const searchResults =
    searchQuery.length > 1
      ? lessons
          .filter(
            (l) =>
              l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              l.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 6)
      : [];

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
                        : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                  >
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

              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                <Input
                  placeholder="Tìm bài học..."
                  className="w-44 pl-8 h-8 text-xs bg-slate-900/50 border-slate-800"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                />
                {searchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1.5 w-80 rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-800/60">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Kết quả tìm kiếm
                      </p>
                    </div>
                    {searchResults.map((r) => (
                      <Link
                        key={`${r.moduleId}-${r.id}`}
                        href={`/learn/${r.moduleId}/${r.id}`}
                        className="block px-3 py-2.5 hover:bg-slate-800/60 transition-colors border-b border-slate-800/30 last:border-0"
                      >
                        <p className="text-xs text-slate-200 font-medium">{r.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{r.moduleTitle}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-slate-700">
                  <User className="h-3 w-3 text-slate-400" />
                </div>
                <div className="w-16">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>Tiến độ</span>
                    <span className="text-blue-400 font-semibold font-mono">47%</span>
                  </div>
                  <Progress value={47} className="h-1" />
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
            <nav className="lg:hidden border-t border-slate-800/60 py-2 space-y-0.5 pb-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
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
          )}
        </div>
      </div>
      <MarketTicker />
    </header>
  );
}