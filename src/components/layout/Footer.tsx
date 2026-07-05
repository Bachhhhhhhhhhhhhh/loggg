import Link from "next/link";
import { TrendingUp, BookOpen, Wrench, Database, Globe, BookMarked, Sparkles } from "lucide-react";
import { getCompletionStats } from "@/lib/progress";
import { knowledgeStats } from "@/data/knowledge";

const footerLinks = [
  { href: "/notebook", label: "Notebook AI", icon: BookMarked },
  { href: "/learn", label: "Học tập", icon: BookOpen },
  { href: "/tools", label: "Công cụ", icon: Wrench },
  { href: "/roadmap", label: "Lộ trình", icon: TrendingUp },
  { href: "/incoterms", label: "Incoterms", icon: Globe },
  { href: "/resources", label: "Tri thức", icon: Database },
];

export function Footer() {
  const stats = getCompletionStats();

  return (
    <footer className="relative border-t border-slate-800/60 bg-slate-950/90 mt-auto backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 shadow-lg shadow-blue-500/20">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold gradient-text-static">LogIQ</span>
                <p className="text-[10px] text-slate-600 font-mono">v2026</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Logistics Intelligence Platform — học SCM chuyên nghiệp với AI, tri thức chuyên sâu và công cụ thực hành.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-live" />
              <span className="text-[10px] text-slate-600 font-mono">All systems operational</span>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Điều hướng
            </h3>
            <div className="grid grid-cols-1 gap-1.5">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-400 transition-colors py-1"
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Nền tảng
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Module", value: stats.moduleCount },
                { label: "Bài học", value: stats.totalLessons },
                { label: "Tri thức", value: knowledgeStats.topics },
                { label: "FAQ", value: knowledgeStats.faq },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center hover:border-slate-700/80 transition-colors"
                >
                  <p className="text-lg font-bold text-blue-400 font-mono">{s.value}</p>
                  <p className="text-[9px] text-slate-600">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Công nghệ
            </h3>
            <div className="space-y-2 text-[11px] text-slate-600">
              <p className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-teal-500" />
                Gemini AI · Hybrid RAG
              </p>
              <p>Next.js 16 · React 19</p>
              <p>Tailwind v4 · Framer Motion</p>
              <p className="pt-2 text-slate-500">
                Tiến độ: <span className="text-blue-400 font-mono">{stats.percent}%</span>
                {" "}({stats.completedLessons}/{stats.totalLessons} bài)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600">
          <p>© 2026 LogIQ — Brian Bach Truong</p>
          <p className="font-mono text-slate-500">Logistics Intelligence Platform</p>
        </div>
      </div>
    </footer>
  );
}