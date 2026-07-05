"use client";

import { useCallback, useEffect, useMemo, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Database,
  Globe,
  Zap,
  BookMarked,
  TrendingUp,
  User,
  ArrowRight,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllLessons } from "@/data/modules";
import { searchKnowledge } from "@/data/knowledge";
import { incoterms } from "@/data/incoterms";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ResultItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  group: string;
  icon: ElementType;
};

const quickLinks: ResultItem[] = [
  { id: "home", title: "Tổng quan", subtitle: "Dashboard logistics", href: "/", group: "Điều hướng", icon: TrendingUp },
  { id: "notebook", title: "Notebook AI", subtitle: "Upload & chat thông minh", href: "/notebook", group: "Điều hướng", icon: BookMarked },
  { id: "learn", title: "Học tập", subtitle: "Module & bài học", href: "/learn", group: "Điều hướng", icon: BookOpen },
  { id: "tools", title: "Công cụ", subtitle: "EOQ, ABC, Simulator", href: "/tools", group: "Điều hướng", icon: Zap },
  { id: "resources", title: "Tri thức", subtitle: "32 chủ đề chuyên sâu", href: "/resources", group: "Điều hướng", icon: Database },
  { id: "incoterms", title: "Incoterms 2020", subtitle: "11 điều khoản", href: "/incoterms", group: "Điều hướng", icon: Globe },
  { id: "roadmap", title: "Lộ trình học", subtitle: "6 giai đoạn", href: "/roadmap", group: "Điều hướng", icon: TrendingUp },
  { id: "about", title: "Về tác giả", subtitle: "Brian Bach Truong", href: "/about", group: "Điều hướng", icon: User },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickLinks;

    const items: ResultItem[] = [];

    quickLinks
      .filter((l) => l.title.toLowerCase().includes(q) || l.subtitle.toLowerCase().includes(q))
      .forEach((l) => items.push(l));

    getAllLessons()
      .filter((l) => l.title.toLowerCase().includes(q) || l.moduleTitle.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach((l) =>
        items.push({
          id: `lesson-${l.moduleId}-${l.id}`,
          title: l.title,
          subtitle: l.moduleTitle,
          href: `/learn/${l.moduleId}/${l.id}`,
          group: "Bài học",
          icon: BookOpen,
        })
      );

    searchKnowledge(q)
      .slice(0, 6)
      .forEach((k) =>
        items.push({
          id: `knowledge-${k.id}`,
          title: k.title,
          subtitle: `${k.category} · ${k.difficulty}`,
          href: `/resources/${k.id}`,
          group: "Tri thức",
          icon: Database,
        })
      );

    incoterms
      .filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          t.fullName.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .forEach((t) =>
        items.push({
          id: `incoterm-${t.code}`,
          title: `${t.code} — ${t.fullName}`,
          subtitle: `Nhóm ${t.group}`,
          href: `/incoterms/${t.code.toLowerCase()}/`,
          group: "Incoterms",
          icon: Globe,
        })
      );

    return items;
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, ResultItem[]>();
    for (const r of results) {
      const list = map.get(r.group) ?? [];
      list.push(r);
      map.set(r.group, list);
    }
    return map;
  }, [results]);

  const flatResults = useMemo(() => Array.from(grouped.values()).flat(), [grouped]);

  const navigate = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQuery("");
      setActiveIndex(0);
      router.push(href);
    },
    [onOpenChange, router]
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && flatResults[activeIndex]) {
        e.preventDefault();
        navigate(flatResults[activeIndex].href);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, flatResults, activeIndex, navigate, onOpenChange]);

  if (!open) return null;

  let idx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm nhanh"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700/60 bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 border-b border-slate-800/80">
          <Search className="h-4 w-4 text-slate-500 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài học, tri thức, Incoterms, trang..."
            className="flex-1 h-12 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-[10px] text-slate-500 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {flatResults.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">Không tìm thấy kết quả</p>
          ) : (
            Array.from(grouped.entries()).map(([group, items]) => (
              <div key={group} className="mb-2">
                <p className="px-2 py-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  {group}
                </p>
                {items.map((item) => {
                  const currentIdx = idx++;
                  const isActive = currentIdx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setActiveIndex(currentIdx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                        isActive ? "bg-blue-500/15 border border-blue-500/20" : "hover:bg-slate-800/50 border border-transparent"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          isActive ? "bg-blue-500/20 text-blue-400" : "bg-slate-800/80 text-slate-500"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 font-medium truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                      </div>
                      {isActive && <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3 text-[10px] text-slate-600">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">↑↓</kbd>
              di chuyển
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">↵</kbd>
              mở
            </span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">{flatResults.length} kết quả</span>
        </div>
      </div>
    </div>
  );
}

export function CommandPaletteTrigger({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "hidden md:flex items-center gap-2 h-8 px-3 rounded-lg",
        "bg-slate-900/60 border border-slate-800/80 hover:border-slate-600/80",
        "text-xs text-slate-500 hover:text-slate-300 transition-all",
        className
      )}
    >
      <Search className="h-3.5 w-3.5" />
      <span>Tìm kiếm...</span>
      <kbd className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono">
        <Command className="h-2.5 w-2.5" />K
      </kbd>
    </button>
  );
}