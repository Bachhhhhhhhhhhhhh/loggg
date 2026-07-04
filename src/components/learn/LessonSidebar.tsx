"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { Module } from "@/data/modules";

interface LessonSidebarProps {
  modules: Module[];
  activeModuleId: string;
  activeLessonId: string;
}

export function LessonSidebar({ modules, activeModuleId, activeLessonId }: LessonSidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completed = modules.reduce((s, m) => s + m.lessons.filter((l) => l.completed).length, 0);

  return (
    <aside className="w-full lg:w-72 shrink-0 border-r border-slate-800/60 bg-slate-950/50 backdrop-blur-sm overflow-y-auto lg:max-h-[calc(100vh-5.25rem)]">
      <div className="p-3 border-b border-slate-800/60 sticky top-0 bg-slate-950/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-3.5 w-3.5 text-blue-400" />
          <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Nội dung khóa học
          </h2>
        </div>
        <div className="flex justify-between text-[10px] text-slate-600 mb-1 font-mono">
          <span>{completed}/{totalLessons} bài</span>
          <span className="text-blue-400">{Math.round((completed / totalLessons) * 100)}%</span>
        </div>
        <Progress value={(completed / totalLessons) * 100} className="h-1" />
      </div>

      <div className="p-2 space-y-0.5">
        {modules.map((mod) => {
          const isOpen = collapsed[mod.id] !== true;
          const isActive = mod.id === activeModuleId;

          return (
            <div key={mod.id}>
              <button
                onClick={() => toggle(mod.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-left transition-all duration-200",
                  isActive
                    ? "bg-blue-500/5 border border-blue-500/10"
                    : "hover:bg-slate-800/40 border border-transparent"
                )}
              >
                {isOpen ? (
                  <ChevronDown className="h-3 w-3 text-slate-600 shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-300 truncate">{mod.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Progress value={mod.progress} className="h-0.5 flex-1" color="#14B8A6" />
                    <span className="text-[9px] text-slate-600 font-mono">{mod.progress}%</span>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="ml-3 space-y-0.5 pb-1 border-l border-slate-800/40 pl-2">
                  {mod.lessons.map((lesson) => {
                    const isLessonActive =
                      mod.id === activeModuleId && lesson.id === activeLessonId;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/learn/${mod.id}/${lesson.id}`}
                        className={cn(
                          "flex items-center gap-2 px-2 py-2 rounded-md text-[11px] transition-all duration-200",
                          isLessonActive
                            ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500 -ml-[9px] pl-[7px]"
                            : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                        )}
                      >
                        {lesson.completed ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="h-3 w-3 shrink-0 opacity-40" />
                        )}
                        <span className="truncate flex-1">{lesson.title}</span>
                        <span className="text-[9px] text-slate-700 shrink-0 font-mono">
                          {lesson.duration.replace(" phút", "m")}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}