import Link from "next/link";
import { TrendingUp, BookOpen, Wrench, Database } from "lucide-react";
import { getCompletionStats } from "@/lib/progress";

const footerLinks = [
  { href: "/learn", label: "Học tập", icon: BookOpen },
  { href: "/tools", label: "Công cụ", icon: Wrench },
  { href: "/roadmap", label: "Lộ trình", icon: TrendingUp },
  { href: "/resources", label: "Tri thức", icon: Database },
];

export function Footer() {
  const stats = getCompletionStats();

  return (
    <footer className="relative border-t border-slate-800/80 bg-slate-950/95 mt-auto">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-teal-500">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">LogIQ</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Nền tảng học Logistics & Supply Chain Management chuyên nghiệp.
              Bởi Brian Bach Truong.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Điều hướng
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <link.icon className="h-3 w-3" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Thống kê nền tảng
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Module", value: String(stats.moduleCount) },
                { label: "Bài học", value: String(stats.totalLessons) },
                { label: "Tri thức", value: String(stats.knowledgeCount) },
                { label: "Công cụ", value: String(stats.toolCount) },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                  <p className="text-lg font-bold text-blue-400 font-mono">{stat.value}</p>
                  <p className="text-[10px] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600">
          <p>© 2026 LogIQ — Brian Bach Truong. All rights reserved.</p>
          <p className="font-mono text-slate-500">
            Tiến độ học: {stats.completedLessons}/{stats.totalLessons} bài ({stats.percent}%)
          </p>
        </div>
      </div>
    </footer>
  );
}